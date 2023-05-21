const mongoose = require('mongoose');

const contractSchema = mongoose.Schema(
  {
    idUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'account',
      required: true,
    },
    idFactory: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'factory',
      required: true,
    },
    startDate: {
      //ngày bắt đầu thuê
      type: String,
      required: true,
    },
    endDate: {
      //ngày kết thúc
      type: String,
      required: true,
    },
    deposit: {
      //tiền cọc
      type: Number,
      default: 0,
    },
    pricePerMonth: {
      //giá mỗi tháng
      type: Number,
    },
    isAccepted: {
      //đã duyệt
      type: Number,
      default: 0,
    },
    isFinished: {
      //đã kết thúc
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

contractSchema.index({ idUser: 1, idFactory: 1 }, { unique: true });
module.exports = mongoose.model('contract', contractSchema);
