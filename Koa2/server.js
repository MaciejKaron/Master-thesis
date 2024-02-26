const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');

const app = new Koa();
const router = new Router();

var corsOptions = {
    origin: "http://localhost:8080"
};

app.use(cors(corsOptions));
app.use(koaBody({
  multipart: true,
  formidable: {
  uploadDir: null, // tymczasowy katalog do zapisywania plików; możesz też ustawić na `null`
    keepExtensions: true,
  },
  jsonLimit: '50mb', formLimit: '50mb', textLimit: '50mb'
}));


// Routing
require('./routes/modelRoutes')(router);
require('./routes/regressionRoutes')(router);
require('./routes/decisionTreeRoutes')(router);

// Logowanie żądań
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

router.get('/', ctx => {
  ctx.body = 'hello';
});

// Zastosowanie routerów
app.use(router.routes()).use(router.allowedMethods());

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

const PORT = process.env.PORT || 82;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));