const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');

router.get('/load/:modelName', modelController.loadModel);
router.post('/predict', modelController.predict);

module.exports = router;