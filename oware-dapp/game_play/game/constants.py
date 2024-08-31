import json

NUMBER_OF_HOUSES = 12
PLAYER_ONE_HOUSES = ["House1", "House2", "House3", "House4", "House5", "House6"]
PLAYER_TWO_HOUSES = ["House7", "House8", "House9", "House10", "House11", "House12"]
HOUSES = PLAYER_ONE_HOUSES + PLAYER_TWO_HOUSES
# Define challenge types
CHALLENGE_TYPE_USER_VS_USER = 1
CHALLENGE_TYPE_USER_VS_AI = 2
CHALLENGE_TYPE_AI_VS_AI = 3

def load_model_addresses():
    """Load model addresses from the JSON file."""
    try:
        with open('model_addresses.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    

MODEL_ADDRESSES = load_model_addresses()