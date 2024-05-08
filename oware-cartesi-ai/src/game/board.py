from house import House
from constants import NUMBER_OF_HOUSES

class Board:
    
    def __init__(self) -> None:
        self.board = {}

    def create_board(self):
        for i in range(1, NUMBER_OF_HOUSES + 1):
            name = f"House{str(i)}"
            seeds = list(f"seed{str((i*4)+j)}" for j in range(1, 5))
            seeds_number = len(seeds)
            house = House(name, seeds, seeds_number)
            self.board[name] = house


    def get_board(self):
        return self.board
    

    def get_seeds(self):
        return [house.seeds_number for house in self.board.values()]

    def visual_board(self, player):
        board = [f"{house.name} > {house.seeds_number}|  " for house in self.board.values()]

        if 'House1' in player.houses:
            row_one = f'Opponent Houses: {"".join(board[6:])}'
            row_two = f'Your Houses:     {"".join(board[:6])}'
        else:
            row_one = f'Your Houses:     {"".join(board[6:])}'
            row_two = f'Opponent Houses: {"".join(board[:6])}'

        return row_one, row_two





    