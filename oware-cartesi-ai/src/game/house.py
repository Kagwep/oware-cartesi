class House:

    def __init__(self,name,seeds,seeds_number) -> None:
        self.name =  name
        self.seeds = seeds
        self.seeds_number = seeds_number



    def get_house(self):
        return {
            'name': self.name,
            'seeds':self.seeds,
            'seeds_number':self.seeds_number
        }