const contractModel = require('../models/contract.model');
const ErrorResponse = require('../helpers/ErrorResponse');
const { PER_PAGE } = require('../constants/pagination');
const typeRole = require('../constants/typeRole');
const contractValid = require('../validations/contract.valid');
const emailSender = require('../helpers/emailSender');
const { URL_PAYMENT } = require('../constants/url.payment');
const sendMail = require('../helpers/emailSender');
const factoryModel = require('../models/factory.model');
const { FactoryStatus } = require('../constants/factory.status');

module.exports = {
  getAllContract: async (req, res) => {
    const account = req.account;
    const isAccepted = req.query.is_accepted; //đã duyệt
    const deposit = req.query.deposit; //đã cọc
    const isFinished = req.query.is_finished; //đã kết thúc
    const idFactory = req.query.id_factory; // lấy ra các hợp đồng theo id xưởng
    const page = req.query.page || 1; //page
    const idUser = req.query.id_user; //lấy ra các hợp đồng của user (cái này của admin)
    const idIndustrial = req.query.id_industrial; // lay ra cac hop dong trong industrial

    const optionPopulate = {
      path: 'idFactory',
      populate: {
        path: 'idIndustrial',
      },
    };
    if (idIndustrial) {
      optionPopulate.populate.match = {
        _id: idIndustrial,
      };
    }

    const bodyQuery = {};
    if (isAccepted) {
      bodyQuery.isAccepted = isAccepted;
    }
    if (deposit) {
      bodyQuery.deposit = deposit;
    }
    if (isFinished) {
      bodyQuery.isFinished = isFinished;
    }
    if (account.role === typeRole.USER) {
      bodyQuery.idUser = account._id;
    } else if (idUser) {
      bodyQuery.idUser = idUser;
    }
    if (idFactory) {
      bodyQuery.idFactory = idFactory;
    }

    const contractes = await contractModel
      .find(bodyQuery)
      .populate(optionPopulate)
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE)
      .sort('-createdAt')
      .exec();

    const count = await contractModel.countDocuments(bodyQuery);

    return res.status(200).json({
      page: +page,
      total_page: Math.ceil(count / PER_PAGE),
      per_page: PER_PAGE,
      contractes: contractes,
    });
  },
  createContract: async (req, res) => {
    const idUser = req.account._id;
    const { value, error } = contractValid(req.body);
    if (error) {
      throw new ErrorResponse(400, error.message);
    }
    value.idUser = idUser;
    let now = new Date();
    let startD = new Date(value.startDate);
    let endD = new Date(value.endDate);
    if (!startD || !endD) {
      throw new ErrorResponse(400, 'Ngày bắt đầu hoặc kết thúc không hợp lệ');
    }
    if (startD.getTime() < now.getTime()) {
      throw new ErrorResponse(400, 'Ngày bắt đầu phải lớn hơn ngày hiện tại');
    }
    if (endD.getTime() <= startD.getTime()) {
      throw new ErrorResponse(400, 'Ngày kết thúc phải sau ngày bắt đầu');
    }
    await factoryModel.findByIdAndUpdate(value.idFactory, {
      status: FactoryStatus.CHECKING,
    });
    const newContract = await contractModel.create(value);
    return res.status(201).json(newContract);
  },
  updateContract: async (req, res) => {
    const id = req.params.id;
    const { ...body } = req.body;
    const updatedContract = await contractModel
      .findByIdAndUpdate(id, body, {
        new: true,
      })
      .populate('idFactory')
      .populate('idUser');
    if (updatedContract.isAccepted === 1) {
      const html = `
        <p style="color: black; font-size: 32px; text-align: center;">Cảm ơn bạn đã tin tưởng và đồng hành của Industrial Park.
           Yêu cầu thuê xưởng: ${updatedContract?.idFactory.name} với thời gian từ: ${updatedContract.startDate} đến ${updatedContract.endDate} đã được duyệt.
           Xin hãy thanh toán tiền cọc tại đây: 
        </p>
        <a style="text-align: center;" href='${URL_PAYMENT}?id_contract=${updatedContract._id}&money=${updatedContract?.idFactory.price}' >CỌC TIỀN</a>
      `;
      const subject =
        'YÊU CẦU THUÊ XƯỞNG CỦA BẠN ĐÃ ĐƯỢC DUYỆT, HÃY THANH TOÁN TIỀN CỌC THEO CHỈ DẪN BÊN DƯỚI!';
      await sendMail({ email: updatedContract.idUser.email, subject, html });
    }
    return res.status(200).json(updatedContract);
  },
  deleteContract: async (req, res) => {
    const id = req.params.id;
    const deletedContract = await contractModel.findByIdAndDelete(id);
    return res.status(200).json(deletedContract);
  },
  getContractById: async (req, res) => {
    const id = req.params.id;
    const account = req.account;
    const bodyQuery = {
      _id: id,
    };
    if (account.role === typeRole.USER) {
      bodyQuery.idUser = account._id;
    }
    const contract = await contractModel.findOne(bodyQuery);
    return res.status(200).json(contract);
  },
  // getMyContracts: async (req, res) => {
  //   const idUser = req.account._id;
  //   const page = req.query.page || 1;
  //   const contractes = await contractModel
  //     .find({
  //       idUser: idUser,
  //     })
  //     .populate('idFactory')
  //     .skip(PER_PAGE * page - PER_PAGE)
  //     .limit(PER_PAGE)
  //     .sort('-createdAt')
  //     .exec();
  //   const count = await contractModel.countDocuments({
  //     idUser: idUser,
  //   });
  //   return res.status(200).json({
  //     page: +page,
  //     total_page: Math.ceil(count / PER_PAGE),
  //     per_page: PER_PAGE,
  //     contractes: contractes,
  //   });
  // },
};
