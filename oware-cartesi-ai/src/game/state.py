from constants import NUMBER_OF_HOUSES

class State:

    def __init__(self,board,turn,player_one,player_two) -> None:
        self.board_state = board
        self.player_turn = turn
        self.inprogress = False
        self.player_one = player_one
        self.player_two = player_two
        self.result = None
        self.seeds_needed_to_win = 24


    def get_board_state(self):
        return self.board_state


    def get_player_turn(self):
        return self.player_turn
    

    def change_turn(self,player):
        self.player_turn =  self.player_one if player == self.player_two else self.player_two
        return player
    

    def is_in_progress(self):
        return self.inprogress
    
    def update_progress(self):
        self.inprogress = False if self.inprogress else True

    def get_result(self):
        return self.result
    

    def update_board_state(self, seed_numbers):
        if len(seed_numbers) != NUMBER_OF_HOUSES:
            raise ValueError("The number of seed numbers must match the number of houses.")
        
        board = self.board_state.get_board()
        
        for i, seeds in enumerate(seed_numbers, start=1):
            house_name = f"House{str(i)}"
            
            if house_name in board:
                board[house_name].seeds_number = seeds
            else:
                raise KeyError(f"{house_name} does not exist on the board.")
            
        self.board_state.update_board(board)


    def check_win(self):
        if self.player_one.captured > self.seeds_needed_to_win:
            self.result = 1  # Player one wins
            self.inprogress = False
        elif self.player_two.captured > self.seeds_needed_to_win:
            self.result = 2  # Player two wins
            self.inprogress = False
        elif self.player_one.captured == self.seeds_needed_to_win and self.player_two.captured == self.seeds_needed_to_win:
            self.result = 0  # Draw
            self.inprogress = False
        else:
            self.result = None  # Game still in progress
            self.inprogress = True

        return self.result
    
    def set_winner(self):
        if self.player_one.captured > self.player_two.captured:
            self.result = 1  # Player one wins
            self.inprogress = False
        elif self.player_two.captured > self.player_one.captured:
            self.result = 2  # Player two wins
            self.inprogress = False
        elif self.player_one.captured ==  self.player_two.captured:
            self.result = 0  # Draw
            self.inprogress = False

