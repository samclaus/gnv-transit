import RBush from "rbush";
import { writable } from "svelte/store";
import { getStopsForRoute, type StopInfo } from "../api";
import { flatten } from "../array-util";
import { reuseInflightKeyed } from "../async-util";
import knn from "../rbush-knn";
import { cachedDirections, refreshDirections } from "./direction.state";
import { SELECTED_ROUTES, SELECTED_ROUTES_SET } from "./route-selection.state";

const STOP_STORAGE_KEY = "BusTime.stops";

// Don't use ES6 Map for now because it makes JSON serialization annoying
const STOPS: Dict<StopInfo> = function() {
    try {
        const stops = JSON.parse(localStorage.getItem(STOP_STORAGE_KEY)!);

        if (stops && typeof stops === "object") {
            return stops;
        } 
    } catch {
        // Don't care
    }

    return Object.create(null);
}();
export const STOPS_BY_ROUTE = new Map<string, string[]>();
export const STOPS_BY_ROUTE$ = writable(STOPS_BY_ROUTE);

export const VISIBLE_STOPS = new Set<string>();

function recomputeVisibleStops(): void {
    VISIBLE_STOPS.clear();

    for (const routeID of SELECTED_ROUTES_SET) {
        const stopIDs = STOPS_BY_ROUTE.get(routeID);

        if (stopIDs) {
            for (const stopID of stopIDs) {
                VISIBLE_STOPS.add(stopID);
            }
        }
    }
}


SELECTED_ROUTES.subscribe(recomputeVisibleStops);
STOPS_BY_ROUTE$.subscribe(recomputeVisibleStops);

interface StopIndexItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    stopID: string;
}

function stopBounds(stop: StopInfo): StopIndexItem {
    return {
        minX: stop.lon,
        minY: stop.lat,
        maxX: stop.lon,
        maxY: stop.lat,
        stopID: stop.stpid,
    };
}

const STOP_SPATIAL_INDEX = new RBush<StopIndexItem>().load(
    Object.values(STOPS).map(stopBounds),
);

export function stopsNear(lng: number, lat: number, maxStops: number): StopInfo[] {
    const stops: StopInfo[] = [];

    for (const { stopID } of knn<StopIndexItem>(
        STOP_SPATIAL_INDEX,
        lng,
        lat,
        maxStops,
        item => VISIBLE_STOPS.has(item.stopID),
    )) {
        const stop = STOPS[stopID];

        if (stop) {
            stops.push(stop);
        }
    }

    return stops;
}

export const refreshStops = reuseInflightKeyed<StopInfo[]>(async routeID => {
    const byDirection: Dict<Promise<StopInfo[]>> = Object.create(null);

    for (const dir of cachedDirections(routeID)) {
        byDirection[dir.id] = getStopsForRoute(routeID, dir.id);
    }

    try {
        for (const dir of await refreshDirections(routeID)) {
            byDirection[dir.id] ||= getStopsForRoute(routeID, dir.id);
        }
    } catch (dirErr) {
        // TODO
        console.error(`Failed to refresh directions for ${routeID}:`, dirErr);
    }

    const stops = flatten(
        await Promise.all(
            Object.values(byDirection),
        ),
    );

    const idSet = new Set<string>();

    for (const stop of stops) {
        idSet.add(stop.stpid);

        const old = STOPS[stop.stpid];

        STOPS[stop.stpid] = stop;

        if (
            !old ||
            (old.lon !== stop.lon || old.lat !== stop.lat)
        ) {
            if (old) {
                STOP_SPATIAL_INDEX.remove(stopBounds(old), (a, b) => a.stopID === b.stopID);
            }
            
            STOP_SPATIAL_INDEX.insert(stopBounds(stop));
        }
    }

    STOPS_BY_ROUTE.set(routeID, [...idSet]);
    STOPS_BY_ROUTE$.set(STOPS_BY_ROUTE);

    try {
        localStorage.setItem(STOP_STORAGE_KEY, JSON.stringify(STOPS));
    } catch {
        // Don't care if storage is full, what can ya do anyways?
    }

    return stops;
});