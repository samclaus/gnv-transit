
export function flatten<T>(arr: readonly T[][]): T[] {
    const result: T[] = [];

    for (const subArr of arr) {
        result.push(...subArr);
    }

    return result;
}