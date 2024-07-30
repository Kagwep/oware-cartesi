import random
import time
from collections import namedtuple
from .challenge import Challenge

# Define a Player named tuple to store player attributes
OPlayer = namedtuple('Player', ['name', 'address', 'model_name'])

class Tournament:
    def __init__(self,creator, number_of_players, rounds_per_challenge):
        self.creator = creator
        self.max_players = number_of_players
        self.rounds_per_challenge = rounds_per_challenge
        self.players = []
        self.challenges = []
        self.next_challenge_id = 1
        self.round = 1
        self.winners = []
        self.tournament_winner = None
        self.started_at = None
        self.ended_at = None
        self.allowable_player_counts = [4, 6, 8, 10, 12, 14, 16]

        if not self.is_valid_player_count(self.number_of_players):
            raise ValueError(f"Invalid number of players. Must be an even number between 4 and 16 inclusive.")
  

    def add_player(self,name,address,model_name= None):
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
        self.challenges = []  # Clear existing challenges if any
        for i in range(0, len(players), 2):
            if i + 1 < len(players):  # Ensure there's a pair to form a challenge
                challenge_id = self.next_challenge_id
                new_challenge = Challenge(players[i], players[i + 1], self.rounds_per_challenge, challenge_id)
                self.challenges.append(new_challenge)

    def create_first_round(self):
        random.shuffle(self.players)
        for i in range(0, len(self.players), 2):
            challenge = Challenge(self.players[i], f"R1-M{i//2+1}", self.rounds_per_challenge)
            challenge.add_opponent(self.players[i+1])
            challenge.game = self.game
            challenge.spawn()
            self.challenges.append(challenge)

    def advance_tournament(self):
        current_round_challenges = [c for c in self.challenges if c.id.startswith(f"R{self.round}")]
        
        if all(c.game_ended for c in current_round_challenges):
            self.winners = [c.winner_address for c in current_round_challenges if c.winner_address is not None]
            
            if len(self.winners) == 1:
                self.tournament_winner = self.winners[0]
                self.ended_at = time.time()
                return True  # Tournament ended
            
            self.round += 1
            self.create_next_round()
        
        return False  # Tournament continues

    def create_next_round(self):
        new_round_winners = []
        for i in range(0, len(self.winners), 2):
            challenge = Challenge(self.winners[i], f"R{self.round}-M{i//2+1}", self.rounds_per_challenge)
            challenge.add_opponent(self.winners[i+1])
            challenge.game = self.game
            challenge.spawn()
            new_round_winners.append(challenge)
        self.challenges = new_round_winners

    def is_valid_player_count(self, count):
        """ Validate the player count is within the allowed range. """
        return count in self.allowable_player_count