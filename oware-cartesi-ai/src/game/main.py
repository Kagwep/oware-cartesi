from player import Player
from gameplay import GamePlay
from constants import PLAYER_ONE_HOUSES,PLAYER_TWO_HOUSES


player_one = Player('agent',PLAYER_ONE_HOUSES,0)
player_two = Player('opponent',PLAYER_TWO_HOUSES,0)

player_turn = player_one

game = GamePlay()

initial_board_state = game.game_init(player_one,player_two,player_turn)



while game.state.is_in_progress():

    print(f"{player_turn.name} Select House")

    visua1, visual2 = game.get_board_display(player_turn)

    row_one,row_two = visual2

    print(row_one)
    print(row_two)
    
    selected_house =  game.get_selected_house(player_turn)

    seeds,captured = game.make_move(selected_house)

    print(seeds)

    print(captured)

    game.state.update_board_state(seeds)

    game.state.change_turn(player_turn)

    player_turn = game.state.get_player_turn()

    
    




    


    






 