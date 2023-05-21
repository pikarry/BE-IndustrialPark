const jwt = require('jsonwebtoken');
const accountModel = require('../models/account.model');
const typeRole = require('../constants/typeRole');
const configuration = require('../configs/configuration');
const ErrorResponse = require('../helpers/ErrorResponse');
const accoutValid = require('../validations/account.valid');
const cloudinary = require('../configs/cloudinary');

const bcryptjs = require('bcryptjs');

module.exports = {
  getAllAccount: async (req, res, next) => {
    let perPage = 30;
    let page = req.query.page || 1;

    let key = req.query.search;

    let bdQuery = {
      role: typeRole.USER,
    };

    if (key && key != '""') {
      bdQuery.email = {
        $regex: '' + key + '.*',
      };
    }
    let accounts = await accountModel
      .find(bdQuery)
      .sort('-createdAt')
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    let count = await accountModel.countDocuments(bdQuery);
    let bd = {
      current_page: +page,
      total_page: Math.ceil(count / perPage),
      count: count,
      accounts: accounts,
    };

    return res.status(200).json(bd);
  },
  register: async (req, res, next) => {
    const { value, error } = accoutValid(req.body);
    if (error) {
      throw new ErrorResponse(400, error.message);
    }
    let account = await accountModel.create(value);
    let payload = {
      _id: account._id,
      email: account.email,
      role: account.role,
    };
    let token = jwt.sign(payload, configuration.SECRET_KEY, {
      expiresIn: '10h',
    });
    return res.status(201).json({
      ...payload,
      jwt: token,
    });
  },
  login: async (req, res, next) => {
    let { email, password } = req.body;
    let user = await accountModel.findOne({ email: email });
    if (!user) {
      throw new ErrorResponse(400, 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
    let checkPass = bcryptjs.compareSync(password, user.password);
    if (!checkPass) {
      throw new ErrorResponse(400, 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
    let payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    let token = jwt.sign(payload, configuration.SECRET_KEY, {
      expiresIn: '10h',
    });
    return res.status(200).json({
      ...payload,
      jwt: token,
    });
  },
  getMyProfile: async (req, res) => {
    const id = req.account._id;
    const account = await accountModel.findById(id);
    return res.status(200).json(account);
  },
  updateProfile: async (req, res) => {
    const id = req.account._id;
    const { ...body } = req.body;
    if (body.password) {
      const user = await accountModel.findById(id);
      let checkPass = bcryptjs.compareSync(body.oldPassword, user.password);
      if (!checkPass) {
        throw new ErrorResponse(400, 'Mật khẩu không chính xác');
      }
    }
    const updatedProfile = await accountModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    return res.status(200).json(updatedProfile);
  },
  updateAvatar: async (req, res) => {
    const id = req.account._id;
    if (req?.file?.path) {
      const image = await cloudinary.uploader.upload(req.file.path);
      const account = await accountModel.findByIdAndUpdate(id, {
        avt: image.secure_url,
      });
      return res.status(200).json(account);
    } else {
      return res.status(400).json({
        statusCode: 400,
        message: 'Thay ảnh đại diện thất bại',
      });
    }
  },
};
