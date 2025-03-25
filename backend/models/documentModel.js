const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    documentType: {
      type: String,
      required: [true, 'Please specify document type'],
      enum: ['passport', 'visa', 'id_card', 'vaccination', 'insurance', 'other'],
      default: 'other',
    },
    documentFile: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: {
      type: Date,
    },
    verificationComments: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 