import { GameStatus } from "./GameStatus.js";

class GameWinner {
    // Check if any player has won
    static checkWinner(gameState: GameStatus) {
        // Simple win condition: player with empty hand wins
        for (const player of gameState.playerHands) {
            if (gameState.playerHands.length === 0) {
                return {
                    winner: gameState.currentTurn,
                    winCondition: 'empty_hand',
                    message: "Player has no cards left!"
                };
            }
        }
        // Add more win conditions here if needed
        return null; // No winner yet
    }
}
