class Leaderboard:
    
    def __init__(self):
        # Store player details using Ethereum address as a key
        self.players = {}

    def add_or_update_player(self, player_name, eth_address, score=0):
        # Add a new player or update an existing player's score
        if eth_address not in self.players:
            self.players[eth_address] = {'player_name': player_name, 'score': score, 'rank_title': None}
        else:
            self.players[eth_address]['score'] += score

        self.update_rank_title(eth_address)

    def update_score(self, eth_address, score):
        # Update the score for a player and re-calculate rank titles
        if eth_address in self.players:
            self.players[eth_address]['score'] += score
            self.update_rank_title(eth_address)

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

    def get_top_players(self, top_n=100):
        # Returns the top N players sorted by score descending
        sorted_players = sorted(self.players.items(), key=lambda item: item[1]['score'], reverse=True)
        return sorted_players[:top_n]

    def display(self):
        # Return the leaderboard as a list
        top_players = self.get_top_players()
        leaderboard_list = []
        for eth_address, details in top_players:
            leaderboard_entry = f"{details['rank_title']}. {details['player_name']} (ETH: {eth_address}) - Score: {details['score']}"
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
