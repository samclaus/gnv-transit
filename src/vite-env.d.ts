/// <reference types="svelte" />
/// <reference types="vite/client" />

interface Dict<T> {
    [key: string]: T;
}

declare module "rbush-knn" {
    export default function knn<T>(
        tree: any,
        x: number,
        y: number,
        k?: number,
        filterFn?: (item: T) => boolean,
        maxDistance?: number,
    ): T[];
}