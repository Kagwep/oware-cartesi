import numpy as np
import copy
from game.constants import NUMBER_OF_HOUSES, PLAYER_ONE_HOUSES , PLAYER_TWO_HOUSES,HOUSES
from game.move_simulator import MoveSimulator


class GameplayEvaluationMoves(object):

    def __init__(self):
        self.board_numpy_status = []
        self.player_turn = ''
        self.legal_moves_dict = {}
        self.move_simulator = MoveSimulator()

    def check_for_capture(self, seeds, in_player_houses):
        return (seeds == 3 or seeds == 2) and not in_player_houses

    def check_previous(self, original_path, next_house_to_sow):
        next_house_to_sow = next_house_to_sow - 1
        previous_house_seeds = original_path[next_house_to_sow]
        in_player_houses = next_house_to_sow > 5

        if self.check_for_capture(previous_house_seeds, in_player_houses):
            original_path[next_house_to_sow] = 0
            original_path = self.check_previous(original_path, next_house_to_sow)

        return original_path

    def is_there_a_capture(self, original_path, next_house_to_sow):
        seeds = original_path[next_house_to_sow]
        in_player_houses = next_house_to_sow > 5

        if self.check_for_capture(seeds, in_player_houses):
            original_path[next_house_to_sow] = 0
            original_path = self.check_previous(original_path, next_house_to_sow)
        else:
            original_path[next_house_to_sow] += 1 

        return original_path



    def possible_moves(self,seeds,opponent_seeds, player_seeds,player,board):

        seeds_state = copy.deepcopy(seeds)
        # Check the condition to determine which row to select from the result_array

        player_row = 1 if 'House1' in player.houses else 0
 
        # Extract the selected row from the board_state

        selected_board_row = player_seeds 

        # Initialize moves dictionary to store coordinates and updated board states
        moves = {}

        for col in range(len(selected_board_row)):
            selected_house = f'House{col+1}' if player_row == 1 else f'House{col+7}'

            is_house_valid = self.move_simulator.is_selected_house_valid(selected_house, player,board,seeds_state)

            seeds_state = copy.deepcopy(seeds)
            if (selected_house in player.houses) and is_house_valid:
                result_seeds_state = self.move_simulator.make_move(selected_house,board,seeds_state,player)
                moves[(player_row, col)] = np.array(result_seeds_state)
                seeds_state = copy.deepcopy(seeds)
            else:
                seeds_state = copy.deepcopy(seeds)


    
        return moves

    def legal_moves_generator(self,game,player):
        board = game.board.get_board()
        current_board_state,player_turn = game.state.board_state, game.state.player_turn
        self.player_turn = player_turn
        seeds = game.board.get_seeds()
        player = game.state.get_player_turn()
        opponent_houses = PLAYER_ONE_HOUSES if player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:
            opponent_seeds = seeds[:6]
            player_seeds = seeds[6:]
        else:
            opponent_seeds = seeds[6:]
            player_seeds = seeds[:6]
            

        moves = self.possible_moves(seeds,opponent_seeds, player_seeds,player,board)

        self.legal_moves_dict = moves


    def move_selector(self, model):
        if self.legal_moves_dict:
            tracker = {}
            for legal_move_coord in self.legal_moves_dict:
                # Ensure prediction is reshaped and extract scalar value
                prediction = model.predict(self.legal_moves_dict[legal_move_coord].reshape(1, -1))
                # Extract scalar value from prediction
                score = prediction[0][0] if isinstance(prediction, np.ndarray) else prediction.items()
                tracker[legal_move_coord] = score
            
            # Find the move with the maximum score
            selected_move = max(tracker, key=tracker.get)
            new_board_state = self.legal_moves_dict[selected_move]
            score = tracker[selected_move]

            return selected_move, new_board_state, score
        else:
            return (np.sum(self.board_numpy_status),)

    
    


