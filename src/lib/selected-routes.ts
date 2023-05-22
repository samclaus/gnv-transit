import { writable, type Readable } from "svelte/store";

const SELECTED_ROUTES_STORAGE_KEY = "BusTime.route-selection";
const SELECTED_ROUTES_SET: Set<string> = (function() {
    try {
        const selected = JSON.parse(localStorage.getItem(SELECTED_ROUTES_STORAGE_KEY)!);

        if (Array.isArray(selected)) {
            return new Set(selected);
        }
    } catch {}

    return new Set();
})();
const SELECTED_ROUTES_MUT = writable<Set<string>>(SELECTED_ROUTES_SET);

export const SELECTED_ROUTES: Readable<ReadonlySet<string>> = SELECTED_ROUTES_MUT;

function saveSelectionToStorage(): void {
    try {
        localStorage.setItem(
            SELECTED_ROUTES_STORAGE_KEY,
            JSON.stringify(Array.from(SELECTED_ROUTES_SET)),
        );
    } catch {
        // Don't care if storage is full, what can ya do anyways?
    }
}

export function toggleRouteSelected(routeID: string): void {
    if (!SELECTED_ROUTES_SET.delete(routeID)) {
        SELECTED_ROUTES_SET.add(routeID);
    }
    saveSelectionToStorage();
    SELECTED_ROUTES_MUT.set(SELECTED_ROUTES_SET);
}

export function selectOnlyRoute(routeID: string): void {
    SELECTED_ROUTES_SET.clear();
    SELECTED_ROUTES_SET.add(routeID);
    saveSelectionToStorage();
    SELECTED_ROUTES_MUT.set(SELECTED_ROUTES_SET);
}
