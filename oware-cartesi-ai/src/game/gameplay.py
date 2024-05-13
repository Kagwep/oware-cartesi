from board import Board
from state import State
from constants import NUMBER_OF_HOUSES, PLAYER_ONE_HOUSES , PLAYER_TWO_HOUSES


class GamePlay():

    def __init__(self) -> None:
        self.state = None
        self.board = None
        self.skip_house = ''
       
        
    
    def game_init(self,player_one,player_two,player_turn):
        board = Board()
        board.create_board()
        state = State(board,player_turn,player_one,player_two)
        state.update_progress()

        self.board = board
        self.state = state

        return state.get_board_state()


    def is_move_valid(self,seeds,seeds_index):

        player = self.state.get_player_turn()
        
        opponent_houses = PLAYER_ONE_HOUSES if player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:

            pass 

        # TODO the aim is to get the remaining 


        


    def is_selected_house_valid(self, selected_house):
        board = self.board.get_board()
        house = board[selected_house]

        if house.seeds_number == 0:
            return False

        else:
            return True
        
    def capture_seeds(self,seeds,seeds_increamented_to_count,seeds_index,captured,):

        captured += seeds_increamented_to_count
        
        previous_house_index = (seeds_index -1) % NUMBER_OF_HOUSES

        
        
        
    def check_capture(self,last_seed_count,house,seeds,seeds_index):

        player = self.state.get_player_turn

        player_house = True if f'House{house.house_number}' in player.houses else False

        if last_seed_count == 2 or last_seed_count == 3 and not player_house:

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

        capture_made = self.check_capture(seeds_increamented_to_count,house)

        captured = 0 

        if capture_made:
            seeds,captured = self.capture(seeds,seeds_increamented_to_count,seeds_index,captured)
        else:
            seeds = seeds
            captured = captured


        
    def get_board_display(self,player_turn):
        return self.board.get_board(),self.board.visual_board(player_turn)
    

    def get_selected_house(self,player_turn):

        selected_house = input('Enter Number of House: ')

        selected_house = f'House{selected_house}'

        house_selected_has_seeds = self.is_selected_house_valid(selected_house)
        

        if selected_house not in player_turn.houses :

            print("Select house in your houses... ")

            self.get_selected_house(player_turn)


        if not house_selected_has_seeds:

            print("House selected has no seeds")

            self.get_selected_house(player_turn)

        return selected_house


    
