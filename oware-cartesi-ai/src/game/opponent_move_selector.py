from .coordinate_house_map import coordinates_houses_map
import numpy as np
import random
from .constants import NUMBER_OF_HOUSES, PLAYER_ONE_HOUSES , PLAYER_TWO_HOUSES,HOUSES
from .oware_moves import OwareMoves

class OpponentMovesSelector:

    def __init__(self) -> None:
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
            
    def apply_secondary_criteria(self, best_moves, legal_moves_dict):
        self.temp_player, self.temp_opponent = self.temp_opponent, self.temp_player
        move_less = best_moves[0]  # Initialize with the first best move
        current_max = float('-inf')  # Start with negative infinity
        for best_move in best_moves:
            seeds = self.get_state_for_move(best_move, legal_moves_dict)
            opponent_houses = PLAYER_ONE_HOUSES if self.temp_player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES
            if 'House1' in opponent_houses:
                opponent_seeds = seeds[:6]
                player_seeds = seeds[6:]
            else:
                opponent_seeds = seeds[6:]
                player_seeds = seeds[:6]
            moves, moves_state = self.oware_moves.possible_moves(seeds, opponent_seeds, player_seeds, self.temp_player)
            if not moves:  # If no moves are possible, skip this iteration
                continue
            max_seeds_on_board = max(self.evaluate_board_seeds(resulting_seeds_state) for resulting_seeds_state in moves.values())
            if max_seeds_on_board > current_max:
                current_max = max_seeds_on_board
                move_less = best_move
        return move_less


    def capture_move_check(self,legal_moves_dict,player_turn,player_opponent):
        


        # Check if the dictionary has exactly one item
        if len(legal_moves_dict) == 1:
            # Retrieve the single key from the dictionary
            return next(iter(legal_moves_dict))

        

        self.temp_player = player_turn

        self.temp_opponent = player_opponent

        move = self.find_best_move(legal_moves_dict)

        return move
    











