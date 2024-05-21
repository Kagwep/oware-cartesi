from os import environ
import logging
import requests
from game.player import Player
from game.gameplay import GamePlay
from game.constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


player_one = Player('agent',PLAYER_ONE_HOUSES,0)
player_two = Player('opponent',PLAYER_TWO_HOUSES,0)

player_turn = player_one

game = GamePlay()

initial_board_state = game.game_init(player_one,player_two,player_turn)


def handle_advance(data):
    logger.info(f"Received advance request data {data}")
    return "accept"


def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    return "accept"


handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
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
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])
