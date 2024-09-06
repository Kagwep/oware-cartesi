from os import environ
import logging
import requests
from utils.utils import HexConverter
import json
import copy
from utils.store import Store

hexConverter = HexConverter()
store = Store()

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

def add_notice(data):
    logger.info(f"Received advance request data {data}")
    logger.info(f"Adding notice {data}")
    notice = {"payload": hexConverter.strtohex(data)}
    response = requests.post(rollup_server + "/notice", json=notice)
    logger.info(f"Received notice status {response.status_code} body {response.content}")


def add_report(output=""):
    logger.info(f"Adding report {output}")
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
    
def create_tournament(payload,sender):

    result = store.create_tournament(sender, payload)

    if result["success"]:
        add_notice(f"Tournament with id {result['tournament_id']} was was created by {sender} ")
        return "accept"
    else:
        add_report(f"Failed to create challenge. Error: {result['error']}")
        return  "reject"
    
def join_tournament(payload,sender):

    result = store.join_tournament(sender, payload)

    if result["success"]:
        add_notice(f"tournement with id {result['tournament_id']} was was created by {sender} ")
        return "accept"
    else:
        add_report(f"Failed to create tournament. Error: {result['error']}")
        return  "reject"
    
def add_opponent(payload,sender):

    result = store.add_AI_opponent(sender, payload)

    if result["success"]:
        add_notice(f"opponnet {result['challenge_id']} was was added by {sender} ")
        return "accept"
    else:
        add_report(f"Failed to add opponent. Error: {result['error']}")
        return  "reject"
    
def add_opponent_tournament(payload,sender):

    result = store.add_agent_opponent_tournament(sender, payload)

    if result["success"]:
        add_notice(f"opponnet {result['tournament_id']} was was added by {sender} ")
        return "accept"
    else:
        add_report(f"Failed to add opponent. Error: {result['error']}")
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
    
def tournament_chalenge_spawn(payload,sender):

    result = store.tournament_start_challenge(sender, payload)

    if result["success"]:
        add_notice(f" Creator {sender} of challege {result['challenge_id']} has initialized the game")
        return 'accept'
    else:
        add_report(f"Failed to start challenge. Error: {result['error']}")
        return "reject"
    
def make_move(payload,sender):

    result = store.make_move(sender, payload)

    if result["success"]:
        add_notice(f"Move made successfully. Result: {str(result['result'])}")
        return 'accept'
    else:
        add_report(f"Failed to make move. Error: {result['error']}")
        return  'reject'
    
def delegate_move(payload,sender):

    result = store.delegate_make_move(sender, payload)

    if result["success"]:
        add_notice(f"Move made successfully. Result: {str(result['result'])}")
        return 'accept'
    else:
        add_report(f"Failed to make move. Error: {result['error']}")
        return  'reject'
    
def make_move_tournament(payload,sender):

    result = store.make_move_tournament(sender, payload)

    if result["success"]:
        add_notice(f"Move made successfully. Result: {str(result['result'])}")
        return 'accept'
    else:
        add_report(f"Failed to make move. Error: {result['error']}")
        return  'reject'


def get_all_challenges(payload):

    output = store.get_all_challenges()

    add_report(output)

    return "accept"


def get_all_tournaments(payload):

    output = store.get_all_tournaments()

    add_report(output)

    return "accept"

def get_top_players(payload):

    output = store.get_top_players()

    add_report(output)

    return "accept"

def get_top_tournament_players(payload):

    output = store.get_top_players_tournaments()

    add_report(output)

    return "accept"


def get_round_fixtures(payload):

    output = store.get_round_fixtures(payload)

    if output["success"]:
        add_report(output["result"])
        return "accept"
    else:
        add_report(f"Failed to get fixture. Error: {output['error']}")
        return  'reject'
    
def get_round_fixture(payload):

    output = store.get_round_fixture(payload)

    if output["success"]:
        add_report(output["result"])
        return "accept"
    else:
        add_report(f"Failed to get round fixture. Error: {output['error']}")
        return  'reject'
    

def get_challenge(payload):

    output = store.get_challenge_client(payload)

    if output["success"]:
        add_report(output["result"])
        return "accept"
    else:
        add_report(f"Failed to Fetch Challenge. Error: {output['error']}")
        return  'reject'
    
def get_player(payload):

    output = store.get_player_leaderboard(payload)

    if output["success"]:
        add_report(output["result"])
        return "accept"
    else:
        add_report(f"Failed to Fetch player. Error: {output['error']}")
        return  'reject'
    

def get_player_tournament_board(payload):

    output = store.get_player_leaderboard_tournaments(payload)

    if output["success"]:
        add_report(output["result"])
        return "accept"
    else:
        add_report(f"Failed to Fetch player. Error: {output['error']}")
        return  'reject'
    
    
def get_tournament(payload):

    output = store.get_tournament_client(payload)

    if output["success"]:
        add_report(output["result"])
        return "accept"
    else:
        add_report(f"Failed to Fetch Tournament. Error: {output['error']}")
        return  'reject'

    
def get_player_fixture(payload):
    
    output = store.get_player_fixture(payload)

    if output["success"]:
        add_report(output["result"])
        return "accept"
    else:
        add_report(f"Failed to make move. Error: {output['error']}")
        return  'reject'


handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}


advance_method_handlers = {
    'create_challenge': create_challenge,
    'accept_challenge': accept_challenge,
    'make_move': make_move,
    'spawn': spawn,
    'create_tournament': create_tournament,
    'join_tournament':join_tournament,
    'add_opponent':add_opponent,
    'make_move_tournament':make_move_tournament,
    'delegate_move':delegate_move,
    "add_opponent_tournament":add_opponent_tournament,
    'tournament_chalenge_spawn':tournament_chalenge_spawn
}

inspect_handler_methods = {
    'get_all_challenges': get_all_challenges,
    'get_top_players':get_top_players,
    'get_top_tournament_players':get_top_tournament_players,
    'get_round_fixtures':get_round_fixtures,
    'get_round_fixture':get_round_fixture,
    'get_player_fixture':get_player_fixture,
    'get_all_tournaments': get_all_tournaments,
    'get_challenge':get_challenge,
    'get_tournament':get_tournament,
    "get_player":get_player,
    "get_player_tournament":get_player_tournament_board,
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
        

