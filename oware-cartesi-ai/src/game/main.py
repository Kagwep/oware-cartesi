from player import Player
from gameplay import GamePlay
from constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES
from oware_moves import OwareMoves
from oware_model import OwareModel

player_one = Player('agent',PLAYER_ONE_HOUSES,0)
player_two = Player('opponent',PLAYER_TWO_HOUSES,0)

player_turn = player_one

game = GamePlay()

initial_board_state = game.game_init(player_one,player_two,player_turn)
oware_moves = OwareMoves()

oware_model = OwareModel()


while game.state.is_in_progress():

    visua1, visual2 = game.get_board_display(player_turn)

    row_one,row_two = visual2

    print("      ")
    print(row_one)
    print(row_two)
    print("      ")
  
    oware_moves.legal_moves_generator(game,player_turn)
    move_selected = oware_moves.move_selector(model)

    
    selected_house =  game.get_selected_house(player_turn)

    print("      ",selected_house)

    seeds,captured = game.make_move(selected_house)

   # print(seeds)


    game.state.update_board_state(seeds)

    if player_turn == player_two and captured > 0:
        player_two.captured += captured
    elif player_turn == player_one and captured > 0:
        player_one.captured += captured

    game.state.change_turn(player_turn)

    player_turn = game.state.get_player_turn()





    


    






 