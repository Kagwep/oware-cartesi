class Leaderboard:
    
    def __init__(self):
        # Store player details using Ethereum address as a key
        self.players = {}

        # Store player details for tournament games
        self.players_tournament = {}

    def add_or_update_player(self, player_name, eth_address, score=0):
        # Add a new player or update an existing player's score
        if eth_address not in self.players:
            self.players[eth_address] = {'player_name': player_name, 'score': score, 'rank_title': None}
        else:
            self.players[eth_address]['score'] += score

        self.update_rank_title(eth_address)

    def add_or_update_tournament_player(self, player_name, eth_address, minerals=0):
        # Add or update player details for tournament games (uses minerals)
        if eth_address not in self.players_tournament:
            self.players_tournament[eth_address] = {'player_name': player_name, 'minerals': minerals, 'rank_title': None}
        else:
            self.players_tournament[eth_address]['minerals'] += minerals

        self.update_tournament_rank_title(eth_address)

    def update_score(self, eth_address, score):
        # Update the score for a player and re-calculate rank titles
        if eth_address in self.players:
            self.players[eth_address]['score'] += score
            self.update_rank_title(eth_address)

    def update_tournament_score(self, eth_address, minerals):
        # Update the minerals for a player in tournament games and re-calculate rank titles
        if eth_address in self.players_tournament:
            self.players_tournament[eth_address]['minerals'] += minerals
            self.update_tournament_rank_title(eth_address)

    def update_rank_title(self, eth_address):
        # Update rank title based on score
        score = self.players[eth_address]['score']
        if score < 1000:
            self.players[eth_address]['rank_title'] = 'Beginner'
        elif score < 2000:
            self.players[eth_address]['rank_title'] = 'Intermediate'
        elif score < 3000:
            self.players[eth_address]['rank_title'] = 'Advanced'
        elif score < 4000:
            self.players[eth_address]['rank_title'] = 'Expert'
        else:
            self.players[eth_address]['rank_title'] = 'Legend'


    def update_tournament_rank_title(self, eth_address):
        # Update rank title based on tournament minerals
        minerals = self.players_tournament[eth_address]['minerals']
        if minerals < 100:
            self.players_tournament[eth_address]['rank_title'] = 'Bronze'
        elif minerals < 500:
            self.players_tournament[eth_address]['rank_title'] = 'Silver'
        elif minerals < 1000:
            self.players_tournament[eth_address]['rank_title'] = 'Gold'
        elif minerals < 2000:
            self.players_tournament[eth_address]['rank_title'] = 'Platinum'
        else:
            self.players_tournament[eth_address]['rank_title'] = 'Diamond'

    def get_top_players(self, top_n=100):
        # Sort the players by score in descending order
        sorted_players = sorted(self.players.items(), key=lambda item: item[1]['score'], reverse=True)
        
        # Create the list of dicts with the required fields
        top_players = [
            {
                'player_name': player_info['player_name'],
                'eth_address': eth_address,
                'score': player_info['score'],
                'rank_title': player_info['rank_title']
            }
            for eth_address, player_info in sorted_players[:top_n]
        ]
        
        return top_players

    def get_top_tournament_players(self, top_n=100):
        # Sort players by minerals in descending order for tournament games
        sorted_tournament_players = sorted(self.players_tournament.items(), key=lambda item: item[1]['minerals'], reverse=True)
        
        # Create the list of dicts with the required fields
        top_tournament_players = [
            {
                'player_name': player_info['player_name'],
                'eth_address': eth_address,
                'minerals': player_info['minerals'],
                'rank_title': player_info['rank_title']
            }
            for eth_address, player_info in sorted_tournament_players[:top_n]
        ]
        
        return top_tournament_players
    
    def display(self):
        # Return the leaderboard as a list
        top_players = self.get_top_players()
        leaderboard_list = []
        for eth_address, details in top_players:
            leaderboard_entry = f"{details['rank_title']}. {details['player_name']} (ETH: {eth_address}) - Score: {details['score']}"
            leaderboard_list.append(leaderboard_entry)
        return leaderboard_list
    
    
    def display_tournament(self):
        # Display the tournament leaderboard as a list
        top_tournament_players = self.get_top_tournament_players()
        leaderboard_list = []
        for player in top_tournament_players:
            leaderboard_entry = f"{player['rank_title']}. {player['player_name']} (ETH: {player['eth_address']}) - Minerals: {player['minerals']}"
            leaderboard_list.append(leaderboard_entry)
        return leaderboard_list

    def get_player(self, eth_address):
        # Retrieve player information using their Ethereum address
        if eth_address in self.players:
            player_info = self.players[eth_address]
            return {
                'player_name': player_info['player_name'],
                'eth_address': eth_address,
                'score': player_info['score'],
                'rank_title': player_info['rank_title']
            }
        else:
            return None  # or you could raise an exception if you prefer

    def get_tournament_player(self, eth_address):
            # Retrieve player information for tournament games using their Ethereum address
            if eth_address in self.players_tournament:
                player_info = self.players_tournament[eth_address]
                return {
                    'player_name': player_info['player_name'],
                    'eth_address': eth_address,
                    'minerals': player_info['minerals'],
                    'rank_title': player_info['rank_title']
                }
            else:
                return None