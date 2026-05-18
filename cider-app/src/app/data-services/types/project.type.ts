export type StorageBackend = 'indexeddb' | 'firebase';

export interface Project {
    id: number;
    name: string;
    description?: string;
    storageBackend: StorageBackend;
    createdAt?: string;
}
