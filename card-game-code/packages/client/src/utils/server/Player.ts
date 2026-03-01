import { Card } from "./Card";

export class Player {
    id: number;
    hand: Card[];

    constructor(id: number, hand: Card[]) {
        this.id = id;
        this.hand = hand;
    }

    getHand() {
        return this.hand;
    }

    getID() {
        return this.id;
    }

    setHand(hand: Card[]) {
        this.hand = hand;
    }
}