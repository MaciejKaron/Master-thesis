const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'), {
  origin: "http://localhost:8080"
});

fastify.register(require('@fastify/multipart'));

// fastify.register(require('@fastify/formbody'),
//   { bodyLimit: 50 * 1024 * 1024 });

  fastify.addContentTypeParser('application/json', { parseAs: 'string', bodyLimit: 50 * 1024 * 1024 }, (req, body, done) => {
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  // Logowanie żądań
  fastify.addHook('preHandler', async (request, reply) => {
    console.log(`${new Date()} - ${request.method} request for ${request.url}`);
  });

  fastify.get('/', async (request, reply) => {
    reply.send('hello');
  });
  
  // Routing
const modelRoutes = require('./routes/modelRoutes');
const regressionRoutes = require('./routes/regressionRoutes')
modelRoutes(fastify);
regressionRoutes(fastify);
  
  // Obsługa błędów
  fastify.setErrorHandler(function (error, request, reply) {
    console.error(error);
    reply.status(500).send('Something broke!');
  });
  
  const start = async () => {
    try {
      await fastify.listen({ port: 83 });
      console.log(`Server running on port ${fastify.server.address().port}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();