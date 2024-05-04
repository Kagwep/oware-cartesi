from .houses import House
from .constants import NUMBER_OF_HOUSES

class Board:
    
    def __init__(self) -> None:
        self.board = []        

    def create_board(self):

        for i in range(0,NUMBER_OF_HOUSES):
            name = f"House{str(i)}"
            seeds = (f"seed{str((i*4)+j)}" for j in range(1,5))
            seeds_number = len(seeds)
            house = House(name,seeds,seeds_number)
            self.board.append(house)


    def get_board(self):
        return self.board


    



    