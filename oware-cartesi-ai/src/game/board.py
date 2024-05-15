from house import House
from constants import NUMBER_OF_HOUSES

class Board:
    
    def __init__(self) -> None:
        self.board = {}

    def create_board(self):
        for i in range(1, NUMBER_OF_HOUSES + 1):
            name = f"House{str(i)}"
            seeds_number = 4
            house = House(i, seeds_number)
            self.board[name] = house


    def get_board(self):
        return self.board
    

    def get_seeds(self):
        return [house.seeds_number for house in self.board.values()]

    def visual_board(self, player):
        board = [f"House{house.house_number} > {house.seeds_number}|  " for house in self.board.values()]

        if 'House1' in player.houses:
            row_one = f'Opponent Houses: {"".join(board[6:][::-1])}'
            row_two = f'Your Houses:     {"".join(board[:6])}'
        else:
            row_one = f'Your Houses:     {"".join(board[6:][::-1])}'
            row_two = f'Opponent Houses: {"".join(board[:6])}'

        return row_one, row_two

    def update_board(self,board):
        self.board = board




    