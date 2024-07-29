import time 
import random
import copy

class Challenge:

    def __init__(self,creator,_id) -> None:
        self.creator_address = creator
        self.opponet_address = None
        self.player_one = None
        self.player_two = None
        self.game = None
        self.id = _id
        self.winner_address = None
        self.created_at = time.time
        self.in_progress = False
        self.game_ended = False
        self.turn = None
        self.state = self.game.get_initial_state()
        
    def add_opponent(self,address):
        self.opponet_address = address

    def spawn(self):

        self.in_progress = True
        random_number = random.randint(1, 6)

        if random_number > 3:
            self.player_one = self.creator_address
            self.player_two = self.opponet_address
        else:
            self.player_one = self.opponet_address
            self.player_two = self.creator_address 

        self.turn = self.player_one 

    def move(self,action,state):

        player = 1 if self.turn == self.player_one else -1
        self.state = self.game.get_next_state(state, action, player)
        value, is_terminal = self.game.get_value_and_terminated(self.state, action)

        if is_terminal:
            if value == 1:
                self.winner_address = self.turn
                self.in_progress = False
                self.turn = None
                self.game_ended = True
                return self.state,self.game_ended,True
            else:
                print("draw")
                self.in_progress = False
                self.turn = None
                self.game_ended = True
                return self.state,self.game_ended,False
        else:
            self.turn = self.player_one if self.turn == self.player_two else self.player_two
            return self.state,self.game_ended,False


                

                    



        

        




