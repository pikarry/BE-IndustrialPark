const factoryModel = require('../models/factory.model');
const { PER_PAGE } = require('../constants/pagination');
const factoryValid = require('../validations/factory.valid');
const ErrorResponse = require('../helpers/ErrorResponse');
const cloudinary = require('../configs/cloudinary');

module.exports = {
  getFactoryOfIndustrial: async (req, res) => {
    let page = req.query.page || 1;
    const idIndus = req.params.id_indus;
    let key = req.query.search;
    let status = req.query.status;
    let bodyQuery = {
      idIndustrial: idIndus,
    };
    if (key) {
      bodyQuery.name = {
        $regex: '.*' + key + '.*',
      };
    }
    if (status) {
      bodyQuery.status = +status;
    }
    const factories = await factoryModel
      .find(bodyQuery)
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE)
      .sort('-createdAt')
      .exec();

    const count = await factoryModel.countDocuments(bodyQuery);

    return res.status(200).json({
      page: +page,
      total_page: Math.ceil(count / PER_PAGE),
      per_page: PER_PAGE,
      factories: factories,
    });
  },
  createFactory: async (req, res) => {
    const idIndus = req.params.id_indus;
    const { value, error } = factoryValid({
      ...req.body,
      idIndustrial: idIndus,
    });
    if (error) {
      throw new ErrorResponse(400, error.message);
    }
    if (req?.file?.path) {
      const image = await cloudinary.uploader.upload(req.file.path);
      value.image = image.secure_url;
    } else {
      throw new ErrorResponse(400, 'Hãy thêm ảnh');
    }
    const newFactory = await factoryModel.create(value);
    return res.status(201).json(newFactory);
  },
  updateFactory: async (req, res) => {
    const id = req.params.id;
    const { ...body } = req.body;
    const updatedFactory = await factoryModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    return res.status(200).json(updatedFactory);
  },
  deleteFactory: async (req, res) => {
    const id = req.params.id;
    const deletedFac = await factoryModel.findByIdAndDelete(id);
    return res.status(200).json(deletedFac);
  },
  getFactoryById: async (req, res) => {
    const id = req.params.id;
    const factory = await factoryModel.findById(id).populate('idIndustrial');
    return res.status(200).json(factory);
  },
  getFactoryByIndustrialIdNotPaging: async (req, res) => {
    const idIndus = req.query.id_indus;
    let key = req.query.search;
    let status = req.query.status;
    let bodyQuery = {};
    if (idIndus) {
      bodyQuery.idIndustrial = idIndus;
    }
    if (key) {
      bodyQuery.name = {
        $regex: '.*' + key + '.*',
      };
    }
    if (status) {
      bodyQuery.status = +status;
    }
    const factories = await factoryModel.find({ ...bodyQuery });

    return res.status(200).json(factories);
  },
  getAll: async (req, res) => {
    let page = req.query.page || 1;
    const idIndus = req.query.id_indus;
    let key = req.query.search;
    let status = req.query.status;

    let bodyQuery = {};

    let bodySort = req.body;

    if (Object.keys(bodySort).length === 0) {
      bodySort = {
        createdAt: -1,
      };
    }

    //body query
    if (key) {
      bodyQuery.name = {
        $regex: '.*' + key + '.*',
      };
    }
    if (status) {
      bodyQuery.status = +status;
    }
    if (idIndus) {
      bodyQuery.idIndustrial = idIndus;
    }

    console.log(bodySort);
    const factories = await factoryModel
      .find(bodyQuery)
      .skip(PER_PAGE * page - PER_PAGE)
      .limit(PER_PAGE)
      .sort(bodySort)
      .exec();

    const count = await factoryModel.countDocuments(bodyQuery);

    return res.status(200).json({
      page: +page,
      total_page: Math.ceil(count / PER_PAGE),
      per_page: PER_PAGE,
      factories: factories,
    });
  },
};
