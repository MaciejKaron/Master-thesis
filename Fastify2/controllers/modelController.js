const tf = require('@tensorflow/tfjs')
const tfn = require("@tensorflow/tfjs-node");
const IMAGENET_CLASSES = require('../imagenet_classes');

exports.loadModel = async (request, reply) => {
    try {
      const modelName = request.params.modelName;
      const handler = tfn.io.fileSystem(`./tfjs-models/${modelName}/model.json`);
      
      var model;
  
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
      reply.send({ message: `Model ${modelName} loaded successfully` });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  };
  
  exports.predict = async (request, reply) => {
    try {
      var modelName = request.body.model;
      const handler = tfn.io.fileSystem(`./tfjs-models/${modelName}/model.json`);
      var image = request.body.image.split(';base64,').pop();
      var b = Buffer.from(image, 'base64');
  
      console.time("predictTime");
  
      var model;
        
      if (modelName == "vgg") {
        model = await tf.loadLayersModel(handler);
        console.log('vgg');
      }
      if (modelName == "mobilenet") {
        model = await tf.loadGraphModel(handler);
        console.log('mobilenet');
      } 
  
      let tensor = tfn.node.decodeImage(b)
        .resizeNearestNeighbor([224, 224])
        .toFloat();
  
      if (modelName === "vgg") {
        const meanImageNetRGB = tf.tensor1d([123.68, 116.779, 103.939]);
        tensor = tensor.sub(meanImageNetRGB)
            .reverse(2)
            .expandDims();
      } else if (modelName === "mobilenet") {
        const offset = tf.scalar(127.5);
        tensor = tensor.sub(offset)
            .div(offset)
            .expandDims();
      }
      else {
        tensor = tensor.expandDims();
      }
  
      let predictions = await model.predict(tensor).data();
      let top5 = Array.from(predictions)
        .map((p, i) => ({
          probability: p,
          className: IMAGENET_CLASSES[i]
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);
  
      console.timeEnd("predictTime");
      reply.send(top5);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  };