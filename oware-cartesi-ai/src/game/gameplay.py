
from .board import Board
from .state import State
from .constants import NUMBER_OF_HOUSES, PLAYER_ONE_HOUSES , PLAYER_TWO_HOUSES,HOUSES,NUMBER_OF_HOUSES
from .oware_moves import OwareMoves
from .move_simulator import MoveSimulator
import numpy as np


class GamePlay():

    def __init__(self) -> None:
        self.state = None
        self.board = None
        self.skip_house = ''
        self.oware_moves = OwareMoves()
        self.move_simulator = MoveSimulator()
        self.action_size = NUMBER_OF_HOUSES

    def game_init(self,player_one,player_two,player_turn):
        board = Board()
        board.create_board()
        state = State(board,player_turn,player_one,player_two)
        state.update_progress()

        self.board = board
        self.state = state

        return state.get_board_state()
    
    def player_seeds(self,player,seeds):

        opponent_houses = PLAYER_ONE_HOUSES if player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:
            opponent_seeds = seeds[:6]
            player_seeds = seeds[6:]
        else:
            opponent_seeds = seeds[6:]
            player_seeds = seeds[:6]

        return opponent_seeds,player_seeds
    
    def check_seeds_in_scope_capture(self, seeds_in_scope, remainder_houses):

            scope_has_no_seeds = len(seeds_in_scope) == 0

            # Check if all seeds are less than or equal to 3
            all_three_or_less = all(seed_number <= 3 for seed_number in seeds_in_scope)
            
            # Check if all seeds in remainder_houses are zero
            all_zeros = all(house == 0 for house in remainder_houses)

            if scope_has_no_seeds and all_zeros:
                return False

            if all_three_or_less and all_zeros:
                return False
            
            any_remainder = any(house > 0 for house in remainder_houses)

            if all_three_or_less and any_remainder:
                return True
            
            maximum_seed_count = max(seeds_in_scope) 
            minimum_seed_count = min(seeds_in_scope)
            max_in_remainders = max(remainder_houses) if len(remainder_houses) > 0 else 0

            seed_count = sum(1 for seed_number in seeds_in_scope if seed_number > 0)
            if seed_count == 1:
                return True

            can_capture_all = 1 < maximum_seed_count <= 3 and 1 < minimum_seed_count <= 3

            if max_in_remainders == 0 and can_capture_all:
                return False
            else:
                return True

    def is_move_valid(self, seeds, seeds_index):

        player = self.state.get_player_turn()
        
        opponent_houses = PLAYER_ONE_HOUSES if player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:
            opponent_seeds = seeds[:6]
            # Check if seeds_index is at the last position
            if seeds_index == 5:
                remainder_houses = []  # Set remainder_houses to empty if it's the last index
            else:
                remainder_houses = opponent_seeds[seeds_index + 1:]  # Start from the next index to exclude the seed at seeds_index

            seeds_in_scope = opponent_seeds[:seeds_index + 1]  # Include the last item
            opponent_first_index = 0
            opponent_last_index = 5 
        else:
            opponent_seeds = seeds[6:]
            # Check if seeds_index is at the last position
            if seeds_index == 11:
                remainder_houses = []  # Set remainder_houses to empty if it's the last index
            else:
                remainder_houses = opponent_seeds[(seeds_index - 6) + 1:]  # Start from the next index to exclude the seed at seeds_index

            seeds_in_scope = opponent_seeds[:seeds_index - 5]  # Include the last item, adjust to correct index calculation
            opponent_first_index = 6
            opponent_last_index = 11


        # Special handling for the first house
        if seeds_index == opponent_first_index:
            # Check if the first house has 3 or fewer seeds and all other houses are 0
            if opponent_seeds[0] <= 3 and all(seed == 0 for seed in opponent_seeds[1:]):
                return False
                

        # Check if the last seed lands in the last opponent house
        if seeds_index == opponent_last_index:
            # Check for validity based on opponent's seed condition
            if all(seed > 0 for seed in opponent_seeds) and max(opponent_seeds) <= 3:
                return False
       
        move_validity = self.check_seeds_in_scope_capture(seeds_in_scope, remainder_houses)
        return move_validity


    

    def opponent_has_seeds_after_move(self, selected_house_name, house, player_turn, board):
        # Retrieve current seeds distribution on the board
        seeds = self.board.get_seeds()

        # Convert selected house name to its corresponding index
        house_index = HOUSES.index(selected_house_name)

        # Get initial distribution of seeds for opponent and player based on the current turn
        opponent_seeds, player_seeds = self.player_seeds(player_turn, seeds)

        # Calculate total seeds currently with the opponent
        total_opponent_seeds = sum(opponent_seeds)

        # Check if opponent already has seeds
        if total_opponent_seeds > 0:
            return True
        
        else:
            # Simulate the move and get new seeds distribution
            after_move_seeds_state, after_move_seeds_incremented_to_count, seeds_index = self.move(seeds, house_index)

            # Re-calculate the seeds distribution after the move
            opponent_seeds, player_seeds = self.player_seeds(player_turn, after_move_seeds_state)

            # Check again for seeds with the opponent after the move
            total_opponent_seeds = sum(opponent_seeds)
            if total_opponent_seeds > 0:
                return True
            else:
                print("Invalid move: Please select a house that will give the opponent at least one seed.")
                return False




    def is_selected_house_valid(self, selected_house, player_turn):

        board = self.board.get_board()
        
        house = board[selected_house]

        if house.seeds_number == 0:
            print("House selected has no seeds please choose another house ...")
            return False

        else:
            opponent_seeds_check =  self.opponent_has_seeds_after_move(selected_house,house,player_turn,board)
            return opponent_seeds_check
        
    def capture_seeds(self,seeds,seeds_increamented_to_count,seeds_index,captured):

        captured += seeds_increamented_to_count
        seeds[seeds_index] = 0
        
        previous_house_index = (seeds_index -1) % NUMBER_OF_HOUSES

        player = self.state.get_player_turn()

        opponent_houses = PLAYER_ONE_HOUSES if player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        previous_house_number = previous_house_index + 1

        house_to_check = f'House{previous_house_number}'

        if house_to_check not in opponent_houses:
            return seeds,captured
        
        seeds_increamented_to_count = seeds[previous_house_index]
        
        if seeds_increamented_to_count == 2 or seeds_increamented_to_count == 3:
             return self.capture_seeds(seeds,seeds_increamented_to_count,previous_house_index,captured)
        else:
            return seeds,captured
            
    def can_player_distribute_seeds_to_opponent(self,player,seeds):

        #seeds = self.board.get_seeds()
        
        oppononent_seeds,player_seeds = self.player_seeds(player,seeds)

        if sum(oppononent_seeds) > 0:
            return True

        is_closest_row = 'House1' in player.houses

        # print(player_seeds)
        # print(player.houses)
        # print(player.name)

        if is_closest_row:
            house_count = 1

            for seed in player_seeds:
                if seed + house_count >= 7:
                    return True
                else:
                    house_count += 1
        
        else:
            house_count = 7

            for seed in player_seeds:
                if seed + house_count >= 13:
                    return True
                else:
                    house_count += 1
        return False

        
    def check_capture(self,last_seed_count,seeds,seeds_index):

        player = self.state.get_player_turn()

        player_house = True if f'House{seeds_index + 1}' in player.houses else False

        # print(last_seed_count)
        # print(player_house)

        if (last_seed_count == 2 or last_seed_count == 3) and not player_house:

            capture_move_valid = self.is_move_valid(seeds,seeds_index)

            if capture_move_valid:
                return True
            else:
                print(" This Move Captures all the opponent seeds")
                return False
        else:
            return False
        

    def move(self,seeds,house_index):
        # Get the seed count at the house_index and set that count to zero

        value = seeds[house_index]
        seeds[house_index] = 0
        
        # Determine if we need to skip the original house during the planting
        skip_original_index = value >= 12
        
        # Start from the next house counter clockwise
        current_index = (house_index + 1) % len(seeds)

        while value > 0:
            # If we need to skip the original house and we're back at it, move to the next
            if skip_original_index and current_index == house_index:
                current_index = (current_index + 1) % len(seeds)
                continue
            
            # Increment the current house and move to the next
            seeds[current_index] += 1
            seeds_increamented_to_count = seeds[current_index]
            seeds_index = current_index
            value -= 1  # Decrement the original seeds picked
            current_index = (current_index + 1) % len(seeds)

        # Return the final state of the seeds
        return seeds,seeds_increamented_to_count,seeds_index


    def make_move(self,selected_house):

        board = self.board.get_board()
        house = board[selected_house]
        seeds = self.board.get_seeds()
        house_index = house.house_number - 1

        seeds,seeds_increamented_to_count,seeds_index = self.move(seeds,house_index)

        capture_made_check = self.check_capture(seeds_increamented_to_count,seeds,seeds_index)

        captured = 0
      

        if capture_made_check:
            seeds,captured = self.capture_seeds(seeds,seeds_increamented_to_count,seeds_index,captured)
        else:
            seeds = seeds
            captured = captured

        
        return seeds,captured
    
    


        
    def get_board_display(self,player_turn):
        return self.board.get_board(),self.board.visual_board(player_turn)
    

    def get_selected_house(self,player_turn):

        selected_house = input('Enter Number of House: ')


        selected_house = f'House{selected_house}'

        if selected_house not in HOUSES:
            
            print("Please select a valid house ... ")

            selected_house = self.get_selected_house(player_turn)

        house_valid = self.is_selected_house_valid(selected_house, player_turn)
        
        if not house_valid:

            selected_house = self.get_selected_house(player_turn)


        if selected_house not in player_turn.houses :

            print("Please select house in your houses... ")

            selected_house = self.get_selected_house(player_turn)


        return selected_house


    
    def check_game_outcome_status(self):
        result = self.state.check_win()
        return result
    

    def get_valid_moves(self,player_turn,seeds):
         print(seeds)
         print(player_turn.name)
         moves, moves_state = self.oware_moves.legal_moves_generator(seeds,player_turn)
         print(moves,moves_state)
         return moves, moves_state
    

    def get_next_state(self,seeds,action,player):
        seeds,captured = self.move_simulator.get_next_state(seeds,action,player)
        return seeds,captured
    

    def change_perspective(self,board_state,player):

        if 'House1' in player.houses:
            return board_state
        else:
            return  np.concatenate((board_state[-6:], board_state[6:-6], board_state[:6]))
      
    
    def get_value_and_terminated(self,rollout_opponent, rollout_player, count=0):


        if self.check_win(rollout_opponent, rollout_player):
            return 1, True  # Player wins
        
        if self.check_draw(rollout_opponent, rollout_player):
            return 0.5, True  # Draw
        
        if self.in_stale_mate(count):
            return 0.5, True

        return 0, False  # Game continues

    def check_win(self,  rollout_opponent, rollout_player):
        return rollout_opponent.captured > 24 or rollout_player.captured > 24

    def check_draw(self, rollout_opponent, rollout_player):
        return rollout_opponent.captured and rollout_player.captured == 24
    

    def get_opponent_value(self,value):
        return -value
    
    def in_stale_mate(self,count):
        return True if count > 100 else False

    def handle_cannot_distribute(self,rollout_player,rollout_opponent,rollout_state):

        remainder_seeds = sum(rollout_state)

        rollout_player.captured += remainder_seeds

        if self.check_win(rollout_opponent, rollout_player):
            return 1
        
        if self.check_draw(rollout_opponent, rollout_player):
            return 0.5


