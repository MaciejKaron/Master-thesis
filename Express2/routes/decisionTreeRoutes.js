const express = require('express');
const router = express.Router();
const decisionTreeController = require('../controllers/decisionTreeController');
const multer = require('multer');

const csvStorage = multer.memoryStorage();
const uploadCSV = multer({ storage: csvStorage });

router.post('/decision-tree', uploadCSV.single('csvFile'), decisionTreeController.performDecisionTreeClassification);

module.exports = router;