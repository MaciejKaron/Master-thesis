const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const IMAGENET_CLASSES = require('../imagenet_classes');

exports.loadModel = async ctx => {
    try {
      const modelName = ctx.params.modelName;
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
      ctx.body = { message: `Model ${modelName} loaded successfully` };
    } catch (error) {
      ctx.status = 500;
      ctx.body = error.message;
    }
  };

  exports.predict = async ctx => {
    try {
        const modelName = ctx.request.body.model;
        const handler = tfn.io.fileSystem(`./tfjs-models/${modelName}/model.json`);
      const image = ctx.request.body.image.split(';base64,').pop();
      const b = Buffer.from(image, 'base64');
    
      console.time("predictTime");
        
      var model;
      if (modelName == "vgg") {
        model = await tf.loadLayersModel(handler);
      }
      if (modelName == "mobilenet") {
        model = await tf.loadGraphModel(handler);
      } 
     
      var tensor = tfn.node.decodeImage(b)
        .resizeNearestNeighbor([224, 224])
        .toFloat();
      
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
      } else {
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
      ctx.body = top5;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  };