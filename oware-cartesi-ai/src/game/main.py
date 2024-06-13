from player import Player
from gameplay import GamePlay
from constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES
from oware_moves import OwareMoves
from oware_model import OwareModel
from coordinate_house_map import coordinates_houses_map
from opponent_move_selector import OpponentMovesSelector

player_one = Player('agent',PLAYER_ONE_HOUSES,0)
player_two = Player('opponent',PLAYER_TWO_HOUSES,0)

player_turn = player_one

game = GamePlay()

initial_board_state = game.game_init(player_one,player_two,player_turn)
oware_moves = OwareMoves()

oware_model = OwareModel()

train_model = False

player_opponent = player_two

opponent_move_selector = OpponentMovesSelector()

while game.state.is_in_progress():

    visua1, visual2 = game.get_board_display(player_turn)

    row_one,row_two = visual2

    print("      ")
    print(row_one)
    print(row_two)
    print("      ")
  
    oware_moves.legal_moves_generator(game,player_turn)
    move_selected = oware_moves.move_selector(oware_model.get_model())

    if len(move_selected) == 3:
        selected_move,new_board_state,score = move_selected

    if player_turn.name == 'agent':
        train_mode = True
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





    


    






 