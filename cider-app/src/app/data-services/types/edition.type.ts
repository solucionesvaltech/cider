export interface Edition {
    id: number;
    deckId: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    order?: number;
    releaseDate?: string;
}
