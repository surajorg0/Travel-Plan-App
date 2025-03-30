const mongoose = require('mongoose');

const travelPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  activities: [{
    type: String
  }],
  accommodations: {
    type: String
  },
  transportation: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TravelPlan', travelPlanSchema);