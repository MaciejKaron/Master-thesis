const regressionController = require('../controllers/regressionController');

module.exports = router => {
  router.post('/api/regression', regressionController.performRegression);
};