const billModel = require('../models/bill.model');
const contractModel = require('../models/contract.model');
const ErrorResponse = require('../helpers/ErrorResponse');
const billValid = require('../validations/bill.valid');
const paypal = require('../configs/paypal');
const typeRole = require('../constants/typeRole');
const { URL_SUCCESS, URL_CANCEL } = require('../constants/url.payment');
const factoryModel = require('../models/factory.model');
const { FactoryStatus } = require('../constants/factory.status');

module.exports = {
  getAllBillOfUser: async (req, res) => {
    let idContract = req.params.id;
    const bodyQuery = {
      idUser: req.account._id,
    };
    if (req.account.role === typeRole.ADMIN) {
      bodyQuery.idUser = req.query.id_user;
    }
    bodyQuery._id = idContract;
    const contract = await contractModel.findOne(bodyQuery);
    if (!contract) {
      throw new ErrorResponse(404, 'Không tìm thấy hợp đồng');
    }
    const bill = await billModel
      .find({ idContract: idContract })
      .sort('-createdAt');
    return res.status(200).json(bill);
  },
  createBill: async (req, res) => {
    const idUser = req.account._id;
    const { ...body } = req.body;
    const { value, error } = billValid(body);
    if (error) {
      throw new ErrorResponse(400, error.message);
    }
    const contract = await contractModel.findOne({
      _id: value.idContract,
      idUser,
    });
    if (!contract) {
      throw new ErrorResponse(400, 'not found contract');
    }
    if (!contract.isAccepted) {
      throw new ErrorResponse(400, 'hợp đồng chưa được duyệt hoặc đã kết thúc');
    }

    const bill = await billModel.create(value);
    const obj = [
      {
        name: bill.content,
        quantity: 1,
        price: bill.money,
        currency: 'USD',
      },
    ];

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: `${URL_SUCCESS}?id_contract=${bill.idContract}&money=${bill.money}`,
        cancel_url: `${URL_CANCEL}?id_bill=${bill._id}`,
      },
      transactions: [
        {
          item_list: {
            items: obj,
          },
          amount: {
            currency: 'USD',
            total: bill.money.toString(),
          },
          description: bill.content,
        },
      ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.log('Error pay: ' + error);
        res.json({
          statusCode: 500,
          message: 'Server Error When Create Payment',
        });
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            res.json(payment.links[i]);
          }
        }
      }
    });
  },
  responseBillSuccess: async (req, res) => {
    let idContract = req.query.id_contract;
    let money = req.query.money;

    let contract = await contractModel.findById(idContract);
    let factory = await factoryModel.findByIdAndUpdate(contract.idFactory, {
      status: FactoryStatus.BUSY,
      startDate: contract.startDate,
      endDate: contract.endDate,
    });

    let updatedContract = await contractModel.findByIdAndUpdate(
      idContract,
      { deposit: contract.deposit + Number(money) },
      { new: true },
    );

    return res.status(200).json({
      statusCode: 201,
      message: 'Payment success',
      money: money,
      contract: updatedContract,
    });
  },
  responseBillCancel: async (req, res) => {
    let idBill = req.query.id_bill;
    const result = await billModel.findOneAndDelete(idBill);
    res.status(500).json({
      statusCode: 500,
      message: 'Create Bill Fail',
      bill: result,
    });
  },
};
