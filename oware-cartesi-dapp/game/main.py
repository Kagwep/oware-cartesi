from player import Player
from gameplay import GamePlay
from constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES
from oware_moves import OwareMoves
from oware_model import OwareModel
from coordinate_house_map import coordinates_houses_map
from opponent_move_selector import OpponentMovesSelector
from scipy.ndimage import shift
import numpy as np
import tensorflow as tf
import os
import time
import csv


def oware_cartesi(player_one,player_two):

    player_turn = player_one

    game = GamePlay()

    initial_board_state = game.game_init(player_one,player_two,player_turn)

    oware_moves = OwareMoves()

    oware_model = OwareModel()

    train_model = False

    player_opponent = player_two

    opponent_move_selector = OpponentMovesSelector()

    scores_list=[]
    corrected_scores_list=[]
    new_board_states_list=[]

    player_one_previous_captured = 0
    player_two_previous_captured = 0
    
    stale_mate = False

    players_captures_track_count = 0

    stale_mate_count = 100

    while game.state.is_in_progress():

        visua1, visual2 = game.get_board_display(player_turn)

        row_one,row_two = visual2

        print("      ")
        print(row_one)
        print(row_two)
        print("      ")
    
        moves, moves_state = game.get_valid_moves(game,player_turn)

        print(moves)
        print(moves_state)


        move_selected = oware_moves.move_selector(oware_model.get_model())

        if len(move_selected) == 3:
            selected_move,new_board_state,score = move_selected
            scores_list.append(score[0][0])
            new_board_states_list.append(new_board_state)
        
        if player_turn.name == 'agent':
            train_model = True
            selected_house = coordinates_houses_map.get(selected_move)
        elif player_turn.name == 'opponent':
           
            move = opponent_move_selector.capture_move_check(game,oware_moves.legal_moves_dict,player_turn,player_opponent)
            selected_house = coordinates_houses_map.get(move)
        else:
            selected_house =  game.get_selected_house(player_turn)
        
        #selected_house =  game.get_selected_house(player_turn)

        print("      ",selected_house)

        seeds,captured = game.make_move(selected_house)

        game.state.update_board_state(seeds)

        if player_turn == player_two and captured > 0:
            player_two.captured += captured
        elif player_turn == player_one and captured > 0:
            player_one.captured += captured

        result = game.check_game_outcome_status()

        if result == 1:
            print(f"{player_one.name} wins!")
        elif result == 2:
            print(f"{player_two.name} wins!")
        elif result == 0:
            print("The game is a draw!")

        else:

            player_opponent = game.state.change_turn(player_turn)

            player_turn = game.state.get_player_turn()

            player_one_current_captured = player_one.captured
            player_two_current_captured = player_two.captured

            # Check for stalemate condition based on captures
            if (player_one_previous_captured == player_one_current_captured) and ( player_two_current_captured == player_two_previous_captured):
                players_captures_track_count += 1
            else:
                players_captures_track_count = 0
                player_one_previous_captured = player_one_current_captured
                player_two_previous_captured = player_two_current_captured

            # Check if stalemate count reached
            if players_captures_track_count >= stale_mate_count:
                stale_mate = True
            
            # Handle stalemate
            if stale_mate:
                print("Stalemate detected. Ending game.")
                result = game.state.set_winner()  # This function needs to properly handle stalemate logic

            oppononent_seeds,player_seeds = game.player_seeds(player_turn,seeds)

            opponent_seeds_total = sum(oppononent_seeds)

            opponent_has_zero_seeds = opponent_seeds_total == 0

            if opponent_has_zero_seeds:

                seeds_distribution_possible = game.can_player_distribute_seeds_to_opponent(player_turn,seeds)

                if not seeds_distribution_possible:
                    print("Automatic capture. Ending game.")
                    
                    result = game.state.update_capture_and_win(player_turn,player_seeds)  


    if train_model:
        # Correct the scores, assigning 1/0/-1 to the winning/drawn/losing final board state, 
        # and assigning the other previous board states the score of their next board state
        new_board_states_list=tuple(new_board_states_list)
        new_board_states_list=np.vstack(new_board_states_list)

        if (result == 1 or result == 2) and player_turn.name=="agent": 
                corrected_scores_list=shift(scores_list,-1,cval=1.0)
                play_result="Won"
        if (result == 1 or result == 2) and player_turn.name=="opponent":
                corrected_scores_list=shift(scores_list,-1,cval=-1.0)
                play_result="Lost"
        if result == 0:
                corrected_scores_list=shift(scores_list,-1,cval=0.0)
                play_result="Drawn"
                
        x=new_board_states_list
        y=corrected_scores_list

        def unison_shuffled_copies(a, b):
                assert len(a) == len(b)
                p = np.random.permutation(len(a))
                return a[p], b[p]
        
        # shuffle x and y in unison
        x,y=unison_shuffled_copies(x,y)
        x=x.reshape(-1,12) 
        
        # update the weights of the model, one record at a time
        oware_model.train(x,y,epochs=1,batch_size=1,verbose=0)

        model = oware_model.get_model()
        

        return model,y,play_result



 
game_counter =  1
output_model = None
no_of_games = 2
save_interval = 10
start_time = time.time()

while(game_counter <= no_of_games ):
     
     player_one = Player('agent1',PLAYER_ONE_HOUSES,0)
     player_two = Player('opponent1',PLAYER_TWO_HOUSES,0)
     oware_results = oware_cartesi(player_one,player_two)

     if oware_results is not None:
        
        model,y,results = oware_results
        print("Game#: ",game_counter)
        game_counter += 1

        if game_counter % save_interval == 0  or game_counter == no_of_games:

            output_model = model

            model_name = f"agent-model-{str(no_of_games)}"

            model_path = f"oware-cartesi-ai/src/game-models"

            output_model.export(model_path)

            converter = tf.lite.TFLiteConverter.from_saved_model(model_path)
            tflite_model = converter.convert()

            model_file_path = os.path.join(os.path.abspath(os.getcwd()), "oware-cartesi-ai/src/models-tflite", f"{model_name}.tflite")

            with open(model_file_path, "wb") as f:
                f.write(tflite_model)



end_time = time.time()  # Record the end time after the loop

# Calculate the total duration of the process
total_duration = end_time - start_time
total_duration_minutes = total_duration / 60


# Print a completion message with the total duration
print("Training and model saving process completed successfully!")
print(f"All models up to game {no_of_games} are saved at intervals of {save_interval} games.")
print(f"Total duration: {total_duration_minutes:.2f} minutes")
print("Check the 'oware-cartesi-ai/src/models' directory for all saved models.")

# model_name = f"agent-model-{str(no_of_games)}"

# output_model.export(model_name)

# converter = tf.lite.TFLiteConverter.from_saved_model(model_name)
# tflite_model = converter.convert()

# model_file_path = os.path.join(os.path.abspath(os.getcwd()), "oware-cartesi-ai/src/models", f"{model_name}.tflite")

# with open(model_file_path, "wb") as f:
#     f.write(tflite_model)



 