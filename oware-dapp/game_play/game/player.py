class Player:

    def __init__(self, name, houses, captured,address,model_name) -> None:
        self.name  = name
        self.houses =  houses
        self.captured = captured
        self.address = address
        self.model_name = model_name

    def get_player(self):
        player = {
            "name":self.name,
            "houses":self.houses,
            "captured":self.captured,
            "address":self.address,
            "model_name":self.model_name
        }

        return player
    
    def get_captured(self):
        return self.captured
    
    def get_player_houses(self):
        return self.houses

    
    
    