const tf = require('@tensorflow/tfjs')
const tfn = require("@tensorflow/tfjs-node");
const IMAGENET_CLASSES = require('../imagenet_classes')

// Przykład implementacji kontrolera
exports.loadModel = async (req, res) => {
    try {
      const modelName = req.params.modelName;
      const handler = tfn.io.fileSystem(`./tfjs-models/${modelName}/model.json`);
      // Logika ładowania modelu
      var model;
      model = undefined;

      console.time("loadModelTime");

      if (modelName == "vgg") {
        model = await tf.loadLayersModel(handler);
        console.log('vgg');
      }
      if (modelName == "mobilenet") {
        model = await tf.loadGraphModel(handler);
        console.log('mobilenet');
      }
      console.timeEnd("loadModelTime");
      res.json({ message: `Model ${modelName} loaded successfully` });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  exports.predict = async (req, res) => {
    try {
      var modelName = req.body.model;
      const handler = tfn.io.fileSystem(`./tfjs-models/${modelName}/model.json`);
      var image = req.body.image.split(';base64,').pop();
      var b = Buffer.from(image, 'base64')
      // console.log(image);

      console.time("predictTime");

      var model;
      model = undefined;

      if (modelName == "vgg") {
        model = await tf.loadLayersModel(handler);
        console.log('vgg');
      }
      if (modelName == "mobilenet") {
        model = await tf.loadGraphModel(handler);
        console.log('mobilenet');
      }

      var tensor = tfn.node.decodeImage(b).
      resizeNearestNeighbor([224, 224])
        .toFloat()
      
    
      if (modelName === "vgg") {
        const meanImageNetRGB = tf.tensor1d([123.68, 116.779, 103.939]);
        tensor = tensor.sub(meanImageNetRGB)
            .reverse(2)
            .expandDims();
      }
      else if (modelName === "mobilenet") {
        const offset = tf.scalar(127.5);
        tensor = tensor.sub(offset)
            .div(offset)
            .expandDims();
      }
      else {
        tensor = tensor.expandDims();
      }
      // Logika predykcji  
      let predictions = await model.predict(tensor).data()
      let top5 = Array.from(predictions)
        .map(function (p, i) {
          return {
            probability: p,
            className: IMAGENET_CLASSES[i]
        }
        }).sort(function (a, b) {
          return b.probability - a.probability;
        }).slice(0, 5)
        console.timeEnd("predictTime");
      res.json(top5);
    } catch (error) {
      res.status(500).send(error.message);
    }
};
  
