const modelController = require('../controllers/modelController');

module.exports = fastify => {
  fastify.get('/api/load/:modelName', modelController.loadModel);
  fastify.post('/api/predict', modelController.predict);
};