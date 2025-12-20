const express = require('express');
const { generateAssessment, evaluateAndPlan } = require('../controllers/learnController');

const router = express.Router();

router.post('/assessment/start', generateAssessment);
router.post('/assessment/submit', evaluateAndPlan);

module.exports = router;
