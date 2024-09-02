import json
import os
import pathlib

print("Current working directory:", pathlib.Path(__file__).parent.resolve())

new_path = os.path.join(pathlib.Path(__file__).parent.resolve(), 'model_addresses.json')

def load_model_addresses():
    with open(new_path, 'r') as f:
        print(json.load(f))
    
load_model_addresses()