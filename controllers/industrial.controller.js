const mongoose = require('mongoose');
const industrialModel = require('../models/industrial.model');
const factoryModel = require('../models/factory.model');
const cloudinary = require('../configs/cloudinary');
const industrialValid = require('../validations/industrial.valid');
const ErrorResponse = require('../helpers/ErrorResponse');
const pagination = require('../constants/pagination');
const { FactoryStatus } = require('../constants/factory.status');

module.exports = {
  getAllIndustrial: async (req, res) => {
    let page = req.query.page || 1;
    let key = req.query.search;
    let bodyQuery = {};
    if (key) {
      bodyQuery.name = {
        $regex: '.*' + key + '.*',
      };
    }

    const industrials = await industrialModel
      .find(bodyQuery)
      .skip(pagination.PER_PAGE * page - pagination.PER_PAGE)
      .limit(pagination.PER_PAGE)
      .sort('-createdAt')
      .exec();

    const count = await industrialModel.countDocuments(bodyQuery);

    const mapIndustrials = industrials.map(async (v) => {
      const indus = v.toObject();
      const countFactories = await Promise.all([
        factoryModel.countDocuments({
          idIndustrial: indus._id,
        }),
        factoryModel.countDocuments({
          idIndustrial: indus._id,
          status: FactoryStatus.BUSY,
        }),
      ]);
      indus.factories = countFactories[0];
      indus.status = Number(
        Math.ceil((countFactories[1] * 100) / countFactories[0] || 0).toFixed(
          2,
        ),
      );
      return indus;
    });

    return res.status(200).json({
      page: +page,
      total_page: Math.ceil(count / pagination.PER_PAGE),
      per_page: pagination.PER_PAGE,
      industrials: await Promise.all(mapIndustrials),
    });
  },
  createIndustrial: async (req, res) => {
    const { ...body } = req.body;
    const { value, error } = industrialValid(body);
    if (error) {
      throw new ErrorResponse(400, error.message);
    }

    if (req?.file?.path) {
      const image = await cloudinary.uploader.upload(req.file.path);
      value.image = image.secure_url;
    } else {
      throw new ErrorResponse(400, 'Hãy thêm ảnh');
    }

    const newIndustrial = await industrialModel.create(value);
    return res.status(201).json(newIndustrial);
  },
  updateIndustrial: async (req, res) => {
    const id = req.params.id;
    const { ...body } = req.body;
    if (req?.file?.path) {
      const image = await cloudinary.uploader.upload(req.file.path);
      body.image = image.secure_url;
    }
    const updateIndustrial = await industrialModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    return res.status(200).json(updateIndustrial);
  },
  deleteIndustrial: async (req, res) => {
    const id = req.params.id;
    const result = await industrialModel.findByIdAndDelete(id);
    return res.status(200).json(result);
  },
  findIndustrialById: async (req, res) => {
    const id = req.params.id;
    const v = await industrialModel.findById(id);
    if (!v) {
      throw new ErrorResponse(404, 'Not found industrial');
    }
    const indus = v.toObject();
    const countFactories = await Promise.all([
      factoryModel.countDocuments({
        idIndustrial: indus._id,
      }),
      factoryModel.countDocuments({
        idIndustrial: indus._id,
        status: FactoryStatus.BUSY,
      }),
      factoryModel.countDocuments({
        idIndustrial: indus._id,
        status: FactoryStatus.CHECKING,
      }),
    ]);
    let result = await factoryModel.aggregate([
      {
        $match: {
          idIndustrial: mongoose.Types.ObjectId(indus._id),
        },
      },
      {
        $group: {
          _id: null,
          totalAcreage: { $sum: '$acreage' },
        },
      },
    ]);

    indus.totalAcreage = result[0]?.totalAcreage || 0;
    indus.factories = countFactories[0];
    indus.statistics = {
      total: countFactories[0],
      hired: countFactories[1],
      pending: countFactories[2],
      notRentedYet: countFactories[0] - countFactories[1] - countFactories[2],
    };
    return res.status(200).json(indus);
  },
  getAllNotPaging: async (req, res) => {
    const industrials = await industrialModel.find();
    return res.status(200).json(industrials);
  },
};
