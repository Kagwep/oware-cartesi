from game.player import Player
from game.gameplay import GamePlay
from game.constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES
from game.oware_moves import OwareMoves
from game.oware_model import OwareModel
from game.coordinate_house_map import coordinates_houses_map
from game.opponent_move_selector import OpponentMovesSelector
from scipy.ndimage import shift
import numpy as np
import tensorflow as tf
import os
import sys
import time
import tflite_runtime.interpreter as tflite
import matplotlib.pyplot as plt
from .GameplayEvaluation import GameplayEvaluationMoves
import keras


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))



def oware_cartesi(player_one,player_two,model_player_one,model_player_two,turn):

    player_turn = turn

    game_play = GamePlay()

    initial_board_state = game_play.game_init(player_one,player_two,player_turn)
    oware_moves = GameplayEvaluationMoves()

    opponent_move_selector = OpponentMovesSelector()


    train_model = False

    player_opponent = player_two

    player_one_previous_captured = 0
    player_two_previous_captured = 0
    
    stale_mate = False

    players_captures_track_count = 0

    stale_mate_count = 100

    

    while game_play.state.is_in_progress():

        visua1, visual2 = game_play.get_board_display(player_turn)

        row_one,row_two = visual2

        print("      ")
        print(row_one)
        print(row_two)
        print("      ")


        model =  model_player_one 
        model_two = model_player_two

 
        
        if player_turn.name == 'agent':
            seeds = game_play.board.get_seeds()
            moves, moves_state = game_play.get_valid_moves(player_turn,seeds)

            move_selected = oware_moves.move_selector(moves,model)

            if len(move_selected) == 3:
                selected_move,new_board_state,score = move_selected

            selected_house = coordinates_houses_map.get(selected_move)

        elif player_turn.name == 'opponent':

            seeds = game_play.board.get_seeds()
            moves, moves_state = game_play.get_valid_moves(player_turn,seeds)

            move_selected = oware_moves.move_selector(moves,model_two)

            if len(move_selected) == 3:
                selected_move,new_board_state,score = move_selected

            selected_house = coordinates_houses_map.get(selected_move)
            # move = opponent_move_selector.capture_move_check(game_play,oware_moves.legal_moves_dict,player_turn,player_opponent)
            # selected_house = coordinates_houses_map.get(move)


        print(f" Current Player {player_turn.name}   has selected   ",selected_house)

        seeds,captured = game_play.make_move(selected_house)


        game_play.state.update_board_state(seeds)

        if player_turn == player_two and captured > 0:
            player_two.captured += captured
        elif player_turn == player_one and captured > 0:
            player_one.captured += captured

        result = game_play.check_game_outcome_status()

        if result == 1:
            print(f"{player_one.name} wins!")
            print("_________________________________________________________________________________________________________________________________________________")
        elif result == 2:
            print(f"{player_two.name} wins!")
            print("_________________________________________________________________________________________________________________________________________________")
        elif result == 0:
            print("The game_play is a draw!")
            print("_________________________________________________________________________________________________________________________________________________")
        else:

            player_opponent = game_play.state.change_turn(player_turn)

            player_turn = game_play.state.get_player_turn()

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
                print("Stalemate detected. Ending game_play.")
                print("*******************************************************************************************************************************************")
                result = game_play.state.set_winner()  # This function needs to properly handle stalemate logic

            oppononent_seeds,player_seeds = game_play.player_seeds(player_turn,seeds)

            opponent_seeds_total = sum(oppononent_seeds)

            opponent_has_zero_seeds = opponent_seeds_total == 0

            if opponent_has_zero_seeds:

                seeds_distribution_possible = game_play.can_player_distribute_seeds_to_opponent(player_turn,seeds)

                if not seeds_distribution_possible:
                    print("Automatic capture. Ending game_play.")
                    
                    result = game_play.state.update_capture_and_win(player_turn,player_seeds)  
                 
    return result  

def load_model(no_of_games):
    model_path = f"./game-models/agent-model-{no_of_games}"
    tfsm_layer = keras.layers.TFSMLayer(model_path, call_endpoint='serving_default')
    # Create a Keras model that includes only the TFSMLayer
    model = keras.Sequential([
        tfsm_layer
    ])
    return model

def load_model_two(no_of_games):
    model_path = f"./game-models/agent-model-new-{no_of_games}"
    tfsm_layer = keras.layers.TFSMLayer(model_path, call_endpoint='serving_default')
    # Create a Keras model that includes only the TFSMLayer
    model = keras.Sequential([
        tfsm_layer
    ])
    return model


def load_model_tflite(no_of_games):
    model = tflite.Interpreter(model_path=f"./models-tflite/agent-model-new-{no_of_games}.tflite")
    return model

# Define the number of games each model was trained on



# Initialize win counters
agent_one_wins = 0
agent_two_wins = 0
draws = 0


game_play_counter =  1
output_model = None
no_of_game_plays = 100
start_time = time.time()
results = []
player_turns=[]
while(game_play_counter <= no_of_game_plays ):
     games_player_one = 100  # Example: model trained on 100 games
     games_player_two = 150  # Example: model trained on 500 games
     model_player_one = load_model_tflite(games_player_one)
     model_player_two = load_model_tflite(games_player_two)
     player_one = Player('agent',PLAYER_ONE_HOUSES,0)
     player_two = Player('opponent',PLAYER_TWO_HOUSES,0)
     turn  =  player_one if game_play_counter % 2 == 0 else player_two
     player_turns.append(turn)
     oware_results = oware_cartesi(player_one,player_two,model_player_one,model_player_two,turn)

     if oware_results is not None:
        result = oware_results
        results.append(result)
        if result == 1:
            agent_one_wins += 1
        elif result == 2:
            agent_two_wins += 1
        else:
            draws += 1
        print("game_play#: ",game_play_counter)
        game_play_counter += 1


print(game_play_counter)

end_time = time.time()  # Record the end time after the loop

# Calculate the total duration of the process
total_duration = end_time - start_time
total_duration_minutes = total_duration / 60



# Plotting results
labels = ['Agent One', 'Agent Two', 'Draws']
wins = [agent_one_wins, agent_two_wins, draws]

fig, ax = plt.subplots()
ax.bar(labels, wins, color=['blue', 'red', 'green'])
ax.set_xlabel('Agents')
ax.set_ylabel('Number of Wins')
ax.set_title('100 vs 150 tflite')
ax.set_ylim(0, max(wins) + 10)  # Set y-axis limits to make bars not touch the top of the plot

# Save the plot
plt.savefig('./game_play_results/100vs150_tflite.png')
plt.close()

# Save results to a text file
with open('./game_play_results/results_list.txt', 'w') as file:
    for result in results:
        file.write(f'{result}\n')

# Save results to a text file
with open('./game_play_results/turns_list.txt', 'w') as file:
    for pl in player_turns:
        file.write(f'{pl.name}\n')

print(f"Results list saved. {len(results)} game plays recorded. Duration: {total_duration_minutes:.2f} minutes.")




 