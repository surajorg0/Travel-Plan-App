const mongoose = require('mongoose');
const TravelPlan = mongoose.model('TravelPlan');

// @desc    Create a new travel plan
// @route   POST /api/travel-plans
// @access  Private
const createTravelPlan = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      destination, 
      startDate, 
      endDate, 
      budget, 
      activities, 
      accommodations, 
      transportation 
    } = req.body;

    // Create new travel plan
    const travelPlan = new TravelPlan({
      title,
      description,
      destination,
      startDate,
      endDate,
      budget,
      activities,
      accommodations,
      transportation,
      createdBy: req.user._id // Assuming user ID is available from auth middleware
    });

    await travelPlan.save();

    res.status(201).json(travelPlan);
  } catch (error) {
    console.error('Error creating travel plan:', error);
    res.status(500).json({ message: 'Server error during travel plan creation', error: error.message });
  }
};

// @desc    Get all travel plans
// @route   GET /api/travel-plans
// @access  Private
const getTravelPlans = async (req, res) => {
  try {
    const travelPlans = await TravelPlan.find({ createdBy: req.user._id });
    res.json(travelPlans);
  } catch (error) {
    console.error('Error fetching travel plans:', error);
    res.status(500).json({ message: 'Server error while fetching travel plans' });
  }
};

// @desc    Get travel plan by ID
// @route   GET /api/travel-plans/:id
// @access  Private
const getTravelPlanById = async (req, res) => {
  try {
    const travelPlan = await TravelPlan.findById(req.params.id);
    
    if (!travelPlan) {
      return res.status(404).json({ message: 'Travel plan not found' });
    }

    // Check if the travel plan belongs to the user
    if (travelPlan.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this travel plan' });
    }

    res.json(travelPlan);
  } catch (error) {
    console.error('Error fetching travel plan:', error);
    res.status(500).json({ message: 'Server error while fetching travel plan' });
  }
};

// @desc    Update travel plan
// @route   PUT /api/travel-plans/:id
// @access  Private
const updateTravelPlan = async (req, res) => {
  try {
    const travelPlan = await TravelPlan.findById(req.params.id);
    
    if (!travelPlan) {
      return res.status(404).json({ message: 'Travel plan not found' });
    }

    // Check if the travel plan belongs to the user
    if (travelPlan.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this travel plan' });
    }

    const updatedTravelPlan = await TravelPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTravelPlan);
  } catch (error) {
    console.error('Error updating travel plan:', error);
    res.status(500).json({ message: 'Server error while updating travel plan' });
  }
};

// @desc    Delete travel plan
// @route   DELETE /api/travel-plans/:id
// @access  Private
const deleteTravelPlan = async (req, res) => {
  try {
    const travelPlan = await TravelPlan.findById(req.params.id);
    
    if (!travelPlan) {
      return res.status(404).json({ message: 'Travel plan not found' });
    }

    // Check if the travel plan belongs to the user
    if (travelPlan.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this travel plan' });
    }

    await TravelPlan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Travel plan removed' });
  } catch (error) {
    console.error('Error deleting travel plan:', error);
    res.status(500).json({ message: 'Server error while deleting travel plan' });
  }
};

module.exports = {
  createTravelPlan,
  getTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan
};