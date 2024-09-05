import { Scene } from '@babylonjs/core';
import { AdvancedDynamicTexture, StackPanel, TextBlock, Control } from '@babylonjs/gui';
import { shortenAddress } from '../../utils';

export class GameInfoDisplay {
    private advancedTexture: AdvancedDynamicTexture;
    private panel: StackPanel;
    private playerInfoPanel: StackPanel;
    private infoBlocks: { [key: string]: TextBlock } = {};
    private playerInfoBlocks: { [key: string]: TextBlock } = {};

    private challengeTypes = [
        { label: 'User vs User', value: 1 },
        { label: 'User vs AI', value: 2 },
        { label: 'AI vs AI', value: 3 },
    ];
    
    // Function to get challenge type label
    private getChallengeTypeLabel = (value: number): string => {
        const challengeType = this.challengeTypes.find(type => type.value === value);
        return challengeType ? challengeType.label : 'Unknown';
    };


    constructor(advancedTexture: AdvancedDynamicTexture) {
        this.advancedTexture = advancedTexture
        
        this.panel = new StackPanel();
        this.panel.width = "200px";
        this.panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(this.panel);

        this.playerInfoPanel = new StackPanel();
        this.playerInfoPanel.width = "200px";
        this.playerInfoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.playerInfoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(this.playerInfoPanel);

        this.initializeInfoBlocks();
        this.initializePlayerInfoBlocks();
    }

    private createTextBlock(text: string, emoji: string): TextBlock {
        const textBlock = new TextBlock();
        textBlock.text = `${emoji} ${text}`;
        textBlock.color = "white";
        textBlock.fontSize = 14;
        textBlock.height = "30px";
        return textBlock;
    }

    private initializeInfoBlocks() {
        const infoItems = [
            { key: 'challengeId', text: 'Challenge ID', emoji: '🆔' },
            { key: 'creator', text: 'Creator', emoji: '👤' },
            { key: 'rounds', text: 'Rounds', emoji: '🔄' },
            { key: 'challengeType', text: 'Challenge Type', emoji: '🏆' },
            { key: 'currentRound', text: 'Current Round', emoji: '📍' },
            { key: 'winner', text: 'Winner', emoji: '🎮' },
        ];

        infoItems.forEach(item => {
            const textBlock = this.createTextBlock(item.text, item.emoji);
            this.panel.addControl(textBlock);
            this.infoBlocks[item.key] = textBlock;
        });
    }

    private initializePlayerInfoBlocks() {
        const playerInfoItems = [
            { key: 'player1', text: 'Player 1', emoji: '🎮' },
            { key: 'player2', text: 'Player 2', emoji: '🎮' },
            { key: 'status', text: 'Status', emoji: '🚦' },
            { key: 'turn', text: 'Turn', emoji: '🔄' },
        ];

        playerInfoItems.forEach(item => {
            const textBlock = this.createTextBlock(item.text, item.emoji);
            this.playerInfoPanel.addControl(textBlock);
            this.playerInfoBlocks[item.key] = textBlock;
        });
    }

    public updateGameInfo(challengeInfo: any) {
        this.infoBlocks['challengeId'].text = `🆔 Challenge ID: ${challengeInfo.challenge_id}`;
        this.infoBlocks['creator'].text = `👤 Creator: ${challengeInfo.creator[0]}`;
        this.infoBlocks['rounds'].text = `🔄 Rounds: ${challengeInfo.rounds}`;
        this.infoBlocks['challengeType'].text = `🏆 Challenge Type: ${this.getChallengeTypeLabel(challengeInfo.challenge_type)}`;
        this.infoBlocks['currentRound'].text = `📍 Current Round: ${challengeInfo.current_round}`;
        this.infoBlocks['winner'].text = `🎮 Winner: ${challengeInfo.winner ? `${shortenAddress(challengeInfo.winner.address)} - ${challengeInfo.winner.name}` : '...'}`;

        this.playerInfoBlocks['player1'].text = `🎮 Player 1: ${challengeInfo.creator[0] ? challengeInfo.creator[0] : 'Waiting...'}`;
        this.playerInfoBlocks['player2'].text = `🎮 Player 2: ${challengeInfo.opponent[0] ? challengeInfo.opponent[0] : 'Waiting...'}`;

        let gameStatus;
        if (challengeInfo.game_ended) {
            gameStatus = "Game Ended";
        } else if (challengeInfo.in_progress) {
            gameStatus = "Game in Progress";
        } else {
            gameStatus = "Waiting for Players";
        }
        this.playerInfoBlocks['status'].text = `🚦 Status: ${gameStatus}`;

        if (challengeInfo.in_progress && !challengeInfo.game_ended) {
            this.playerInfoBlocks['turn'].text = `🔄 Turn: ${challengeInfo.player_turn ? `${shortenAddress(challengeInfo.player_turn.address)} - ${challengeInfo.player_turn.name}` : "..."}`;
        } else {
            this.playerInfoBlocks['turn'].text = `🔄 Turn: N/A`;
        }
    }


}