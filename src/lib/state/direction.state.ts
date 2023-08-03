import { getDirectionsForRoute, type DirectionInfo } from "../api";
import { reuseInflightKeyed } from "../async-util";

const DIRECTION_STORAGE_KEY = "BusTime.route-directions";

// Don't use ES6 Map for now because it makes JSON serialization annoying
const ROUTE_DIRECTIONS: Dict<DirectionInfo[]> = function() {
    try {
        const directions = JSON.parse(localStorage.getItem(DIRECTION_STORAGE_KEY)!);

        if (directions && typeof directions === "object") {
            return directions;
        } 
    } catch {
        // Don't care
    }

    return Object.create(null);
}();

export function cachedDirections(routeID: string): DirectionInfo[] {
    return ROUTE_DIRECTIONS[routeID] || [];
}

export const refreshDirections = reuseInflightKeyed(async routeID => {
    const directions = await getDirectionsForRoute(routeID);

    ROUTE_DIRECTIONS[routeID] = directions;

    try {
        localStorage.setItem(DIRECTION_STORAGE_KEY, JSON.stringify(ROUTE_DIRECTIONS));
    } catch {
        // Don't care if storage is full, what can ya do anyways?
    }

    return directions;
});
