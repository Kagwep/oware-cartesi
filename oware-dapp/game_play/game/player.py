class Player:

    def __init__(self, name, houses, captured,address) -> None:
        self.name  = name
        self.houses =  houses
        self.captured = captured
        self.player_address = address

    def get_player(self):
        player = {
            "name":self.name,
            "houses":self.houses,
            "captured":self.captured,
            "address":self.player_address
        }

        return player
    
    def get_captured(self):
        return self.captured
    
    def get_player_houses(self):
        return self.houses

    
    
    