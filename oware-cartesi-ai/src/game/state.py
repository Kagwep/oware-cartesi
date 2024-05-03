class State:

    def __init__(self,board,turn,player_one,player_two) -> None:
        self.board_state = board
        self.player_turn = turn
        self.inprogress = False
        self.player_one = player_one
        self.player_two = player_two
        self.result = 3


    def get_board_state(self):
        return self.board_state


    def get_player_turn(self):
        return self.player_turn
    

    def change_turn(self,player):
        self.turn =  self.player_one if self.player_turn == self.player_two else self.player_two
    

    def is_in_progress(self):
        return self.inprogress
    
    def update_progress(self):
        self.inprogress = False if self.inprogress else True

    def get_result(self):
        return self.result



    
    

