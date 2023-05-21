const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const configuration = require('../configs/configuration');

const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    avt: {
      type: String,
      default:
        'https://allimages.sgp1.digitaloceanspaces.com/photographercomvn/2020/08/1596889687_145_Anh-avatar-dep-va-doc-dao-lam-hinh-dai-dien.jpg',
    },
    role: {
      type: String,
      default: 'user',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

accountSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
  },
});

accountSchema.pre('save', function (next) {
  const account = this;
  if (account.password) {
    account.password = bcryptjs.hashSync(
      account.password,
      configuration.SALT_ROUND,
    );
  }
  next();
});

accountSchema.pre('findOneAndUpdate', function (next) {
  const account = { ...this.getUpdate() };
  if (account.password) {
    account.password = bcryptjs.hashSync(
      account.password,
      configuration.SALT_ROUND,
    );
  }
  this.setUpdate(account);
  next();
});

module.exports = mongoose.model('account', accountSchema);
