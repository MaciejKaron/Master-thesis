const { DecisionTreeClassifier } = require('ml-cart');
const { parse } = require('csv-parse'); // Do asynchronicznego parsowania danych CSV

exports.performDecisionTreeClassification = (req, res) => {
  console.time('performDecisionTree');
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded.' });
  }

  const csvData = req.file.buffer.toString('utf-8');
  // Rozdziel ciąg featureColumnIndexes na tablicę indeksów
  const featureColumnIndexes = req.query.featureColumnIndexes.split(',').map(index => parseInt(index.trim(), 10));
  const labelColumnIndex = parseInt(req.query.labelColumnIndex, 10);
  parse(csvData, { columns: true, skip_empty_lines: true }, (err, records) => {
    if (err) {
      console.error('Error parsing CSV:', err);
      return res.status(400).send('Bad Request: Invalid CSV Format');
    }
    // Sprawdź, czy każdy element tablicy jest liczbą
    const allIndexesAreNumbers = featureColumnIndexes.every(item => !isNaN(item));

    if (!allIndexesAreNumbers || isNaN(labelColumnIndex)) {
      return res.status(400).send('Bad Request: Please provide valid featureColumnIndexes and labelColumnIndex');
    }

    // Znajdź nazwy kolumn na podstawie indeksów
    const columnNames = Object.keys(records[0]);
    const featureColumnNames = featureColumnIndexes.map(index => columnNames[index]);
    const labelColumnName = columnNames[labelColumnIndex];
    const numberOfFeatures = columnNames.length - 1;
    if (featureColumnNames.includes(undefined) || !labelColumnName) {
      return res.status(400).send('Bad Request: Invalid column indexes');
    }
    // Konwertuj dane na właściwe formaty
    const X = records.map(record => featureColumnNames.map(featureColumnName => parseFloat(record[featureColumnName]))).filter(row => row.every(value => !isNaN(value))); // Filtruj, aby usunąć wiersze zawierające NaN
    const distinctClasses = [...new Set(records.map(record => record[labelColumnName]))];
    const Y = records.map(record => distinctClasses.indexOf(record[labelColumnName])); // Konwertuj etykiety na indeksy

    if (X.length === 0 || Y.length === 0) {
      return res.status(400).send({ message: 'No valid data found for training.' });
    }

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
      const predictions = X.map(x => classifier.predict([x]));
      
        // Przekształcenie predykcji na jednowymiarową listę
      const flatPredictions = predictions.map(prediction => prediction[0]);
      // Obliczenie dokładności predykcji
      const correctPredictions = flatPredictions.reduce((acc, current, index) => acc + (current === Y[index] ? 1 : 0), 0);
      const accuracy = correctPredictions / Y.length * 100;
      const accuracyPer = accuracy.toFixed(2) + '%'
      console.log(accuracyPer);

      res.json({ message: "Classification completed", predictions, featureColumnNames, labelColumnName, X, Y, numberOfFeatures, accuracyPer });
      } catch (error) {
        console.error('Error during classification:', error);
        res.status(500).send({ message: 'Error during classification process.' });
    }
    console.timeEnd('performDecisionTree');
  });
};