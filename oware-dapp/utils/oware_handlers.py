import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Callable
from os import environ

import requests

from .utils import HexConverter
from .store import Store

store = Store()

# Setup
hexConverter = HexConverter()


logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


class BaseHandler(ABC):
    @abstractmethod
    def handle(self, payload: Dict[str, Any], sender: str) -> str:
        pass


class AdvanceHandler(BaseHandler):
    def __init__(self, store: Store):
        self.store = store
        self.method_handlers: Dict[str, Callable] = {
            'create_challenge': self.create_challenge,
            'accept_challenge': self.accept_challenge,
            'make_move': self.make_move,
            'spawn': self.spawn,
            'create_tournament': self.create_tournament,
            'join_tournament': self.join_tournament,
            'add_opponent': self.add_opponent,
            'make_move_tournament': self.make_move_tournament,
            'delegate_move': self.delegate_move,
            'add_opponent_tournament': self.add_opponent_tournament,
            'tournament_challenge_spawn': self.tournament_challenge_spawn,
            'surrender_in_challenge': self.surrender_in_challenge,
        }

    def handle(self, data: Dict[str, Any]) -> str:
        try:
            payload = json.loads(hexConverter.hextostr(data["payload"]))
        except Exception as e:
            return "reject"
        
        method = payload.get("method")
        sender = data["metadata"]["msg_sender"]

        logger.info(f"Received advance request data {payload}")

        handler = self.method_handlers.get(method)

        if not handler:
            add_report("Invalid Method")
            return "reject"
        
        return handler(payload, sender)

    def create_challenge(self, payload: Dict[str, Any], sender: str) -> str:
            result = self.store.create_challenge(sender, payload)
            if result["success"]:
                add_notice(f"challenge with id {result['challenge_id']} was was created by {sender} ")
                return "accept"
            else:
                add_report(f"Failed to create challenge. Error: {result['error']}")
                return "reject"

    def create_tournament(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.create_tournament(sender, payload)
        if result["success"]:
            add_notice(f"Tournament with id {result['tournament_id']} was was created by {sender} ")
            return "accept"
        else:
            add_report(f"Failed to create challenge. Error: {result['error']}")
            return "reject"

    def join_tournament(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.join_tournament(sender, payload)
        if result["success"]:
            add_notice(f"tournement with id {result['tournament_id']} was was created by {sender} ")
            return "accept"
        else:
            add_report(f"Failed to create tournament. Error: {result['error']}")
            return "reject"

    def add_opponent(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.add_AI_opponent(sender, payload)
        if result["success"]:
            add_notice(f"opponnet {result['challenge_id']} was was added by {sender} ")
            return "accept"
        else:
            add_report(f"Failed to add opponent. Error: {result['error']}")
            return "reject"

    def add_opponent_tournament(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.add_agent_opponent_tournament(sender, payload)
        if result["success"]:
            add_notice(f"opponnet {result['tournament_id']} was was added by {sender} ")
            return "accept"
        else:
            add_report(f"Failed to add opponent. Error: {result['error']}")
            return "reject"

    def accept_challenge(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.join_challenge(sender, payload)
        if result["success"]:
            add_notice(f" challenge with id {result['challenge_id']} was accepted by player {sender}")
            return "accept"
        else:
            add_report(f"Failed to join challenge. Error: {result['error']}")
            return "reject"

    def spawn(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.start_challenge(sender, payload)
        if result["success"]:
            add_notice(f" Creator {sender} of challege {result['challenge_id']} has initialized the game")
            return 'accept'
        else:
            add_report(f"Failed to start challenge. Error: {result['error']}")
            return "reject"

    def tournament_challenge_spawn(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.tournament_start_challenge(sender, payload)
        if result["success"]:
            add_notice(f" Creator {sender} of challege {result['challenge_id']} has initialized the game")
            return 'accept'
        else:
            add_report(f"Failed to start challenge. Error: {result['error']}")
            return "reject"

    def make_move(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.make_move(sender, payload)
        if result["success"]:
            add_notice(f"Move made successfully. Result: {str(result['result'])}")
            return 'accept'
        else:
            add_report(f"Failed to make move. Error: {result['error']}")
            return 'reject'

    def delegate_move(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.delegate_make_move(sender, payload)
        if result["success"]:
            add_notice(f"Move made successfully. Result: {str(result['result'])}")
            return 'accept'
        else:
            add_report(f"Failed to make move. Error: {result['error']}")
            return 'reject'

    def make_move_tournament(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.make_move_tournament(sender, payload)
        if result["success"]:
            add_notice(f"Move made successfully. Result: {str(result['result'])}")
            return 'accept'
        else:
            add_report(f"Failed to make move. Error: {result['error']}")
            return 'reject'

    def surrender_in_challenge(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.surrender_in_challenge(sender, payload)
        if result["success"]:
            add_notice(f"Surrendered successfully. Result: {str(result['result'])}")
            return 'accept'
        else:
            add_report(f"Failed to Sirrender. Error: {result['error']}")
            return 'reject'

    def surrender_in_challenge_tournament(self, payload: Dict[str, Any], sender: str) -> str:
        result = self.store.surrender_in_challenge_tournament(sender, payload)
        if result["success"]:
            add_notice(f"Surrendered successfully. Result: {str(result['result'])}")
            return 'accept'
        else:
            add_report(f"Failed to Sirrender. Error: {result['error']}")
            return 'reject'

class InspectHandler(BaseHandler):
    def __init__(self, store: Store):
        self.store = store
        self.method_handlers: Dict[str, Callable] = {
            'get_all_challenges': self.get_all_challenges,
            'get_top_players': self.get_top_players,
            'get_top_tournament_players': self.get_top_tournament_players,
            'get_round_fixtures': self.get_round_fixtures,
            'get_round_fixture': self.get_round_fixture,
            'get_player_fixture': self.get_player_fixture,
            'get_all_tournaments': self.get_all_tournaments,
            'get_challenge': self.get_challenge,
            'get_tournament': self.get_tournament,
            'get_player': self.get_player,
            'get_player_tournament': self.get_player_tournament_board,
        }

    def handle(self, data: Dict[str, Any]) -> str:
        try:
            payload = json.loads(hexConverter.hextostr(data["payload"]))
        except Exception as e:
            return "reject"
        
        method = payload.get("method")
        
        logger.info(f"Received inspect request data {payload}")

        handler = self.method_handlers.get(method)

        if not handler:
            add_report("Invalid Method")
            return "reject"
        
        return handler(payload)
    
    def get_all_challenges(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_all_challenges()
        add_report(output)
        return "accept"

    def get_all_tournaments(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_all_tournaments()
        add_report(output)
        return "accept"

    def get_top_players(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_top_players()
        add_report(output)
        return "accept"

    def get_top_tournament_players(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_top_players_tournaments()
        add_report(output)
        return "accept"

    def get_round_fixtures(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_round_fixtures(payload)
        if output["success"]:
            add_report(output["result"])
            return "accept"
        else:
            add_report(f"Failed to get fixture. Error: {output['error']}")
            return 'reject'

    def get_round_fixture(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_round_fixture(payload)
        if output["success"]:
            add_report(output["result"])
            return "accept"
        else:
            add_report(f"Failed to get round fixture. Error: {output['error']}")
            return 'reject'

    def get_challenge(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_challenge_client(payload)
        if output["success"]:
            add_report(output["result"])
            return "accept"
        else:
            add_report(f"Failed to Fetch Challenge. Error: {output['error']}")
            return 'reject'

    def get_player(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_player_leaderboard(payload)
        if output["success"]:
            add_report(output["result"])
            return "accept"
        else:
            add_report(f"Failed to Fetch player. Error: {output['error']}")
            return 'reject'

    def get_player_tournament_board(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_player_leaderboard_tournaments(payload)
        if output["success"]:
            add_report(output["result"])
            return "accept"
        else:
            add_report(f"Failed to Fetch player. Error: {output['error']}")
            return 'reject'

    def get_tournament(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_tournament_client(payload)
        if output["success"]:
            add_report(output["result"])
            return "accept"
        else:
            add_report(f"Failed to Fetch Tournament. Error: {output['error']}")
            return 'reject'

    def get_player_fixture(self, payload: Dict[str, Any]) -> str:
        output = self.store.get_player_fixture(payload)
        if output["success"]:
            add_report(output["result"])
            return "accept"
        else:
            add_report(f"Failed to make move. Error: {output['error']}")
            return 'reject'
    

def add_notice(data: str) -> None:
    logger.info(f"Adding notice {data}")
    notice = {"payload": hexConverter.strtohex(data)}
    response = requests.post(f"{rollup_server}/notice", json=notice)
    logger.info(f"Received notice status {response.status_code} body {response.content}")

def add_report(output: str = "") -> None:
    logger.info(f"Adding report {output}")
    report = {"payload": hexConverter.strtohex(output)}
    response = requests.post(f"{rollup_server}/report", json=report)
    logger.info(f"Received report status {response.status_code}")

def handle_request(data: Dict[str, Any], handler: BaseHandler) -> str:
    return handler.handle(data)


advance_handler = AdvanceHandler(store)
inspect_handler = InspectHandler(store)

handlers = {
    "advance_state": lambda data: handle_request(data, advance_handler),
    "inspect_state": lambda data: handle_request(data, inspect_handler),
}
