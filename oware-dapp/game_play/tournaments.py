import random
import time
from collections import namedtuple
from .challenge import Challenge
from game_play.game.constants import MODEL_ADDRESSES
from datetime import datetime, timezone
import logging
from .common import leader_board

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

# Define a Player named tuple to store player attributes
OPlayer = namedtuple('Player', ['name', 'address', 'model_name'])
Fixture = namedtuple('Fixture', ['challenge_id', 'player_one', 'player_two'])

class Tournament:
    def __init__(self,creator, number_of_players, rounds_per_challenge):
        self.creator = creator
        self.max_players = number_of_players
        self.rounds_per_challenge = rounds_per_challenge
        self.players = []
        self.challenges = {}
        self.next_challenge_id = 1
        self.round = 1
        self.winners = []
        self.tournament_winner = None
        self.started_at = None
        self.ended_at = None
        self.allowable_player_counts = [4, 6, 8, 10, 12, 14, 16]
        self.fixtures = {}
        self.active_round = 1
        self.round_winners = {}
        self.in_progress =  False

        if not self.is_valid_player_count(self.max_players):
            raise ValueError(f"Invalid number of players. Must be an even number between 4 and 16 inclusive.")
  

    def join_tournament(self,player):
        if len(self.players) >= self.max_players:
            raise ValueError("The tournament is already full")
        self.players.append(player)
        if len(self.players) == self.max_players:
            self.start()

    def start(self):
        self.started_at = datetime.now(timezone.utc).timestamp()
        self.create_fixtures(self.players)
        self.in_progress = True

    def create_fixtures(self, players):
        """ Randomly pair players and create fixtures for a round of challenges. """
        random.shuffle(players)
        round_fixtures = []
        for i in range(0, len(players), 2):
            if i + 1 < len(players):  # Ensure there's a pair to form a challenge
                challenge_id = self.next_challenge_id
                player_one = players[i]
                player_two = players[i + 1]

                challenge_type = 1

                if (player_one.address == MODEL_ADDRESSES.get(player_one.name)) and (player_two.address == MODEL_ADDRESSES.get(player_two.name)):
                    challenge_type = 3
                elif (player_one.address == MODEL_ADDRESSES.get(player_one.name)) or (player_two.address == MODEL_ADDRESSES.get(player_two.name)):
                    challenge_type = 2
                else:
                    challenge_type = 1  


                new_challenge = Challenge(player_one.name, player_one.address,self.rounds_per_challenge,challenge_type,challenge_id,player_one.model_name)
                new_challenge.add_opponent(player_two.name, player_two.address, player_two.model_name)

                if challenge_type != 3 :
                  
                    result = new_challenge.spawn()

                self.challenges[challenge_id] = new_challenge
                round_fixtures.append(Fixture(challenge_id, player_one, player_two))
                self.next_challenge_id += 1

        self.fixtures[self.round] = round_fixtures
        self.round += 1

    def make_move(self,challenge_id,selected_house):
        challenge = self.challenges.get(challenge_id)
        result = challenge.move(selected_house)

        if result["challenge_ended"]:
            self.update_tournament_state(challenge_id, result["challenge_winner"])
        
        return result

    def update_tournament_state(self, challenge_id, winner):
        self.winners.append(winner)
        self.round_winners.setdefault(self.active_round, []).append(winner)
        """Check if all challenges in the current round are completed."""
        
        if self.is_round_complete():
            self.prepare_next_round()   


    def is_round_complete(self):
        """Check if all challenges in the current round are completed."""
        expected_winners = len(self.fixtures[self.active_round])
        actual_winners = len(self.round_winners.get(self.active_round, []))
        logger.info(f"After turn {expected_winners == actual_winners}")
        logger.info(f"After turn {expected_winners,actual_winners}")
        return expected_winners == actual_winners
    
    def prepare_next_round(self):
        """Prepare fixtures for the next round if the tournament isn't over."""
        winners = self.round_winners[self.active_round]
        if len(winners) == 1:
            self.tournament_winner = winners[0]
            self.ended_at = datetime.now(timezone.utc).timestamp()
            self.in_progress = False
            leader_board.add_or_update_tournament_player(winners[0].name, winners[0].address, 50)
            return

        self.active_round += 1
        winning_players = [OPlayer(player.name, player.address, player.model_name) for player in winners]

        self.create_fixtures(winning_players)
    
    def get_fixture(self, round_number, challenge_id):
        """ Retrieve a specific fixture by round number and challenge ID. """
        for fixture in self.fixtures.get(round_number, []):
            if fixture.challenge_id == challenge_id:
                return fixture
        return None

    def get_round_fixtures(self, round_number):
        """ Retrieve all fixtures for a specific round. """
        return self.fixtures.get(round_number, [])

    def get_player_fixture(self, round_number, address):
        """ Find the fixture for a specific player in a given round. """
        for fixture in self.fixtures.get(round_number, []):
            if fixture.player_one.address == address or fixture.player_two.address == address:
                return fixture
        return None

    def is_valid_player_count(self, count):
        """ Validate the player count is within the allowed range. """
        return count in self.allowable_player_counts