from game_play.challenge import Challenge
from game_play.tournaments import Tournament
from utils.utils import HexConverter
from game_play.game.coordinate_house_map import coordinates_houses_map
import json
from game_play.leaderboard import Leaderboard

hexConverter = HexConverter()

class Store:
    def __init__(self):
        self.challenges = {}
        self.player_challenges = {}
        self.challenge_next_id = 0
        self.tournament_next_id = 0
        self.tournaments = {}
        self.player_tournaments = {}
        self.leader_board = Leaderboard()

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
    
    def make_move(self,sender, challenge_data):

        house = challenge_data.get("house")

        challenge_id = challenge_data.get("challenge_id")

        if not challenge_id:
            return {
                "success": False,
                "error": "Challenge ID is required"
            }
            
        challenge = self.challenges.get(challenge_id)


        if not challenge:
            return {
                "success": False,
                "error": "Challenge not found"
            }
        
        if sender != challenge.turn or not challenge.in_progress:
            return {
                "success": False,
                "error": "It's not your turn or the challenge is not in progress"
            }
        
        seeds = challenge.game.board.get_seeds()
        moves, moves_state = challenge.game.get_valid_moves(challenge.turn,seeds)

        coordinate = next((coord for coord, name in coordinates_houses_map.items() if name == house), None)

        if coordinate is None:
            return {
                "success": False,
                "error": "Invalid house name"
            }
        
        if coordinate not in moves:
            return {
                "success": False,
                "error": "Invalid MOve"
            }
            
        
        try:
            
            result = challenge.move(house)

            if result['challenge_ended']:
                self.delete_player_from_active_challenge(challenge)
                self.add_or_update_player(challenge.winner.name, challenge.winner.address, 100)
                opponent = challenge.opponent if challenge.winner == challenge.creator else challenge.creator
                self.add_or_update_player(opponent.name, opponent.address, 2)

            return {
                "success": True,
                "message": "Move made successfully",
                "result": result
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to make move: {str(e)}"
            }
        
        
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
    

    def delete_player_from_active_challenge(self,challenge):

        if self.player_challenges.get(challenge.opponet) is not None:
            del self.player_challenges[challenge.opponet]

        if self.player_challenges.get(challenge.creator) is not None:
            del self.player_challenges[challenge.creator]

    def get_all_challenges(self):

        challenge_keys = self.challenges.keys()
        challenge_list = []

        for challenge_id in challenge_keys:
            challenge = self.challenges.get(challenge_id)

            challenge_list.append({
                "challenge_id": challenge_id,
                "creator" : challenge.creator,
                "opponent": challenge.opponet,
                "in_progress":  challenge.in_progress,
                "game_ended": challenge.game_ended,
                "winner": challenge.winner,
                "state": challenge.game.state.get_board_state()
            })
        
        output = json.dumps({"challenges": challenge_list})

        return output
    

    def add_or_update_player(self,player_name, eth_address, score_change):
        """
        Add a new player or update an existing player's score.
        
        :param leaderboard: Leaderboard instance
        :param player_name: Name of the player
        :param eth_address: Ethereum address of the player
        :param score_change: Score to be added
        """
        if eth_address not in self.leaderboard.players:
            self.leaderboard.add_player(player_name, eth_address)
        self.leaderboard.update_score(eth_address, score_change)