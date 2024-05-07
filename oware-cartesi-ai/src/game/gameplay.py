from board import Board
from state import State


class GamePlay():

    def __init__(self) -> None:
        self.state = None
        self.board = None
    
    def game_init(self,player_one,player_two,player_turn):
        board = Board()
        board.create_board()
        state = State(board,player_turn,player_one,player_two)
        state.update_progress()

        self.board = board
        self.state = state

        return state.get_board_state()


    def is_move_valid(self,selected_house,player):
        
        if selected_house in player:
            pass

        else:
            return False


    def is_selected_house_valid(self, selected_house):
        pass

    def make_move(self,selected_house):
        pass

    def get_board_display(self,player_turn):
        return self.board.get_board(),self.board.visual_board(player_turn)


    
