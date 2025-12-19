const express = require('express');
const { generateAssessment, evaluateAndPlan } = require('../controllers/learnController');
const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

router.post('/assessment/start', verifyAccessToken, generateAssessment);
router.post('/assessment/submit', verifyAccessToken, evaluateAndPlan);

module.exports = router;