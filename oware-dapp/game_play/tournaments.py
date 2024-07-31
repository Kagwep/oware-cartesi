import random
import time
from collections import namedtuple
from .challenge import Challenge

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

        if not self.is_valid_player_count(self.number_of_players):
            raise ValueError(f"Invalid number of players. Must be an even number between 4 and 16 inclusive.")
  

    def join_tournament(self,name,address,model_name= None):
        if len(self.players) >= self.max_players:
            raise ValueError("The tournament is already full")
        player = OPlayer(name, address, model_name)
        self.players.append(player)
        if len(self.players) == self.max_players:
            self.start()

    def start(self):
        self.started_at = time.time()
        self.create_fixtures(self.players)

    def create_fixtures(self, players):
        """ Randomly pair players and create fixtures for a round of challenges. """
        random.shuffle(players)
        round_fixtures = []
        for i in range(0, len(players), 2):
            if i + 1 < len(players):  # Ensure there's a pair to form a challenge
                challenge_id = self.next_challenge_id
                player_one = players[i]
                player_two = players[i + 1]
                new_challenge = Challenge(player_one.name, player_one.address,self.rounds_per_challenge,challenge_id,player_one.model_name)
                new_challenge.add_opponent(player_two.name, player_two.address, player_two.model_name)
                new_challenge.spawn()
                self.challenges.append(new_challenge)
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
        return expected_winners == actual_winners
    
    def prepare_next_round(self):
        """Prepare fixtures for the next round if the tournament isn't over."""
        winners = self.round_winners[self.active_round]
        if len(winners) == 1:
            self.tournament_winner = winners[0]
            self.ended_at = time.time()
            return

        self.active_round += 1
        winning_players = [player for player in winners]

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

    def get_player_fixture(self, round_number, player_address):
        """ Find the fixture for a specific player in a given round. """
        for fixture in self.fixtures.get(round_number, []):
            if fixture.player_one.address == player_address or fixture.player_two.address == player_address:
                return fixture
        return None

    def is_valid_player_count(self, count):
        """ Validate the player count is within the allowed range. """
        return count in self.allowable_player_counts