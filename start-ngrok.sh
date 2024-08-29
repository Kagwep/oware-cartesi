#!/bin/bash

# Array of ports to tunnel
ports=(8545 8080)

# Function to start ngrok tunnel
start_ngrok() {
    echo "Starting ngrok tunnel for port $1..."
    ngrok http $1 > /dev/null 2>&1 &
}

# Start ngrok tunnels for all specified ports
for port in "${ports[@]}"; do
    start_ngrok $port
done

# Function to get all ngrok URLs
get_ngrok_urls() {
    curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | "\(.public_url) -> \(.config.addr)"'
}

# Wait for tunnels to establish
echo "Waiting for ngrok tunnels to establish..."
sleep 10

# Display the public URLs
echo "Ngrok tunnels established:"
get_ngrok_urls

echo "Press Ctrl+C to stop the tunnels"

# Keep the script running
trap "kill 0" EXIT
wait