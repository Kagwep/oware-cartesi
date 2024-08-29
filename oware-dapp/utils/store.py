from game_play.challenge import Challenge
from game_play.game.constants import CHALLENGE_TYPE_AI_VS_AI, CHALLENGE_TYPE_USER_VS_AI
from game_play.tournaments import OPlayer, Tournament
from utils.utils import HexConverter
from game_play.game.coordinate_house_map import coordinates_houses_map
import json
from game_play.leaderboard import Leaderboard

hexConverter = HexConverter()

class Store:
    def __init__(self):
        self.challenges = {}
        self.player_challenges = {}
        self.player_tournaments = {}
        self.challenge_next_id = 0
        self.tournament_next_id = 0
        self.tournaments = {}
        self.player_tournaments = {}
        self.leader_board = Leaderboard()
        self.model_addresses = self.load_model_addresses()

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
            challenge_type = challenge_data.get("challenge_type")
            creator_model_name = challenge_data.get("model")

            # Validate required fields
            if not all([creator_name, rounds, challenge_type]):
                return {
                    "success": False,
                    "error": "Missing required fields: creator_name or rounds"
                }

            # Additional validation for AI-related challenges
            if challenge_type in [CHALLENGE_TYPE_USER_VS_AI, CHALLENGE_TYPE_AI_VS_AI] and not creator_model_name:
                return {
                    "success": False,
                    "error": "Model name is required for AI-related challenges"
                }

            challenge = Challenge(creator_name, creator_address, rounds,challenge_type, challenge_id, creator_model_name)
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

        if self.player_tournaments.get(creator_address) is not None:
            return {
                "success": False,
                "error": "Player already has an active tournament"
            }
        
        try:
            tournament_id = self.get_next_tournament_id()

            number_of_players = tournament_data.get("number_of_players")
            rounds_per_challenge = tournament_data.get("rounds_per_challenge")

            # Validate required fields
            if not all([rounds_per_challenge]):
                return {
                    "success": False,
                    "error": "Missing required fields:  rounds per challenge"
                }

            tournament = Tournament(creator_address,number_of_players, rounds_per_challenge)
            self.tournaments[tournament_id] = tournament
            self.player_tournaments[creator_address] = tournament_id

            return {
                "success": True,
                "tournament_id": tournament_id
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e) 
            }
        
    

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
    
    def add_AI_opponent(self,creator_address, challenge_data):
        
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

        
        if creator_address != challenge.creator.address:
            return {
            "success": False,
            "error": "Not Challenge Creator"
           }
        
        model_name = challenge_data.get("model")

        if not model_name:
            return {
                "success": False,
                "error": "Model name is required"
            }
        
        agent_address = self.model_addresses.get(model_name)
        if not agent_address:
            return {
                "success": False,
                "error": "Invalid model name"
            }

        try:
            challenge.add_opponent("Oware_agent", agent_address, model_name)
            self.player_challenges[agent_address] = challenge_id

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
        challenge_type = challenge_data.get("challenge_type")

        

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

            if challenge_type in [ CHALLENGE_TYPE_AI_VS_AI]:
                challenge.spawn()
                challenge.run_ai_vs_ai_match()
            else:
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

    def join_tournament(self, player_address, tournament_data):

        tournament_id = tournament.get("tournament_id")

        if not tournament_id:
            return {
                "success": False,
                "error": "Tournament ID is required"
            }

        tournament = self.get_tournament(tournament_id)
        
        if not tournament:
            return {
                "success": False,
                "error": "Tournament not found"
            }
        
        player_name = tournament_data.get("creator_name")
        model_name = tournament_data.get("model")


        # Validate required fields
        if not all([player_name]):
            return {
                "success": False,
                "error": "Missing required fields:  player_name"
            }


        player = OPlayer(player_name, player_address, model_name)

        if player in tournament.players:
            return {
            "success": False,
            "error": "already in tournament"
           }
        
        try:
            tournament.join_tournament(player)
            return {
                "success": True,
                "message": "Joined tournament successfully",
                "tournament_id": tournament_id
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to start challenge: {str(e)}"
            }
    
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
        
        if sender != challenge.turn.player_address or not challenge.in_progress:
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
        
    def make_move_tournament(self,sender, tournament_data):

        house = tournament_data.get("house")

        tournament_id = tournament_data.get("tournament_id")
        challenge_id = tournament_data.get("challenge_id")

        if not tournament_id:
            return {
                "success": False,
                "error": "Tournament ID is required"
            }
        
        if not challenge_id:
            return {
                "success": False,
                "error": "Challenge ID is required"
            }
            
        tournament = self.tournaments.get(tournament_id)


        if not tournament:
            return {
                "success": False,
                "error": "Tournament not found"
            }
        
        challenge = self.tournaments.challenges.get(challenge_id)
        
        if sender != challenge.turn.player_address or not challenge.in_progress:
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
                "opponent": challenge.opponent,
                "in_progress":  challenge.in_progress,
                "game_ended": challenge.game_ended,
                "winner": challenge.winner,
                "created_at":challenge.created_at,
                "challenge_type":challenge.challenge_type,
                "rounds": challenge.rounds,
                "current_round":challenge.current_round,
                "player_turn":challenge.turn.get_player() if challenge.turn is not None else None,
                "player_one_captured":challenge.player_one.get_player() if challenge.player_one is not None else None,
                "player_two_captured":challenge.player_two.get_player() if challenge.player_two is not None else None,
                "state": challenge.game.board.get_seeds() if challenge.game is not None else None
            })
        
        output = json.dumps({"challenges": challenge_list})

        return output
    
    def get_challenge_client(self,payload_data):

        challenge_id = payload_data.get("challenge_id")

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
        

        challenge_list = []

        challenge_list.append({
                "challenge_id": challenge_id,
                "creator" : challenge.creator,
                "opponent": challenge.opponent,
                "in_progress":  challenge.in_progress,
                "game_ended": challenge.game_ended,
                "winner": challenge.winner,
                "created_at":challenge.created_at,
                "challenge_type":challenge.challenge_type,
                "rounds": challenge.rounds,
                "current_round":challenge.current_round,
                "player_turn":challenge.turn.get_player() if challenge.turn is not None else None,
                "player_one_captured":challenge.player_one.get_player() if challenge.player_one is not None else None,
                "player_two_captured":challenge.player_two.get_player() if challenge.player_two is not None else None,
                "state": challenge.game.board.get_seeds() if challenge.game is not None else None
            })

        
        output = json.dumps({"challenge": challenge_list})

        return {
                "success": True,
                "message": "challenge fetched",
                "result": output
            }

 
    

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

    def get_top_players(self,request_data):

        N = request_data.get('N')

        top_players = self.leader_board.get_top_players() if N is not None else self.leader_board.get_top_players(N)

        output = json.dumps({"top_players": top_players})

        return output
    
    def get_round_fixtures(self,request_data):
        
        tournament_id = request_data.get('tournament_id')
        round_number = request_data.get('round_number')
        

        # Validate required fields
        if not all([tournament_id, round_number]):
            return {
                "success": False,
                "error": "Missing required fields:  tournament id or round number"
            }
        
        tournament = self.tournaments.get(tournament_id)

        if not tournament:
            return {
                "success": False,
                "error": "Tournament not found"
            }
        

        try:
            
            fixtures = tournament.get_round_fixtures(round_number)

            output = json.dumps({"round_fixtures": fixtures})

            return {
                "success": True,
                "result": output
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to make move: {str(e)}"
            }


    def get_round_fixture(self,request_data):
        
        tournament_id = request_data.get('tournament_id')
        round_number = request_data.get('round_number')
        challenge_id = request_data.get('challenge_id')
        

        # Validate required fields
        if not all([tournament_id, round_number,challenge_id]):
            return {
                "success": False,
                "error": "Missing required fields:  tournament id or round number or challenge_id"
            }
        
        tournament = self.tournaments.get(tournament_id)

        if not tournament:
            return {
                "success": False,
                "error": "Tournament not found"
            }
        
        try:
            
            fixture = tournament.get_fixture(round_number,challenge_id)

            output = json.dumps({"round_fixture": fixture})

            return {
                "success": True,
                "result": output
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to make move: {str(e)}"
            }
        
    def get_player_fixture(self, request_data):
        tournament_id = request_data.get('tournament_id')
        round_number = request_data.get('round_number')
        player_address = request_data.get('player_address')

        # Validate required fields
        if not all([tournament_id, round_number,player_address]):
            return {
                "success": False,
                "error": "Missing required fields:  tournament id or round number or player address"
            }
        
        tournament = self.tournaments.get(tournament_id)

        if not tournament:
            return {
                "success": False,
                "error": "Tournament not found"
            }
        
        try:
            
            fixture = tournament.get_player_fixture(round_number,player_address)

            output = json.dumps({"player_fixture": fixture})

            return {
                "success": True,
                "result": output
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to make move: {str(e)}"
            }
        
    def load_model_addresses(self):
        """Load model addresses from the JSON file."""
        try:
            with open('model_addresses.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
        
    def get_all_tournaments(self):

        tournaments_keys = self.tournaments.keys()
        tournaments_list = []

        for tournament_id in tournaments_keys:
            tournament = self.tournaments.get(tournament_id)

            tournaments_list.append({
                "tournament_id": tournament_id,
                "no_of_players": tournament.max_players,
                "creator" : tournament.creator,
                "players": tournament.players,
                "in_progress":  tournament.in_progress,
                "game_ended": tournament.game_ended,
                "winner": tournament.tournament_winner,
                "rounds_per_challenge":tournament.rounds_per_challenge,
                "fixtures": tournament.fixtures,
                "started_at":tournament.started_at,
                "ended_at":tournament.ended_at,
                "round_winners":tournament.round_winners,
                "active_round":tournament.active_round
            })
        
        output = json.dumps({"tournaments": tournaments_list})

        return output
    
