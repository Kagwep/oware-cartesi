export interface Challenge {
    challenge_id: string,
    creator:string,
    opponent: string
    in_progress:boolean,
    game_ended: boolean,
    winner: string,
    rounds:number,
    current_round:number
    created_at:number,
    challenge_type: number,
    state: number[],
    player_one_captured: PlayerTwo,
    player_two_captured: PlayerTwo
    player_turn:PlayerTwo,

}

export interface Player {
    player_name:string
    eth_address:string
    score:number
    rank_title:string
}


export interface PlayerTwo {
    name:string,
    houses: number[],
    captured: number,
    address:string,
}