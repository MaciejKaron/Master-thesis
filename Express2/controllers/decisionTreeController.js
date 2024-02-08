const { DecisionTreeClassifier } = require('ml-cart');
const { parse } = require('csv-parse'); // Do asynchronicznego parsowania danych CSV

exports.performDecisionTreeClassification = (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded.' });
  }

  const csvData = req.file.buffer.toString('utf-8');
  const featureColumnIndex = parseInt(req.query.featureColumnIndex, 10);
  const labelColumnIndex = parseInt(req.query.labelColumnIndex, 10);

  parse(csvData, { columns: true, skip_empty_lines: true }, (err, records) => {
    if (err) {
      console.error('Error parsing CSV:', err);
      return res.status(400).send('Bad Request: Invalid CSV Format');
    }

    if (isNaN(featureColumnIndex) || isNaN(labelColumnIndex)) {
      return res.status(400).send('Bad Request: Please provide valid featureColumnIndex and labelColumnIndex');
    }

    // Znajdź nazwy kolumn na podstawie indeksów
    const columnNames = Object.keys(records[0]);
    const featureColumnName = columnNames[featureColumnIndex];
    const labelColumnName = columnNames[labelColumnIndex];

    if (!featureColumnName || !labelColumnName) {
      return res.status(400).send('Bad Request: Invalid column indexes');
    }

    // Konwertuj dane na właściwe formaty
    const X = records.map(record => [parseFloat(record[featureColumnName])]).filter(row => !isNaN(row[0])); // Filtruj, aby usunąć NaN
    const distinctClasses = [...new Set(records.map(record => record[labelColumnName]))];
    const Y = records.map(record => distinctClasses.indexOf(record[labelColumnName])); // Konwertuj etykiety na indeksy

    if (X.length === 0 || Y.length === 0) {
      return res.status(400).send({ message: 'No valid data found for training.' });
      }
      console.log('X:', X);
console.log('Y:', Y);

    // Opcje klasyfikatora
    const options = {
      gainFunction: 'gini', // lub 'entropy'
      maxDepth: 10,
      minNumSamples: 3,
    };

    try {
        // Sprawdź, czy X i Y są prawidłowo sformatowane
        if (!Array.isArray(X) || X.length === 0 || !Array.isArray(X[0])) {
          throw new Error('Invalid data format for X');
        }
        if (!Array.isArray(Y) || Y.length === 0) {
          throw new Error('Invalid data format for Y');
        }
      
        // Trenowanie klasyfikatora
        const classifier = new DecisionTreeClassifier(options);
        classifier.train(X, Y);
      
        // Dokonanie predykcji
        const predictions = X.map(x => classifier.predict(x));
        res.send({ message: "Classification completed", predictions });
      } catch (error) {
        console.error('Error during classification:', error);
        res.status(500).send({ message: 'Error during classification process.' });
      }
  });
};