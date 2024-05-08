from board import Board
from state import State
from constants import NUMBER_OF_HOUSES


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


    def is_move_valid(self,selected_house,player):
        pass


    def is_selected_house_valid(self, selected_house):
        board = self.board.get_board()
        house = board[selected_house]

        if house.seeds_number == 0:
            return False

        else:
            return True
        

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
            element_increament_value = seeds[current_index]
            element_index = current_index
            value -= 1  # Decrement the original seeds picked
            current_index = (current_index + 1) % len(seeds)

        # Return the final state of the seeds
        return seeds,element_increament_value,element_index


    def make_move(self,selected_house):
        board = self.board.get_board()
        house = board[selected_house]
        seeds = self.board.get_seeds()
        house_index = house.house_number-1

        
        




    def get_board_display(self,player_turn):
        return self.board.get_board(),self.board.visual_board(player_turn)
    

    def get_selected_house(self,player_turn):

        selected_house = input('Enter Number of House: ')

        selected_house = f'House{selected_house}'

        if selected_house not in player_turn.houses:

            print("Select house in your houses... ")

            self.get_selected_house(player_turn)


        return selected_house


    
