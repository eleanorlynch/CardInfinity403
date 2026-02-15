export class Card {
    suit: string;
    rank: number;
    id: string;
    code: string;
    constructor(suit: string, rank: number) {
        this.suit = suit;
        this.rank = rank;
        this.id = `${rank}_${suit}`;
        this.code = `${rank}${suit.charAt(0)}`;
    }

    getSuit() {
        return this.suit;
    }

    getRank() {
        return this.rank;
    }
}