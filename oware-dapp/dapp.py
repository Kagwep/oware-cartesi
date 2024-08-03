from os import environ
import logging
import requests
from utils.utils import HexConverter
import json
import copy
from .store import Store

hexConverter = HexConverter()
store = Store()

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

def add_notice(data):
    logger.info(f"Received advance request data {data}")
    logger.info("Adding notice {data}")
    notice = {"payload": hexConverter.strtohex(data)}
    response = requests.post(rollup_server + "/notice", json=notice)
    logger.info(f"Received notice status {response.status_code} body {response.content}")


def add_report(output=""):
    logger.info("Adding report ", output)
    notice = {"payload":hexConverter.strtohex(output)}
    response = requests.post(rollup_server + "/report", json=notice)
    logger.info(f"Received notice status {response.status_code}")

def handle_advance(data):
    
    try:
     payload = json.loads(hexConverter.hextostr(data["payload"]))

    except Exception as e:
        return "reject "
    
    method = payload.get("method")
    sender = data["metadata"]["msg_sender"]

    logger.info(f"Received advance request data {payload}")

    handler =  advance_method_handlers.get(method)

    if not handler:
        add_report("Invalid Method")
        return "reject"
    
    return handler(payload,sender)
    


def handle_inspect(data):

    try:
     
     payload = json.loads(hexConverter.hextostr(data["payload"]))

    except Exception as e:
        return "reject "
    
    method = payload.get("method")
    
    logger.info(f"Received inspect request data {payload}")

    handler =  inspect_handler_methods.get(method)

    if not handler:
        add_report("Invalid Method")
        return "reject"
    
    return handler(payload)


def create_challenge(payload,sender):

    result = store.create_challenge(sender, payload)

    if result["success"]:
        add_notice(f"challenge with id {result['challenge_id']} was was created by {sender} ")
        return "accept"
    else:
        add_report(f"Failed to create challenge. Error: {result['error']}")
        return  "reject"



def accept_challenge(payload,sender):

    result = store.join_challenge(sender, payload)

    if result["success"]:
        add_notice(f" challenge with id {result['challenge_id']} was accepted by player {sender}")
        return "accept"
    else:
        add_report(f"Failed to join challenge. Error: {result['error']}")
        return "reject"

def spawn(payload,sender):

    result = store.start_challenge(sender, payload)

    if result["success"]:
        add_notice(f" Creator {sender} of challege {result['challenge_id']} has initialized the game")
        return 'accept'
    else:
        add_report(f"Failed to start challenge. Error: {result['error']}")
        return "reject"

def make_move(payload,sender):

    action = payload.get("action")
    challenge_id = payload.get("challenge_id")

    if not challenge:
        add_report("Challenge does not exists")
        return "reject"
    
    challenge = challenges.get(challenge_id)

    if not challenge:
        add_report("Challenge does not exists")
        return "reject"
    
    if sender != challenge.turn or not challenge.in_progress:
        add_report("Opponents Turn.")
        return "reject"
    
    state = challenge.state.copy()
    valid_moves = challenge.game.get_valid_moves(state)

    if valid_moves[action] == 0:
        add_report("Invalid MOve")
        return 'reject'
    
    _,game_ended,win = challenge.move(int(action),state)

    if game_ended and win:
        add_notice(f"Player {sender} has made move on challenge {challenge_id}, Game has ended: Winer {challenge.winner_address}")
        delete_player_from_active_challenge(challenge)

    elif game_ended and not win:
        add_notice(f"Player {sender} has made move on challenge {challenge_id}, Game has ended: Draw")
        delete_player_from_active_challenge(challenge)
    
    else:
        add_notice(f"Player {sender} has made move on challenge {challenge_id}")
    
def delete_player_from_active_challenge(challenge):

    if player_challenges.get(challenge.opponet_address) is not None:
        del player_challenges[challenge.opponet_address]

    if player_challenges.get(challenge.creator_address) is not None:
        del player_challenges[challenge.creator_address]

def get_all_challenges(payload):

    challenge_keys = challenges.keys()
    challenge_list = []

    for challenge_id in challenge_keys:
        challenge = challenges.get(challenge_id)
        state = challenge.state

        challenge_list.append({
            "challenge_id": challenge_id,
             "creator" : challenge.creator_address,
             "opponent": challenge.opponet_address,
             "in_progress":  challenge.in_progress,
             "game_ended": challenge.game_ended,
             "winner": challenge.winner_address,
             "state": state.tolist()
        })
    
    output = json.dumps({"challenges": challenges})

    add_report(output)

    return "accept"



handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}


advance_method_handlers = {
    'create_challenge': create_challenge,
    'accept_challenge': accept_challenge,
    'make_move': make_move,
    'spawn': spawn,
    'add_player_to_leaderboard':add_player_to_leaderboard,
    'update_player_score':update_player_score,
    'create_tournament': create_tournament,
    'join_tournament':join_tournament,
    'make_move_tournament':make_move_tournament,
}

inspect_handler_methods = {
    'get_all_challenges': get_all_challenges,
    'get_top_players':get_top_players,
    'get_round_fixtures':get_round_fixtures,
    'get_round_fixture':get_round_fixture,
    'get_player_fixture':get_player_fixture
}

finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:

        rollup_request = response.json()
        data = rollup_request["data"]
        request_type = rollup_request["request_type"]
        logger.info(f"Received data {data}")
        handler = handlers[request_type]
        finish["status"] = handler(rollup_request["data"])
        

