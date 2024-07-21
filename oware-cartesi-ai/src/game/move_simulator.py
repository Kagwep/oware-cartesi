
from .constants import NUMBER_OF_HOUSES, PLAYER_ONE_HOUSES , PLAYER_TWO_HOUSES,HOUSES

class MoveSimulator:

    def __init__(self) -> None:
        self.player = None


    def player_seeds(self,player,seeds):

        opponent_houses = PLAYER_ONE_HOUSES if player.houses == PLAYER_TWO_HOUSES else PLAYER_TWO_HOUSES

        if 'House1' in opponent_houses:
            opponent_seeds = seeds[:6]
            player_seeds = seeds[6:]
        else:
            opponent_seeds = seeds[6:]
            player_seeds = seeds[:6]

        return opponent_seeds,player_seeds
    

    def check_seeds_in_scope_capture(self, seeds_in_scope, remainder_houses):

            scope_has_no_seeds = len(seeds_in_scope) == 0

            # Check if all seeds are less than or equal to 3
            all_three_or_less = all(seed_number <= 3 for seed_number in seeds_in_scope)
            
            # Check if all seeds in remainder_houses are zero
            all_zeros = all(house == 0 for house in remainder_houses)

            if scope_has_no_seeds and all_zeros:
                return False

            if all_three_or_less and all_zeros:
                return False
            
            any_remainder = any(house > 0 for house in remainder_houses)

            if all_three_or_less and any_remainder:
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
            # Check if seeds_index is at the last position
            if seeds_index == 5:
                remainder_houses = []  # Set remainder_houses to empty if it's the last index
            else:
                remainder_houses = opponent_seeds[seeds_index + 1:]  # Start from the next index to exclude the seed at seeds_index

            seeds_in_scope = opponent_seeds[:seeds_index + 1]  # Include the last item
            opponent_first_index = 0
            opponent_last_index = 5 
        else:
            opponent_seeds = seeds[6:]
            # Check if seeds_index is at the last position
            if seeds_index == 11:
                remainder_houses = []  # Set remainder_houses to empty if it's the last index
            else:
                remainder_houses = opponent_seeds[(seeds_index - 6) + 1:]  # Start from the next index to exclude the seed at seeds_index

            seeds_in_scope = opponent_seeds[:seeds_index - 5]  # Include the last item, adjust to correct index calculation
            opponent_first_index = 6
            opponent_last_index = 11


        # Special handling for the first house
        if seeds_index == opponent_first_index:
            # Check if the first house has 3 or fewer seeds and all other houses are 0
            if opponent_seeds[0] <= 3 and all(seed == 0 for seed in opponent_seeds[1:]):
                return False
                

        # Check if the last seed lands in the last opponent house
        if seeds_index == opponent_last_index:
            # Check for validity based on opponent's seed condition
            if all(seed > 0 for seed in opponent_seeds) and max(opponent_seeds) <= 3:
                return False
       
        move_validity = self.check_seeds_in_scope_capture(seeds_in_scope, remainder_houses)
        return move_validity




    def opponent_has_seeds_after_move(self, selected_house_name,player_turn, seeds):
        # Retrieve current seeds distribution on the board

        # Convert selected house name to its corresponding index
        house_index = HOUSES.index(selected_house_name)

        # Get initial distribution of seeds for opponent and player based on the current turn
        opponent_seeds, player_seeds = self.player_seeds(player_turn, seeds)

        # Calculate total seeds currently with the opponent
        total_opponent_seeds = sum(opponent_seeds)

        # Check if opponent already has seeds
        if total_opponent_seeds > 0:
            return True
        
        else:
            # Simulate the move and get new seeds distribution
            after_move_seeds_state, after_move_seeds_incremented_to_count, seeds_index = self.move(seeds, house_index)

            # Re-calculate the seeds distribution after the move
            opponent_seeds, player_seeds = self.player_seeds(player_turn, after_move_seeds_state)

            # Check again for seeds with the opponent after the move
            total_opponent_seeds = sum(opponent_seeds)
            if total_opponent_seeds > 0:
                return True
            else:
                return False




    def is_selected_house_valid(self, selected_house, player_turn,seeds):


        house_index = HOUSES.index(selected_house)

        seeds_number = seeds[house_index]

        if seeds_number == 0:
            return False

        else:
            opponent_seeds_check =  self.opponent_has_seeds_after_move(selected_house,player_turn,seeds)
            return opponent_seeds_check
        
        
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


    def make_move(self,selected_house,seeds,player):

        self.player = player

        house_index = HOUSES.index(selected_house)

        seeds,seeds_increamented_to_count,seeds_index = self.move(seeds,house_index)

        capture_made_check = self.check_capture(seeds_increamented_to_count,seeds,seeds_index)


        captured = 0

        if capture_made_check:
            seeds,captured = self.capture_seeds(seeds,seeds_increamented_to_count,seeds_index,captured)
        else:
            seeds = seeds
        
        return seeds
    

    def get_next_state(self,seeds,house_index,player):

  
        seeds = seeds.tolist()


        self.player = player
                
        seeds,seeds_increamented_to_count,seeds_index = self.move(seeds,house_index)

        capture_made_check = self.check_capture(seeds_increamented_to_count,seeds,seeds_index)


        captured = 0

        if capture_made_check:
            seeds,captured = self.capture_seeds(seeds,seeds_increamented_to_count,seeds_index,captured)
        else:
            seeds = seeds
        return seeds , captured