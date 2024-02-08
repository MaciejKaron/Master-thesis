const modelController = require('../controllers/modelController');

module.exports = router => {

  router.get('/api/load/:modelName', modelController.loadModel);
  router.post('/api/predict', modelController.predict);

};
