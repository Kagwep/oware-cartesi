from game_play.challenge import Challenge
from game_play.tournaments import Tournament
from utils.utils import HexConverter


hexConverter = HexConverter()

class Store:
    def __init__(self):
        self.challenges = {}
        self.player_challenges = {}
        self.challenge_next_id = 0
        self.tournament_next_id = 0
        self.tournaments = {}
        self.player_tournaments = {}

    def create_challenge(self, creator_address, challenge_data):

        if self.player_challenges.get(creator_address) is not None:
            return {
                "success": False,
                "error": "Player already has an active challenge"
            }
        
        try:
            challenge_id = self.get_next_challenge_id()
            creator_name = challenge_data.get("creator_name")
            rounds = challenge_data.get("rounds")
            creator_model_name = challenge_data.get("model")

            # Validate required fields
            if not all([creator_name, rounds]):
                return {
                    "success": False,
                    "error": "Missing required fields: creator_name or rounds"
                }

            challenge = Challenge(creator_name, creator_address, rounds, challenge_id, creator_model_name)
            self.challenges[challenge_id] = challenge
            self.player_challenges[creator_address] = challenge_id

            return {
                "success": True,
                "challenge_id": challenge_id
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e) 
            }


    def create_tournament(self, creator_address, tournament_data):
        tournament = Tournament(creator_address, **tournament_data)
        tournament_id = self.add_tournament(tournament)
        self.add_player_tournament(creator_address, tournament_id)
        return tournament_id

    def join_challenge(self, player_address, challenge_data):

        challenge_id = challenge_data.get("challenge_id")

        if not challenge_id:
            return {
                "success": False,
                "error": "Challenge ID is required"
            }

        challenge = self.get_challenge(challenge_id)
        
        if not challenge:
            return {
                "success": False,
                "error": "Challenge not found"
            }

        
        if player_address == challenge.creator.address:
            return {
            "success": False,
            "error": "Creator cannot join their own challenge"
           }
        
        name = challenge_data.get("name")
        model_name = challenge_data.get("model")

        if not name:
            return {
                "success": False,
                "error": "Player name is required"
            }

        try:
            challenge.add_opponent(name, player_address, model_name)
            self.player_challenges[player_address] = challenge_id

            return {
                "success": True,
                "message": "Successfully joined the challenge",
                "challenge_id": challenge_id
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to join challenge: {str(e)}"
            }
        
    def start_challenge(self,player_address,challenge_data):

        challenge_id = challenge_data.get("challenge_id")

        if not challenge_id:
            return {
                "success": False,
                "error": "Challenge ID is required"
            }

        challenge = self.get_challenge(challenge_id)

        if not challenge:
            return {
                "success": False,
                "error": "Challenge not found"
            }


        if player_address != challenge.creator.address:
            return {
                "success": False,
                "error": "Only the challenge creator can start the challenge"
            }
        
        if not challenge.opponent:
            return {
                "success": False,
                "error": "Cannot start challenge without an opponent"
            }
        
        try:
            challenge.spawn()
            return {
                "success": True,
                "message": "Challenge started successfully",
                "challenge_id": challenge_id
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to start challenge: {str(e)}"
            }

    def join_tournament(self, player_address, tournament_id):
        tournament = self.get_tournament(tournament_id)
        if tournament and tournament.can_join(player_address):
            tournament.add_player(player_address)
            self.add_player_tournament(player_address, tournament_id)
            return True
        return False

    def get_next_challenge_id(self):
        self.challenge_next_id += 1
        return self.challenge_next_id

    def get_next_tournament_id(self):
        self.tournament_next_id += 1
        return self.tournament_next_id

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