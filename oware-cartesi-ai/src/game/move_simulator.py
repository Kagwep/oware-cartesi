
from constants import NUMBER_OF_HOUSES, PLAYER_ONE_HOUSES , PLAYER_TWO_HOUSES,HOUSES

class MoveSimulator:

    def __init__(self) -> None:
        self.player = None

    def check_seeds_in_scope_capture(self, seeds_in_scope, remainder_houses):

            if len(seeds_in_scope) == 0:
                return True
            
            maximum_seed_count = max(seeds_in_scope) 
            minimum_seed_count = min(seeds_in_scope)
            max_in_remainders = max(remainder_houses) if len(remainder_houses) > 0 else 0

            seed_count = sum(1 for seed_number in seeds_in_scope if seed_number > 0)
            if seed_count == 1:
                return True

            can_capture_all = 1 < maximum_seed_count <= 3 and 1 < minimum_seed_count <= 3

            if max_in_remainders == 0 and can_capture_all:
                return False
            else:
                return True

    def is_move_valid(self, seeds, seeds_index):
        
        opponent_houses = PLAYER_ONE_HOUSES if self.player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:
            opponent_seeds = seeds[:6]
            remainder_houses = opponent_seeds[seeds_index:]
            seeds_in_scope  = opponent_seeds[:seeds_index]
        else:
            opponent_seeds = seeds[6:]
            remainder_houses = opponent_seeds[seeds_index-6:]
            seeds_in_scope = opponent_seeds[:seeds_index-6]

        move_validity = self.check_seeds_in_scope_capture(seeds_in_scope, remainder_houses)
        return move_validity



    def is_selected_house_valid(board,selected_house):

        house = board[selected_house]

        if house.seeds_number == 0:
            return False

        else:
            return True
        
    def capture_seeds(self,seeds,seeds_increamented_to_count,seeds_index,captured):

        captured += seeds_increamented_to_count
        seeds[seeds_index] = 0
        
        previous_house_index = (seeds_index -1) % NUMBER_OF_HOUSES


        opponent_houses = PLAYER_ONE_HOUSES if self.player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        previous_house_number = previous_house_index + 1

        house_to_check = f'House{previous_house_number}'

        if house_to_check not in opponent_houses:
            return seeds,captured
        
        seeds_increamented_to_count = seeds[previous_house_index]
        
        if seeds_increamented_to_count == 2 or seeds_increamented_to_count == 3:
            return self.capture_seeds(seeds,seeds_increamented_to_count,previous_house_index,captured)
        else:
            return seeds,captured
            


        
    def check_capture(self,last_seed_count,seeds,seeds_index):


        player_house = True if f'House{seeds_index + 1}' in self.player.houses else False


        if (last_seed_count == 2 or last_seed_count == 3) and not player_house:

            capture_move_valid = self.is_move_valid(seeds,seeds_index)

            if capture_move_valid:
                return True
            else:
                print(" This Move Captures all the opponent seeds")
                return False
        else:
            return False
        

    def move(self,seeds,house_index):
        # Get the seed count at the house_index and set that count to zero

        
        value = seeds[house_index]
        seeds[house_index] = 0
        
        # Determine if we need to skip the original house during the planting
        skip_original_index = value >= 12
        
        # Start from the next house counter clockwise
        current_index = (house_index + 1) % len(seeds)

        while value > 0:
            # If we need to skip the original house and we're back at it, move to the next
            if skip_original_index and current_index == house_index:
                current_index = (current_index + 1) % len(seeds)
                continue
            
            # Increment the current house and move to the next
            seeds[current_index] += 1
            seeds_increamented_to_count = seeds[current_index]
            seeds_index = current_index
            value -= 1  # Decrement the original seeds picked
            current_index = (current_index + 1) % len(seeds)

        # Return the final state of the seeds
        return seeds,seeds_increamented_to_count,seeds_index


    def make_move(self,selected_house,board,seeds,player):

        self.player = player
        house = board[selected_house]
        house_index = house.house_number - 1

        seeds,seeds_increamented_to_count,seeds_index = self.move(seeds,house_index)

        capture_made_check = self.check_capture(seeds_increamented_to_count,seeds,seeds_index)


        captured = 0

        if capture_made_check:
            seeds,captured = self.capture_seeds(seeds,seeds_increamented_to_count,seeds_index,captured)
        else:
            seeds = seeds
        
        return seeds
    