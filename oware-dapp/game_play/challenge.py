import time 
import random
from collections import namedtuple
from game_play.game.player import Player
from game_play.game.gameplay import GamePlay
from game_play.game.constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES,MODEL_ADDRESSES
from game_play.game.coordinate_house_map import coordinates_houses_map
import os
import sys
import time
import tflite_runtime.interpreter as tflite
from .movesevaluator import GameplayEvaluationMoves
import logging
from  pathlib import Path
from .common import leader_board
from datetime import datetime, timezone


logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

OPlayer = namedtuple('Player', ['name', 'address', 'model_name'])

class Challenge:

    def __init__(self,creator_name, creator_address,rounds,challenge_type, _id ,creator_model_name = None ) -> None:
        self.challenge_type = challenge_type
        self.creator = OPlayer(creator_name, creator_address, creator_model_name)
        self.opponent = None
        self.player_one = None
        self.player_two = None
        self.game = None
        self.id = _id
        self.winner = None
        self.created_at =  datetime.now(timezone.utc).timestamp()
        self.game_ended = False
        self.turn = None
        self.model_player_one=  None
        self.model_player_two = None
        self.player_one_previous_captured = 0
        self.player_two_previous_captured = 0
        self.stale_mate = False
        self.players_captures_track_count = 0
        self.stale_mate_count = 100
        self.oware_moves = None
        self.result = None
        self.rounds = rounds
        self.round_winners = {} 
        self.current_round = 1
        self.player_one_wins = 0
        self.player_two_wins = 0
        self.tiebreak_round = False
        self.in_progress = False
      
        
        
    def add_opponent(self,name,address,model_name= None):
        self.opponent = OPlayer(name, address, model_name)

    def spawn(self):
        
        random_number = random.randint(1, 6)

        if random_number > 3:
            self.player_one = Player(self.creator.name,PLAYER_ONE_HOUSES,0,self.creator.address,self.creator.model_name)
            self.player_two = Player(self.opponent.name,PLAYER_TWO_HOUSES,0,self.opponent.address,self.opponent.model_name)
            self.model_player_one = self.load_model_tflite(self.creator.model_name) if self.creator.model_name  else None
            self.model_player_two = self.load_model_tflite(self.opponent.model_name) if self.opponent.model_name  else None
        else:
            self.player_one = Player(self.opponent.name,PLAYER_ONE_HOUSES,0,self.opponent.address,self.opponent.model_name)
            self.player_two =  Player(self.creator.name,PLAYER_TWO_HOUSES,0,self.creator.address,self.creator.model_name)
            self.model_player_two = self.load_model_tflite(self.creator.model_name) if self.creator.model_name  else None
            self.model_player_one = self.load_model_tflite(self.opponent.model_name) if self.opponent.model_name  else None

        self.turn = self.player_one 

        game_play = GamePlay()
        game_play.game_init(self.player_one,self.player_two,self.turn)
        self.game = game_play
        self.oware_moves = GameplayEvaluationMoves()

        self.in_progress = True

        player_turn = self.turn.get_player()

       

        if (
            self.challenge_type == 2
            and player_turn['name'] in MODEL_ADDRESSES
        ):
            model = self.model_player_one if self.turn == self.player_one else self.model_player_two
            selected_house = self.select_house(model)
            result = self.agent_move(selected_house)
            if result:
                return result
        if (
            self.challenge_type == 3
            and player_turn['name'] in MODEL_ADDRESSES
        ):
            model = self.model_player_one if self.turn == self.player_one else self.model_player_two
            selected_house = self.select_house(model)
            result  = self.agent_move(selected_house)
            if result:
                return result

        return None

    def agent_move(self,selected_house):
            if selected_house is not None:
                result = self.move(selected_house)
                return result
            else:
                result =self.game.state.set_winner()
                challenge_winner, challenge_ended = self.check_winner(result)

                return {
                "game_result": result,
                "challenge_ended": challenge_ended,
                "challenge_winner": challenge_winner,
                "current_round": self.current_round,
                "player_one_wins": self.player_one_wins,
                "player_two_wins": self.player_two_wins,
                "challenge_id": self.id
                }

    def move(self,selected_house):

        seeds,captured = self.game.make_move(selected_house)
        self.game.state.update_board_state(seeds)
        

        if self.turn == self.player_two and captured > 0:
            self.player_two.captured += captured
        elif self.turn == self.player_one and captured > 0:
            self.player_one.captured += captured

        result = self.game.check_game_outcome_status()

        if result == 1:
            print(f"{self.player_one.name} wins!")
        elif result == 2:
            print(f"{self.player_two.name} wins!")
        elif result == 0:
            print("The game_play is a draw!")
        else:

            self.turn = self.game.state.get_player_turn()

            self.player_one_current_captured = self.player_one.captured
            self.player_two_current_captured = self.player_two.captured

            # Check for stalemate condition based on captures
            if (self.player_one_previous_captured == self.player_one_current_captured) and ( self.player_two_current_captured == self.player_two_previous_captured):
                self.players_captures_track_count += 1
            else:
                self.players_captures_track_count = 0
                self.player_one_previous_captured = self.player_one_current_captured
                self.player_two_previous_captured = self.player_two_current_captured

            # Check if stalemate count reached
            if self.players_captures_track_count >= self.stale_mate_count:
                self.stale_mate = True
            
            # Handle stalemate
            if self.stale_mate:
                print("Stalemate detected. Ending game_play.")
                result = self.game.state.set_winner()

            oppononent_seeds,player_seeds = self.game.player_seeds(self.turn,seeds)

            opponent_seeds_total = sum(oppononent_seeds)

            opponent_has_zero_seeds = opponent_seeds_total == 0

            if opponent_has_zero_seeds:

                seeds_distribution_possible = self.game.can_player_distribute_seeds_to_opponent(self.turn,seeds)

                if not seeds_distribution_possible:
                    print("Automatic capture. Ending game_play.")
                    
                    result = self.game.state.update_capture_and_win(self.turn,player_seeds) 

        challenge_winner, challenge_ended = self.check_winner(result) 

        #logger.info(f"Current turn {self.turn.get_player()}")
        self.game.state.change_turn(self.turn)
        self.turn = self.player_one if self.turn == self.player_two else self.player_two
        #logger.info(f"After turn {self.turn.get_player()}")

        player_turn = self.turn.get_player()

        if (
            self.in_progress
            and not self.game_ended
            and self.challenge_type == 2
            and player_turn['name'] in MODEL_ADDRESSES
        ):
            model = self.model_player_one if self.turn == self.player_one else self.model_player_two
            selected_house = self.select_house(model)
            result = self.agent_move(selected_house)
            if result:
                return result

        if (
            self.in_progress
            and not self.game_ended
            and self.challenge_type == 3
            and player_turn['name'] in MODEL_ADDRESSES
        ):
            model = self.model_player_one if self.turn == self.player_one else self.model_player_two
            selected_house = self.select_house(model)
            result = self.agent_move(selected_house)
            if result:
                return result
        
        return {
            "game_result": result,
            "challenge_ended": challenge_ended,
            "challenge_winner": challenge_winner,
            "current_round": self.current_round,
            "player_one_wins": self.player_one_wins,
            "player_two_wins": self.player_two_wins,
            "challenge_id": self.id
        }
    
    def load_model_tflite(self,name):
        model_path  = os.path.join(Path(__file__).parent, f'models-tflite/{name}.tflite')
        model = tflite.Interpreter(model_path=model_path)
        return model
    
    def update_round_winner(self, result):
        """Update the round winner based on the game result."""
        if result == 1:
            winner = self.player_one.get_player()
            self.player_one_wins += 1
            self.round_winners[self.current_round] = winner
            leader_board.add_or_update_player(self.player_one.name, self.player_one.address, score=100)
            return True
        elif result == 2:
            winner = self.player_two.get_player()
            self.player_two_wins += 1
            self.round_winners[self.current_round] = winner
            leader_board.add_or_update_player(self.player_two.name, self.player_two.address, score=20)
            return True
        else:
            if self.game.state.inprogress:
                return False
            else:
                return True

        
                
    def check_winner(self, result):
        is_winner = self.update_round_winner(result)
        
        if (self.current_round < self.rounds) and is_winner:
            self.current_round += 1
            self.spawn()  # Reset the game for the next round
            return None, False  # No overall winner yet, challenge not ended
        elif (self.current_round == self.rounds) and is_winner:
            challenge_winner = self.determine_challenge_winner()
            if challenge_winner is None:
                return self.tiebreaker()
            return challenge_winner, True  # Challenge ended
        else:
            return None, False

    def determine_challenge_winner(self):
        if self.player_one_wins > self.player_two_wins:
            self.winner =  self.player_one.get_player()
            self.in_progress = False
            self.game_ended = True
            return self.player_one
        elif self.player_two_wins > self.player_one_wins:
            self.winner = self.player_two.get_player()
            self.in_progress = False
            self.game_ended = True
            return self.player_two
        else:
            return None

    def tiebreaker(self):
        print("Tie detected. Starting tiebreaker round.")
        self.tiebreak_round = True
        self.current_round += 1
        self.spawn()  # Reset the game for the tiebreaker round
        return None, False  # No winner yet, challenge continues with tiebreaker 

    def select_house(self,model):

        if model:
            seeds = self.game.board.get_seeds()
            moves, moves_state = self.game.get_valid_moves(self.turn,seeds)
            move_selected = self.oware_moves.move_selector(moves,model)
            if len(move_selected) == 3:
                selected_move,new_board_state,score = move_selected

                selected_house = coordinates_houses_map.get(selected_move)
                
                return selected_house
            else:
                return None

    def run_ai_vs_ai_match(self):

        model_one = self.model_player_one
        model_two = self.model_player_two

        while not self.game_ended:

            model = model_one if self.player_one == self.turn else model_two

            house =  self.select_house(self,model)

            if house is None:

                return 

            result = self.move(self,house)

        return result
    
    






    def to_dict(self):
            return {
                "challenge_id": self.id,
                "creator": self.creator,
                "opponent": self.opponent,
                "in_progress": self.in_progress,
                "game_ended": self.game_ended,
                "winner": self.winner,
                "created_at": self.created_at,
                "challenge_type": self.challenge_type,
                "rounds": self.rounds,
                "round_winners": self.round_winners,
                "current_round": self.current_round,
                "player_turn":self.turn.get_player() if self.turn is not None else None,
                "player_one_captured":self.player_one.get_player() if self.player_one is not None else None,
                "player_two_captured":self.player_two.get_player() if self.player_two is not None else None,
                "state": self.game.board.get_seeds() if self.game is not None else None
            }