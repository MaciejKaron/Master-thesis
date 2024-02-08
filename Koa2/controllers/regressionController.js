const { parse } = require('csv-parse');
const { promisify } = require('util');
const linearRegression = require('ml-regression');
const fs = require('fs').promises;
const parseAsync = promisify(parse);

exports.performRegression = async (ctx) => {
  try {
    console.time('performRegression');

    if (!ctx.request.files || !ctx.request.files.csvFile) {
      ctx.throw(400, 'Bad Request: Missing CSV file');
      return;
    }
    
    const csvFile = ctx.request.files.csvFile;
    const csvData = await fs.readFile(csvFile.filepath, 'utf-8');
    const { xColumnIndex, yColumnIndex } = ctx.request.query;

    let records;
    try {
      records = await parseAsync(csvData, { columns: true });
    } catch (err) {
      console.error('Error parsing CSV:', err);
      ctx.status = 400;
      ctx.body = 'Bad Request: Invalid CSV Format';
      return;
    }

    if (!xColumnIndex || !yColumnIndex) {
      ctx.status = 400;
      ctx.body = 'Bad Request: Please provide xColumnIndex and yColumnIndex';
      return;
    }

    const columnNames = Object.keys(records[0]);
    
    const x = records.map(entry => parseFloat(entry[columnNames[xColumnIndex]]));
    const y = records.map(entry => parseFloat(entry[columnNames[yColumnIndex]]));
    
    const regressionModel = new linearRegression.SimpleLinearRegression(x, y);

    console.log('Regression Equation:', regressionModel.toString());

    const predictions = records.map(entry => {
      const xValue = parseFloat(entry[columnNames[xColumnIndex]]);
      const YofXvalue = regressionModel.predict(xValue);
      return { xValue, YofXvalue };
    });

    ctx.body = {
      equation: regressionModel.toString(),
      predictions,
      xColumnIndex: columnNames[xColumnIndex],
      yColumnIndex: columnNames[yColumnIndex],
      xValues: x,
      yValues: y
    };

    console.timeEnd('performRegression');
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
};