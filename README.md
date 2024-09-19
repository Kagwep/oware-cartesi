# oware-cartesi


## Game Overview

Oware is a two-player game belonging to the Mancala family of board games. The game is played on a board with 12 pits (or houses) arranged in two rows of six, with each player controlling the six pits on their side of the board.

<img src="https://res.cloudinary.com/dydj8hnhz/image/upload/v1726751708/st2hf6gvjfaqgqqvufbo.png" alt="Detailed view of Oware board setup" />

## Game Setup

1. The board starts with 4 seeds in each of the 12 pits.
2. Players sit on opposite sides of the board, each controlling the row closest to them.


## Basic Rules

1. **Objective**: The goal is to capture more seeds than your opponent.

2. **Turn Structure**: 
   - On their turn, a player chooses one of their six pits containing seeds.
   - The player then distributes these seeds, one by one, counterclockwise into the subsequent pits.

<img src="https://res.cloudinary.com/dydj8hnhz/image/upload/v1726751708/utv4wuff6ev4bodkmuzw.png" alt="Animation of seed distribution during a turn" />

3. **Capturing**: 
   - If the last seed dropped lands in an opponent's pit and brings the total seeds in that pit to 2 or 3, the player captures all seeds in that pit.
   - The player also captures seeds from any preceding adjacent opponent's pits that also contain 2 or 3 seeds.

4. **Special Rules**:
   - If a move would capture all of the opponent's seeds, the capture is forfeit.
   - A player must make a move that gives their opponent seeds if possible.

5. **Game End**: 
   - The game ends when one player has captured more than 24 seeds, or when only one player can make a move.

## Our  Implementation

Our version of Oware enhances the traditional gameplay with several unique features:

1. **AI Opponents**: Players can challenge AI opponents of varying difficulty levels, trained using  machine learning techniques on the Cartesi Virtual Machine.


2. **3D Visualization**: The game board and pieces are rendered in stunning 3D graphics using Babylon.js, providing an immersive gaming experience.

3. **Tournaments**: Players can participate in automated tournaments with smart contract-managed  reward distribution.

<img src="https://res.cloudinary.com/dydj8hnhz/image/upload/v1726751707/jrzlclitjt7askyufdvx.png" alt="Tournament lobby and bracket visualization" />


4. **Blockchain Integration**: Game results, player statistics, and achievements are securely recorded , ensuring transparency and enabling a rich ecosystem of rewards and progression.


## Strategy Tips

1. Plan several moves ahead, considering both offensive and defensive strategies.
2. Try to keep your pits with low seed counts to limit your opponent's capturing opportunities.
3. Use the special rules to your advantage, sometimes forcing your opponent into suboptimal moves.
4. In the endgame, count carefully to ensure you're on track to capture the majority of seeds.



## Project Documentation

### Developer and User Guides

# Project Setup and Running Guide

This guide provides instructions for setting up and running the backend, relayer, frontend, and Oware Rewards contract of the project locally.

## Table of Contents

- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Running the Oware NFT Contract](#running-the-nebula-contract)

## Running the Backend

1. **Navigate to the App Folder**

   - Open your terminal and `cd` into the `oware-dapp` folder.


2. **Build and Run the Application**

   - Run the following commands:
     ```bash
     cartesi build
     cartesi run
     ```



## Running the Frontend

1. **Navigate to the Frontend Folder**

   `cd` into the `oware-frontend` folder.

2. **Install Dependencies**

   - Run the following command:

     ```bash
     npm install
     ```

3. **Set Up Environment Variables**

   - Create a `.env` file with the following details:

     ```
     VITE_MODE=local
     ```



4. **Start the Frontend**

   - Run the following command:

     ```bash
     npm run dev
     ```

## Running the Oware NFT Rewards Contract

1. **Navigate to the Dynamic_NFT Folder**

   - `cd` into the `oware-nft` folder.

2. **Install Dependencies**

   - Run the following command:

     ```bash
     npm install
     ```

3. **Set Up Environment Variables**

   - Create a `.env` file with the following details:

     ```
     WALLET_KEY=<your_wallet_private_key>

     ```

4. **Deploy Locally**

   - Start a local node by running:

     ```bash
     npx hardhat node --port 8546
     ```

   - Deploy the contract locally and run the scripts:

     ```bash
     npx hardhat ignition deploy ./ignition/modules/OwareNFTReward.ts --network base-local
     ```

   - You should get an output similar to:

     ```
     Deployed Addresses

     OwareNFTRewardModule#OwareNFTReward - 0x8464135c8F25Da09e49BC8782676a84730C318bC
     ```

     Copy and paste this URL into your browser.

5. **Deploy to a Live Network**

   - Ensure the necessary `.env` requirements are provided for the specific network.
   - Deploy the contract to a live network (e.g., base-sepolia) by running:

     ```bash
          npx hardhat ignition deploy ./ignition/modules/OwareNFTReward.ts --network base-sepolia
     ```

<br>
<br>
