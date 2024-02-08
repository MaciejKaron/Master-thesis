const { parse } = require('csv-parse');
const linearRegression = require('ml-regression');

exports.performRegression = (req, res) => {
  try {
    console.time('performRegression');

    if (!req.file) {
      res.status(400).send('Bad Request: Missing CSV file');
      console.log('Bad Request: Missing CSV file');
      return;
    }

    const csvData = req.file.buffer.toString('utf-8');

    const { xColumnIndex, yColumnIndex } = req.query;

    parse(csvData, { columns: true }, (err, records) => {
      if (err) {
        console.error('Error parsing CSV:', err);
        res.status(400).send('Bad Request: Invalid CSV Format');
        return;
      }
      

      if (!xColumnIndex || !yColumnIndex) {
        res.status(400).send('Bad Request: Please provide xColumnIndex and yColumnIndex');
        return;
      }
      const columnNames = Object.keys(records[0]);
      
      // Przygotowanie danych
      const x = records.map(entry => parseFloat(entry[columnNames[xColumnIndex]]));
      const y = records.map(entry => parseFloat(entry[columnNames[yColumnIndex]]));
      // Inicjalizacja modelu
      const regressionModel = new linearRegression.SimpleLinearRegression(x, y);
      // console.log(regressionModel);

      // Wyświetlenie równania regresji
      console.log('Regression Equation:', regressionModel.toString());

      // Przewidywanie wartości dla każdej pary x, y w zbiorze danych
      const predictions = records.map(entry => {
        const xValue = parseFloat(entry[columnNames[xColumnIndex]]);
        const YofXvalue = regressionModel.predict(xValue);
        return { xValue, YofXvalue };
      });

      // console.log('Predictions:', predictions);

      res.json({
        equation: regressionModel.toString(),
        predictions,
        xColumnIndex: [columnNames[xColumnIndex]],
        yColumnIndex: [columnNames[yColumnIndex]],
        xValues: x,
        yValues: y
      });
    });

    console.timeEnd('performRegression');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};