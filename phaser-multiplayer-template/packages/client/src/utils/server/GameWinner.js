export class GameWinner {
    // Check if any player has won
    static checkWinner(gameState) {
        // Simple win condition: player with empty hand wins
        if (gameState.myHand && gameState.myHand.length === 0) {
            return {
                winner: gameState.currentTurn,
                winCondition: 'empty_hand',
                message: "Player has no cards left!"
            };
        }
        
        // Check if game is already over
        if (gameState.gameOver && gameState.winner) {
            return {
                winner: gameState.winner,
                winCondition: 'game_over',
                message: "Game is over!"
            };
        }
        
        // Add more win conditions here if needed
        return null; // No winner yet
    }
}
