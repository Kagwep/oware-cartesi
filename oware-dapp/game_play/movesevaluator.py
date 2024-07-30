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



    def possible_moves(self,seeds,opponent_seeds, player_seeds,player):

        seeds_state = copy.deepcopy(seeds)
        # Check the condition to determine which row to select from the result_array

        player_row = 1 if 'House1' in player.houses else 0
 
        # Extract the selected row from the board_state

        selected_board_row = player_seeds 

        # Initialize moves dictionary to store coordinates and updated board states
        moves = {}

        player_moves_state = np.zeros(len(player_seeds), dtype=np.uint8)
        opponent_moves_state = np.zeros(len(player_seeds), dtype=np.uint8)

        for col in range(len(selected_board_row)):
            selected_house = f'House{col+1}' if player_row == 1 else f'House{col+7}'

            is_house_valid = self.move_simulator.is_selected_house_valid(selected_house, player,seeds_state)

            seeds_state = copy.deepcopy(seeds)
            if is_house_valid:
                result_seeds_state = self.move_simulator.make_move(selected_house,seeds_state,player)
                moves[(player_row, col)] = np.array(result_seeds_state)
                player_moves_state[col] = 1  # Mark this move as valid
                seeds_state = copy.deepcopy(seeds)
            else:
                seeds_state = copy.deepcopy(seeds)

        # Combine player and opponent moves states based on player_row
        if player_row == 0:
            moves_state = np.concatenate((opponent_moves_state, player_moves_state))
        else:
            moves_state = np.concatenate((player_moves_state, opponent_moves_state))
    
        return moves, moves_state

    def legal_moves_generator(self,seeds,player):


        opponent_houses = PLAYER_ONE_HOUSES if player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:
            opponent_seeds = seeds[:6]
            player_seeds = seeds[6:]
        else:
            opponent_seeds = seeds[6:]
            player_seeds = seeds[:6]
            

        moves, moves_state = self.possible_moves(seeds,opponent_seeds, player_seeds,player)

        self.legal_moves_dict = moves

        return moves, moves_state


    def move_selector(self, moves, interpreter):
        if moves:
            tracker = {}

            # Allocate tensors
            interpreter.allocate_tensors()

            # Get input and output details
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()

            for legal_move_coord in moves:
                # Prepare the input data
                input_data = moves[legal_move_coord].reshape(1, 12).astype(np.float32)

                # Set the input tensor
                interpreter.set_tensor(input_details[0]['index'], input_data)

                # Run inference
                interpreter.invoke()

                # Get the output tensor
                output_data = interpreter.get_tensor(output_details[0]['index'])

                tracker[legal_move_coord] = output_data

            print(tracker)
            selected_move = max(tracker, key=lambda k: tracker[k][0][0])
            new_board_state = moves[selected_move]
            score = tracker[selected_move]

            return selected_move, new_board_state, score
        else:
            return (np.sum(self.board_numpy_status),)

