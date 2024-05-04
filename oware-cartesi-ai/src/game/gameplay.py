from .board import Board
from .state import State


class GamePlay:
    
    def game_init(self,player_one,player_two,player_turn):
        board = Board()
        state = State(board,player_turn,player_one,player_two)
        state.update_progress()

    def is_move_valid(self,selected_house):
        pass

    def is_selected_house_valid(self, selected_house):
        pass

    def make_move(self,selected_house):
        pass



    
