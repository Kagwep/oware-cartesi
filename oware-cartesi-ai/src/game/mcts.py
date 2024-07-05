import numpy as np
import math
import copy

class Node:

    def __init__(self, game,args,state,player, parent=None, action_taken=None) -> None:

        self.game = game 
        self.state  = state
        self.args = args
        self.parent = parent
        self.action_taken = action_taken
        self.children = []
        self.moves, self.expandable_moves = game.get_valid_moves(game,player)
        self.visit_count = 0
        self.value_sum = 0 
        self.player = player

        

    def is_fully_exanded(self):
        return np.sum(self.expandable_moves) == 0 and len(self.children) > 0
    
    def select(self):

        best_child = None
        best_ucb = -np.inf

        for child in self.children:
            ucb = self.get_ucb(child)

            if ucb > best_ucb:
                best_child = child
                best_ucb = ucb

        return best_child
    
    def get_ucb(self, child):

        q_value  = 1 - ((child.value_sum / child.visit_count) + 1) / 2
        return q_value + self.args['C'] * math.sqrt(math.log(self.visit_count) / child.visit_count)
    
    def expand(self):

        action = np.random.choice(np.where(self.expandable_moves == 1)[0])

        self.expandable_moves[action] = 0
        child_state = self.state.copy()
        seeds,captured = self.game.get_next_state(self,child_state,action,self.player)
        self.player.captured += captured
        child_state = np.array(seeds)
        child_state = self.game.change_perspective(child_state)
        child = Node(self.game, self.args, child_state, self, action)
        self.children.append(child)

        return child
    
    def simulate(self):

        value, is_terminal = self.game.get_value_and_terminated(self.state, self.action_taken,self.player)

        value = self.game.get_opponent_value(value)

        if is_terminal:
            return  value
        
        rollout_state = self.state.copy()
        rollout_player = 1

        captured_one  = 0
        captured_two  = 0

        while True:

            valid_moves = self.game.get_valid_moves(rollout_state)

            action  = np.random.choice(np.where(valid_moves == 1)[0])
            rollout_state = self.game.get_next_state(rollout_state, action,rollout_player)

            value, is_terminal = self.game.get_value_and_terminated(rollout_state, self.action_taken)

          

            if is_terminal:
                if rollout_player == -1:
                    value  = self.game.get_opponent_value(value)
                return value
            
            rollout_player = self.game.get_opponent(rollout_player)

        
    def backpropergate(self,value):

        self.value_sum += value
        self.visit_count  += 1 

        value = self.game.get_opponent_value(value)


        if self.parent is not None:
            self.parent.backpropergate(value)

              

class MCTS:

    def __init__(self, game,args) -> None:
        
        self.game = game
        self.args = args

    def search(self,state,player):
        # define a root node
        root = Node(self.game, self.args, state)

        for search in range(self.args['num_searches']):

            node = root 

            while node.is_fully_exanded():
                node = node.select()

            value, is_terminal = self.game.get_value_and_terminated(state, node.action_taken)

            value  = self.game.get_opponent_value(value)

            if not is_terminal:
                node  = node.expand(player)
                value = node.simulate(player)

            node.backpropergate(value)

            action_propbs = np.zeros(self.game.action_size)

            for child in root.children:
                action_propbs[child.action_taken] = child.visit_count


            action_propbs /= np.sum(action_propbs)

            return action_propbs