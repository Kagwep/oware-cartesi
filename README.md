# oware-cartesi

## Live Demo

Check out the live version of the Oware DApp here: [Oware DApp Live Demo](https://oware-cartesi.vercel.app)


## Game Overview

Oware is a two-player game belonging to the Mancala family of board games. The game is played on a board with 12 pits (or houses) arranged in two rows of six, with each player controlling the six pits on their side of the board.


<img src="https://res.cloudinary.com/dydj8hnhz/image/upload/v1726751708/st2hf6gvjfaqgqqvufbo.png" alt="Detailed view of Oware board setup" />

### Developer and User Guides

# Project Setup and Running Guide

This guide provides instructions for setting up and running the backend, frontend, and Oware Rewards contract of the project locally.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
2. [Project Setup and Running Guide](#project-setup-and-running-guide)
   - [Running the Backend](#running-the-backend)
   - [Running the Frontend](#running-the-frontend)
3. [Interacting with the DApp](#interacting-with-the-dapp)
   - [Connect Your Wallet](#1-connect-your-wallet)
   - [Ensure You're on the Local Network](#2-ensure-youre-on-the-local-network)
   - [Explore and Interact](#3-explore-and-interact)
4. [Optional: Deploying the Oware NFT Contract](#optional-deploying-the-oware-nft-contract)
5. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed and set up:

1. **Docker Desktop and RISC-V support**:
   - Install [Docker Desktop](https://www.docker.com/products/docker-desktop) for your operating system.
   - To install Docker RISC-V support without using Docker Desktop, run the following command:
     ```bash
     docker run --privileged --rm tonistiigi/binfmt --install all
     ```
   - Verify Docker is running by using the following command in your terminal:
     ```bash
     docker --version
     ```

2. **Node.js and npm**:
   - Download and install the latest version of [Node.js](https://nodejs.org/), which includes npm.
   - Verify the installation by running:
     ```bash
     node --version
     npm --version
     ```

3. **Cartesi CLI**:
   - Cartesi CLI is an easy-to-use tool to build and deploy your dApps. To install it, run:
     ```bash
     npm i -g @cartesi/cli
     ```
   - After installation, verify it's correctly installed by running:
     ```bash
     cartesi --version
     ```

4. **Git**: For cloning the repository.

Now, let's clone the project repository and navigate to the correct directory:

```bash
git clone https://github.com/Kagwep/oware-cartesi.git
cd oware-cartesi
```

Project structure:
- `oware-cartesi/` (root directory)
  - `oware-dapp/` (contains the backend and frontend)
    - `oware-frontend/` (frontend code)
  - `oware-nft/` (NFT contract code)

## Project Setup and Running Guide

### Running the Backend

1. **Navigate to the oware-dapp Folder**
   ```bash
   cd oware-dapp
   ```

2. **Build and Run the Application**
   Ensure Docker is running, then execute:
   ```bash
   cartesi build
   cartesi run
   ```

### Running the Frontend

1. **Open a new terminal and navigate to the Oware Frontend Folder**
   ```bash
   cd oware-cartesi/oware-dapp/oware-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create a `.env` file with the following content:
     ```
     VITE_MODE=local
     ```

4. **Start the Frontend**
   ```bash
   npm run dev
   ```

## Interacting with the DApp

After successfully running the frontend, you'll want to interact with the DApp. Follow these steps:

### 1. Connect Your Wallet

1. Open your web browser and navigate to the frontend URL (typically `http://localhost:5173`).
2. Look for a "Connect Wallet" button, usually in the top right corner of the page.
3. Click on the button and select your preferred wallet (e.g., MetaMask).
4. Follow the prompts in your wallet to connect it to the DApp.

### 2. Ensure You're on the Local Network

1. Open your wallet (e.g., MetaMask) and check the network selection.
2. Make sure you're connected to your local network (Hardhat node running on `http://localhost:8545`).
3. If not on the correct network, add a new network with these details:
   - Network Name: Hardhat Local
   - New RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

### 3. Explore and Interact

1. Once connected and on the correct network, you should see your account balance and be able to interact with the DApp.
2. Explore all the Oware game features thoroughly:
   - Start a new challenge
   - Start a new tournament
   - Make moves in the game
   - View your game profile
   - Check out any leaderboards or stats
   - Explore any settings or customization options
3. Play multiple games to get a full experience of the DApp's functionality.
4. Test all available features and interactions to ensure everything is working as expected.



## Optional: Deploying the Oware NFT Contract

1. **Navigate to the oware-nft Folder**
   ```bash
   cd oware-cartesi/oware-nft
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create a `.env` file with the following content:
     ```
     WALLET_KEY=<your_wallet_private_key>
     ```

4. **Deploy Locally**
   - Start a local node:
     ```bash
     npx hardhat node --port 8546
     ```
   - Deploy the contract locally:
     ```bash
     npx hardhat ignition deploy ./ignition/modules/OwareNFTReward.ts --network base-local
     ```

5. **Interact with the NFT Contract (if applicable)**
   - After deployment, return to the DApp frontend.
   - Look for any new sections or features related to NFT rewards or minting.


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


<br>
<br>
