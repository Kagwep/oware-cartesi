export interface Challenge {
    challenge_id: string,
    creator:string,
    opponent: string
    in_progress:boolean,
    game_ended: boolean,
    winner: PlayerTwo,
    rounds:number,
    round_winners: RoundWinners,
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
    houses: string[],
    captured: number,
    address:string,
}

// types.ts

export type Notice = {
    index: number;
    input: {
      index: number;
    };
    payload: string;
  };
  
  export type Report = {
    index: number;
    input: {
      index: number;
    };
    payload: string;
  };
  
  export type Voucher = {
    index: number;
    input: {
      index: number;
    };
    destination: string;
    payload: string;
  };
  
  export type GraphQLResponse<T> = {
    data: T;
  };

  export interface RoundWinners {
    [key: number] : PlayerTwo
  }