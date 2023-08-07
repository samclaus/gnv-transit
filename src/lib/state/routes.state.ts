import { writable, type Readable } from "svelte/store";
import { getRoutes, type RouteInfo } from "../api";
import { reuseInflight } from "../async-util";

const ROUTES_STORAGE_KEY = "BusTime.routes";
const _ROUTES_BY_ID = new Map<string, RouteInfo>();
const ROUTES_MUT = writable<RouteInfo[]>(function() {
    try {
        const routes = JSON.parse(localStorage.getItem(ROUTES_STORAGE_KEY)!) as RouteInfo[];

        if (Array.isArray(routes)) {
            for (const route of routes) {
                _ROUTES_BY_ID.set(route.rt, route);
            }

            return routes;
        }
    } catch {
        // We can't really do anything about local storage reads failing
    }
    return [];
}());

export const ROUTES: Readable<readonly RouteInfo[]> = ROUTES_MUT;
export const ROUTES_BY_ID: ReadonlyMap<string, RouteInfo> = _ROUTES_BY_ID;

export const refreshRoutes = reuseInflight<void>(async () => {
    const routes = await getRoutes();

    try {
        localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
    } catch {
        // Don't care if storage is full, what can ya do anyways?
    }
    
    _ROUTES_BY_ID.clear();

    for (const route of routes) {
        _ROUTES_BY_ID.set(route.rt, route);
    }

    ROUTES_MUT.set(routes);
});

refreshRoutes().catch(
    err => {
        console.error("Failed to refresh available routes:", err);
    },
);
