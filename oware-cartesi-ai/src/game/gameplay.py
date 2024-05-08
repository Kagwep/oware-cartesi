from board import Board
from state import State


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
        


    def make_move(self,selected_house):
        pass

    def get_board_display(self,player_turn):
        return self.board.get_board(),self.board.visual_board(player_turn)
    

    def get_selected_house(self,player_turn):

        selected_house = input('Enter Number of House: ')

        selected_house = f'House{selected_house}'

        if selected_house not in player_turn.houses:

            print("Select house in your houses... ")

            self.get_selected_house(player_turn)


        return selected_house


    
