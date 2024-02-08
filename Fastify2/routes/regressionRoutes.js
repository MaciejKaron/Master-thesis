const regressionController = require('../controllers/regressionController');

module.exports = fastify => {
  fastify.post('/api/regression', async (request, reply) => {
    const parts = request.parts();
    let file;
    for await (const part of parts) {
      if (part.file) {
        file = part;
        break;
      }
    }
    if (!file) {
      reply.code(400).send('No file uploaded');
      return;
    }
    request.file = file; // Dodajemy plik do obiektu request
    return regressionController.performRegression(request, reply);
  });
};
