# import tensorflow as tf

# a = tf.constant(5)

# b = tf.constant(3)

# c = tf.add(a,b)

# print(c)


# import tensorflow as tf
# import keras
# import numpy as np
# import h5py

# # Wersja TensorFlow
# print("Wersja TensorFlow:", tf.__version__)

# # Wersja Keras
# print("Wersja Keras:", keras.__version__)

# # Wersja NumPy
# print("Wersja NumPy:", np.__version__)

# # Wersja h5py
# print("Wersja h5py:", h5py.__version__)

# from keras.applications import MobileNet

# model = MobileNet(weights='imagenet', include_top=False)

# model.save('mobilenet_model.h5')

# tf.keras.applications.MobileNet(
#     input_shape=None,
#     alpha=1.0,
#     depth_multiplier=1,
#     dropout=0.001,
#     include_top=True,
#     weights="imagenet",
#     input_tensor=None,
#     pooling=None,
#     classes=1000,
#     classifier_activation="softmax",
# )

# from tensorflow.keras.applications import VGG16

# # Tworzenie instancji modelu VGG16
# model = VGG16(weights='imagenet', include_top=True)

# # Zapisywanie modelu do pliku .h5
# model.save('vgg16_model.h5')