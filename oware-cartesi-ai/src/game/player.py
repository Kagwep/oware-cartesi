class Player:

    def __init__(self, name, houses, captured) -> None:
        self.name  = name
        self.houses =  houses
        self.captured = captured

    def get_player(self):
        player = {
            "name":self.name,
            "houses":self.houses,
            "captured":self.captured
        }

        return player
    
    def get_captured(self):
        return self.captured