const { parse } = require('csv-parse');
const { promisify } = require('util');
const linearRegression = require('ml-regression');

const parseAsync = promisify(parse);

exports.performRegression = async (request, reply) => {
  try {
    console.time('performRegression');

    if (!request.file) {
      reply.code(400).send('Bad Request: Missing CSV file');
      console.log('Bad Request: Missing CSV file');
      return;
    }

    const fileBuffer = await request.file.toBuffer();
    const csvData = fileBuffer.toString('utf-8');
    const { xColumnIndex, yColumnIndex } = request.query;

    let records;
    try {
      records = await parseAsync(csvData, { columns: true });
    } catch (err) {
      console.error('Error parsing CSV:', err);
      reply.status(400).send('Bad Request: Invalid CSV Format');
      return;
    }

    if (!xColumnIndex || !yColumnIndex) {
      reply.status(400).send('Bad Request: Please provide xColumnIndex and yColumnIndex');
      return;
    }

    const columnNames = Object.keys(records[0]);
    
    const x = records.map(entry => parseFloat(entry[columnNames[xColumnIndex]]));
    const y = records.map(entry => parseFloat(entry[columnNames[yColumnIndex]]));
    
    const regressionModel = new linearRegression.SimpleLinearRegression(x, y);

    const predictions = records.map(entry => {
      const xValue = parseFloat(entry[columnNames[xColumnIndex]]);
      const YofXvalue = regressionModel.predict(xValue);
      return { xValue, YofXvalue };
    });

    reply.send({
      equation: regressionModel.toString(),
      predictions,
      xColumnIndex: [columnNames[xColumnIndex]],
      yColumnIndex: [columnNames[yColumnIndex]],
      xValues: x,
      yValues: y
    });

    console.timeEnd('performRegression');
  } catch (error) {
    console.error(error);
    reply.code(500).send('Internal Server Error');
  }
};
