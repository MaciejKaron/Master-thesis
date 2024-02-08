const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')

var corsOptions = {
  origin: "http://localhost:8080"
}

app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '50mb' })); // obsługa JSON Payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // obsługa URL-encoded payloads

app.use(function (req, res, next) {
  console.log(`${new Date()} - ${req.method} requrest for ${req.url}`);
  next(); // pass control to the next handler
});

app.get('/', (req, res) => {
  res.send('hello');
});
// Routing
const modelRoutes = require('./routes/modelRoutes');
app.use('/api/', modelRoutes);
const regressionRoutes = require('./routes/regressionRoutes')
app.use('/api/', regressionRoutes)
const decisionTreeRoutes = require('./routes/decisionTreeRoutes')
app.use('/api/', decisionTreeRoutes)

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 81;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));