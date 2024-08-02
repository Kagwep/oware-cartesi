from game_play.challenge import Challenge
from game_play.tournaments import Tournament

class Store:
    def __init__(self):
        self.challenges = {}
        self.player_challenges = {}
        self.challenge_next_id = 0
        self.tournament_next_id = 0
        self.tournaments = {}
        self.player_tournaments = {}

    def get_next_challenge_id(self):
        self.challenge_next_id += 1
        return self.challenge_next_id

    def get_next_tournament_id(self):
        self.tournament_next_id += 1
        return self.tournament_next_id

    def add_challenge(self, challenge):
        challenge_id = self.get_next_challenge_id()
        self.challenges[challenge_id] = challenge
        return challenge_id

    def get_challenge(self, challenge_id):
        return self.challenges.get(challenge_id)

    def add_tournament(self, tournament):
        tournament_id = self.get_next_tournament_id()
        self.tournaments[tournament_id] = tournament
        return tournament_id

    def get_tournament(self, tournament_id):
        return self.tournaments.get(tournament_id)

    def add_player_challenge(self, player_address, challenge_id):
        if player_address not in self.player_challenges:
            self.player_challenges[player_address] = set()
        self.player_challenges[player_address].add(challenge_id)

    def add_player_tournament(self, player_address, tournament_id):
        if player_address not in self.player_tournaments:
            self.player_tournaments[player_address] = set()
        self.player_tournaments[player_address].add(tournament_id)

    def get_player_challenges(self, player_address):
        return self.player_challenges.get(player_address, set())

    def get_player_tournaments(self, player_address):
        return self.player_tournaments.get(player_address, set())