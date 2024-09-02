import os
import pathlib
import tflite_runtime.interpreter as tflite
from pathlib import Path


def load_model_tflite():
    model_path  = os.path.join(Path(__file__).parent, f'models-tflite/Bao.tflite')
    model = tflite.Interpreter(model_path=model_path)
    return model

load_model_tflite()