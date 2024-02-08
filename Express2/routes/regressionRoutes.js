const express = require('express')
const router = express.Router()
const regressionController = require('../controllers/regressionController')
const multer = require('multer')

const csvStorage = multer.memoryStorage()
const uploadCSV = multer({ storage: csvStorage, limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB (zmień na odpowiednią wartość)
  }, })

router.post('/regression', uploadCSV.single('csvFile'), regressionController.performRegression)

module.exports = router;