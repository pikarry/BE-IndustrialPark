const mongoose = require('mongoose');
const { FactoryStatus } = require('../constants/factory.status');

const factorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    acreage: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      default: FactoryStatus.FREE,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    idIndustrial: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'industrial',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

factorySchema.set('toJSON', {
  transform: function (doc, ret, options) {
    if (ret.status !== FactoryStatus.BUSY) {
      delete ret.startDate;
      delete ret.endDate;
    }
  },
});

module.exports = mongoose.model('factory', factorySchema);
