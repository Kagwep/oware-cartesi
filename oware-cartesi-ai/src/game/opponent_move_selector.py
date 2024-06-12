from coordinate_house_map import coordinates_houses_map
import numpy as np
import random
from constants import NUMBER_OF_HOUSES, PLAYER_ONE_HOUSES , PLAYER_TWO_HOUSES,HOUSES
from oware_moves import OwareMoves

class OpponentMovesSelector:

    def __init__(self) -> None:
        self.temp_board = None
        self.temp_player = None
        self.oware_moves = OwareMoves()
        self.temp_opponent = None

        

    def get_state_for_move(self,move, legal_moves_dict):
        # Retrieve the resulting seed state for the specified move from the legal moves dictionary
        resulting_seeds_state = legal_moves_dict.get(move)
        
        # Convert the result to a NumPy array if it's not already one
        if not isinstance(resulting_seeds_state, np.ndarray):
            resulting_seeds_state = np.array(resulting_seeds_state)
        
        return resulting_seeds_state

    def evaluate_board_seeds(self,seeds_state):
        """Calculate the total number of seeds on the board from the given state."""
        return np.sum(seeds_state)

    def find_best_move(self,legal_moves_dict):
        best_moves = []
        min_seeds_on_board = float('inf')  # Start with a very high number.

        for move, resulting_seeds_state in legal_moves_dict.items():
            total_seeds = self.evaluate_board_seeds(resulting_seeds_state)
            if total_seeds < min_seeds_on_board:
                min_seeds_on_board = total_seeds
                best_moves = [move]  # Reset the list with the new best move
            elif total_seeds == min_seeds_on_board:
                best_moves.append(move)  # Add this move to the list of best moves

        # If there's more than one best move, apply a secondary criterion
        if len(best_moves) > 1:
            return self.apply_secondary_criteria(best_moves, legal_moves_dict)
        return best_moves[0]
            
    def apply_secondary_criteria(self,best_moves, legal_moves_dict):

        self.temp_player, self.temp_opponent = self.temp_opponent, self.temp_player

        for best_move in best_moves:

            seeds = self.get_state_for_move(best_move, legal_moves_dict)
            opponent_houses = PLAYER_ONE_HOUSES if self.temp_player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

            if 'House1' in opponent_houses:
                opponent_seeds = seeds[:6]
                player_seeds = seeds[6:]
            else:
                opponent_seeds = seeds[6:]
                player_seeds = seeds[:6]

            moves = self.oware_moves.possible_moves(seeds,opponent_seeds, player_seeds,self.temp_player,self.temp_board)




    def capture_move_check(self,game,legal_moves_dict,player_turn):

        self.temp_board = game.state.get_board()

        self.temp_player = player_turn

        seeds = game.board.get_seeds()

        opponent_houses = PLAYER_ONE_HOUSES if player_turn.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:
            opponent_seeds = seeds[:6]
            player_seeds = seeds[6:]
        else:
            opponent_seeds = seeds[6:]
            player_seeds = seeds[:6]
    











