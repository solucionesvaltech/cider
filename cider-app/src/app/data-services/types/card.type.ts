export interface Card {
    id: number;
    deckId: number;
    editionId?: number;
    name: string;
    count: number;
    frontCardTemplateId: number;
    backCardTemplateId: number;
}
