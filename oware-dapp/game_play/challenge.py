import time 
import random
from collections import namedtuple
from game.player import Player
from game.gameplay import GamePlay
from game.constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES
import os
import sys
import time
import tflite_runtime.interpreter as tflite
from .movesevaluator import GameplayEvaluationMoves

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

OPlayer = namedtuple('Player', ['name', 'address', 'model_name'])

class Challenge:

    def __init__(self,creator_name, creator_address,rounds, _id ,creator_model_name = None ) -> None:
        self.creator = OPlayer(creator_name, creator_address, creator_model_name)
        self.opponent = None
        self.player_one = None
        self.player_two = None
        self.game = None
        self.id = _id
        self.winner = None
        self.created_at = time.time
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
        
        
    def add_opponent(self,name,address,model_name= None):
        self.opponent = OPlayer(name, address, model_name)

    def spawn(self):

        random_number = random.randint(1, 6)

        if random_number > 3:
            self.player_one = Player(self.creator.name,PLAYER_ONE_HOUSES,0)
            self.player_two = Player(self.opponent.name,PLAYER_TWO_HOUSES,0)
            self.model_player_one = self.load_model_tflite(self.creator.model_name) if self.creator.model_name  else None
            self.model_player_two = self.load_model_tflite(self.opponent.model_name) if self.creator.model_name  else None
        else:
            self.player_one = Player(self.opponent.name,PLAYER_TWO_HOUSES,0)
            self.player_two =  Player(self.creator.name,PLAYER_ONE_HOUSES,0)
            self.model_player_two = self.load_model_tflite(self.creator.model_name) if self.creator.model_name  else None
            self.model_player_one = self.load_model_tflite(self.opponent.model_name) if self.creator.model_name  else None

        self.turn = self.player_one 

        game_play = GamePlay()
        game_play.game_init(self.player_one,self.player_two,self.turn)
        self.game = game_play
        self.oware_moves = GameplayEvaluationMoves()

    def move(self,selected_house):

        seeds,captured = self.game.make_move(selected_house)
        self.game.state.update_board_state(seeds)
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
                stale_mate = True
            
            # Handle stalemate
            if stale_mate:
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
        
        return {
            "game_result": result,
            "challenge_ended": challenge_ended,
            "challenge_winner": challenge_winner,
            "current_round": self.current_round,
            "player_one_wins": self.player_one_wins,
            "player_two_wins": self.player_two_wins,
        }
    
    def load_model_tflite(self,name):
        model = tflite.Interpreter(model_path=f"./models-tflite/agent-model-new-{name}.tflite")
        return model

    def update_round_winner(self, result):
        """Update the round winner based on the game result."""
        if result == 1:
            winner = self.player_one
            self.player_one_wins += 1
        elif result == 2:
            winner = self.player_two
            self.player_two_wins += 1
        else:
            winner = None  # Draw

        self.round_winners[self.current_round] = winner
                    
    
    def check_winner(self, result):
        self.update_round_winner(result)
        
        if self.current_round < self.rounds:
            self.current_round += 1
            self.spawn()  # Reset the game for the next round
            return None, False  # No overall winner yet, challenge not ended
        else:
            challenge_winner = self.determine_challenge_winner()
            if challenge_winner is None:
                return self.tiebreaker()
            return challenge_winner, True  # Challenge ended

    def determine_challenge_winner(self):
        if self.player_one_wins > self.player_two_wins:
            self.winner =  self.player_one
            return self.player_one, True
        elif self.player_two_wins > self.player_one_wins:
            self.winner = self.player_two
            return self.player_two, True
        else:
            return None, False  # Tie, need tiebreaker

    def tiebreaker(self):
        print("Tie detected. Starting tiebreaker round.")
        self.tiebreak_round = True
        self.current_round += 1
        self.spawn()  # Reset the game for the tiebreaker round
        return None, False  # No winner yet, challenge continues with tiebreaker        




