export interface Challenge {
    challenge_id: string,
    creator:string,
    opponent: string
    in_progress:boolean,
    game_ended: boolean,
    winner: string,
    state: string
}

export interface Player {
    player_name:string
    eth_address:string
    score:number
    rank_title:string
}