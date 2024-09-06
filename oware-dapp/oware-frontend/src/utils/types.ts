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

export interface PlayerOne {
  name: string;
  address: string;
  model_name: string;
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

  export interface Fixture {
    challenge_id: number;
    player_one: Player;
    player_two: Player;
  }

  export interface Tournament {
    tournament_id: string;
    no_of_players: number;
    creator: string;
    players: [string[]];
    in_progress: boolean;
    game_ended: boolean;
    winner: PlayerTwo | null;
    rounds_per_challenge: number;
    fixtures: { [key: string]: Fixture[] };
    started_at: number;
    ended_at: number;
    round_winners: { [key: number]: PlayerOne };
    active_round: number;
    challenges: { [key: number]: Challenge }; // You may want to define a more specific type for challenges
    next_challenge_id: number;
    round: number;
    winners: PlayerTwo[];
    allowable_player_counts: number[];
  }


  export interface Leader {
    ethAddress: string;
    leaderInfo: LeaderInfo;
  }


  export interface LeaderInfo {
    player_name: string;
    score: number;
    rank_title: string;
  }

  export interface Profile  {
    player_name: string;
    eth_address: string;
    score: number;
    rank_title: string;
  };