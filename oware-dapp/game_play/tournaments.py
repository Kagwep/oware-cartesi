import random
import time

class Tournament:
    def __init__(self, game, players):
        if len(players) != 8:
            raise ValueError("Tournament requires exactly 8 players")
        
        self.game = game
        self.players = players
        self.challenges = []
        self.round = 1
        self.winners = []
        self.tournament_winner = None
        self.started_at = None
        self.ended_at = None

    def start(self):
        self.started_at = time.time()
        self.create_first_round()

    def create_first_round(self):
        random.shuffle(self.players)
        for i in range(0, 8, 2):
            challenge = Challenge(self.players[i], f"R1-M{i//2+1}")
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
        for i in range(0, len(self.winners), 2):
            challenge = Challenge(self.winners[i], f"R{self.round}-M{i//2+1}")
            challenge.add_opponent(self.winners[i+1])
            challenge.game = self.game
            challenge.spawn()
            self.challenges.append(challenge)

    def get_current_challenges(self):
        return [c for c in self.challenges if c.id.startswith(f"R{self.round}")]

    def get_challenge_by_player(self, player_address):
        current_challenges = self.get_current_challenges()
        for challenge in current_challenges:
            if player_address in [challenge.player_one, challenge.player_two]:
                return challenge
        return None

    def make_move(self, player_address, action):
        challenge = self.get_challenge_by_player(player_address)
        if challenge and challenge.turn == player_address:
            state, game_ended, winner = challenge.move(action, challenge.state)
            if game_ended:
                self.advance_tournament()
            return state, game_ended, winner
        return None, False, False

    def get_tournament_status(self):
        return {
            "round": self.round,
            "current_challenges": [{"id": c.id, "player_one": c.player_one, "player_two": c.player_two, "turn": c.turn} 
                                   for c in self.get_current_challenges()],
            "winners": self.winners,
            "tournament_winner": self.tournament_winner,
            "started_at": self.started_at,
            "ended_at": self.ended_at
        }