const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    money: {
      type: Number,
      required: true,
    },
    idContract: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'contract',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model('bill', billSchema);
