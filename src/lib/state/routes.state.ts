import { writable, type Readable } from "svelte/store";
import { getRoutes, type RouteInfo } from "../api";
import { reuseInflight } from "../async-util";

const ROUTES_STORAGE_KEY = "BusTime.routes";
const ROUTES_MUT = writable<RouteInfo[]>(function() {
    try {
        const routes = JSON.parse(localStorage.getItem(ROUTES_STORAGE_KEY)!);
        return Array.isArray(routes) ? routes : [];
    } catch {
        return [];
    }
}());

export const ROUTES: Readable<readonly RouteInfo[]> = ROUTES_MUT;

export const refreshRoutes = reuseInflight<void>(async () => {
    const routes = await getRoutes();

    try {
        localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
    } catch {
        // Don't care if storage is full, what can ya do anyways?
    }
    
    ROUTES_MUT.set(routes);
});

refreshRoutes().catch(
    err => {
        console.error("Failed to refresh available routes:", err);
    },
);
