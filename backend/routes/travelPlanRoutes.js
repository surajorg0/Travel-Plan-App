const express = require('express');
const router = express.Router();
const {
  createTravelPlan,
  getTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan
} = require('../controllers/travelPlanController');

// Travel plan routes
router.post('/', createTravelPlan);
router.get('/', getTravelPlans);
router.get('/:id', getTravelPlanById);
router.put('/:id', updateTravelPlan);
router.delete('/:id', deleteTravelPlan);

module.exports = router;