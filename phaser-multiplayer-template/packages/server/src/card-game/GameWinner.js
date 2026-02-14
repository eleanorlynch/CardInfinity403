class GameWinner {
    // Check if any player has won
    static checkWinner(gameState) {
        // Simple win condition: player with empty hand wins
        if (gameState.playerHand.length === 0) {
            return {
                winner: gameState.currentTurn,
                winCondition: 'empty_hand',
                message: "Player has no cards left!"
            };
        }
        
        // Add more win conditions here if needed
        return null; // No winner yet
    }
