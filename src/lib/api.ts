
const RTS_API_KEY = "FiTzUhjBRi8eUhqzZvvBBVemX";

interface Dict<V> {
    [key: string]: V;
}

function _makeFullURL(
    /**
     * The path relative to the API base URL. Must not begin with a slash.
     */
    path: string,
    /**
     * Query params; please note that these are appended as-is, and should be URL-friendly
     * strings.
     */
    params: Readonly<Dict<boolean | number | string>>,
): string {
    let url = `https://riderts.app/bustime/api/v3/${path}?key=${RTS_API_KEY}&format=json`;

    for (const [param, value] of Object.entries(params)) {
        url += `&${param}=${value}`;
    }

    return url;
}

const _getServerTimeURL = _makeFullURL("gettime", { unixTime: true });

async function getBusTimeResponse<T extends object>(url: string): Promise<T> {
    const res = await fetch(url);

    if (!res.ok) {
        throw res;
    }

    // TODO: need proper validation and error handling at every level for this function--no matter
    // what goes wrong (no connection, malformed response without "bustime-response" field, invalid
    // JSON, etc. etc.), the user should see extremely clear feedback so they know what to tell me

    const { "bustime-response": data } = await res.json();

    if (typeof data.error === "string") {
        throw new Error(data.error)
    }

    return data;
}

export async function getServerTimeUNIX(): Promise<number> {
    return (await getBusTimeResponse<{ tm: number; }>(_getServerTimeURL)).tm;
}

export const enum TransportationMode {
    None,
    Bus,
    Ferry,
    Rail,
    PeopleMover,
}

export const enum PassengerLoad {
    Unknown = "N/A",
    Empty = "EMPTY",
    HalfEmpty = "HALF_EMPTY",
    Full = "FULL",
}

export const enum StopStatus {
    StoppedAt,
    IncomingAt,
    InTransitTo,
}

export interface VehicleInfo {
    /** Alphanumeric vehicle ID. */
    vid: string;
    /** Name of the data feed the vehicle came from if server has multiple data feeds. */
    rtpidatafeed?: string;
    /** Time the vehicle last updated its position, in the format "YYYYMMDD HH:MM" (24-hour time). */
    tmstmp: string;
    /** Latitude position in decimal degrees (WGS 84). */
    lat: number;
    /** Longitude position in decimal degrees (WGS 84). */
    lon: number;
    /** Heading direction of the vehicle in degrees. 0° is North, 90° is East, 180° is South, and 270° is West. */
    hdg: number;
    /** Pattern ID of the trip the vehicle is currently executing. */
    pid: number;
    /** Number of feet (linear) the vehicle has traveled into its current pattern. */
    pdist: number;
    /** ID the route the vehicle is currently executing. */
    rt: string;
    /** Name of the vehicle's destination. */
    des: string;
    /** True if the vehicle is delayed, i.e., has sat stationary for more than a configured time limit. */
    dly?: boolean;
    /** Speed of the vehicle in MPH. */
    spd: number;
    /** TA’s version of the scheduled block identifier for the work currently being performed by the vehicle. */
    tablockid: string;
    /** TA’s version of the scheduled trip identifier for the vehicle’s current trip. */
    tatripid: string;
    /** Trip ID defined by the TA scheduling system. */
    origtatripno: string;
    /** Zone name if the vehicle has entered a defined zone, otherwise blank. */
    zone: string;
    /** Type of vehicle. */
    mode: TransportationMode;
    /**
     * Current ratio of passengers to vehicle capacity. The cut-offs for the different ratio values
     * are configured per BusTime deployment. Would be much better if they'd just give a decimal
     * ratio in range [0, 1]!
     */
    psgld: PassengerLoad;
    /**
     * Contains the timepoint ID for the current stop for this vehicle. Only included if the TA
     * supports GTFS stop status in BusTime.
     */
    timepointid?: number;
    /**
     * Contains the sequence number of the current stop for this vehicle. Only included if the TA
     * supports GTFS stop status in BusTime.
     */
    sequence?: number;
    /**
     * Integer representing the current stop status of this vehicle per GTFS Realtime’s
     * VehicleStopStatus. Only included if the TA supports GTFS stop status in BusTime.
     */
    stopstatus?: StopStatus;
    /**
     * Contains the stop ID for the current stop for this vehicle. Only included if the TA supports
     * GTFS stop status in BusTime.
     */
    stopid?: string;
    /**
     * Contains the GTFS stop sequence for the current stop for this vehicle. Only included if the TA
     * supports GTFS stop status in BusTime and if the BusTime property “developer.api.include.gtfsseq”
     * is true.
     */
    gtfsseq?: number;
    /**
     * Contains the scheduled start time (in seconds past midnight) of the trip that the vehicle is
     * running on.
     */
    stst?: number;
    /**
     * Contains the scheduled start date (in “yyyy-mm-dd” format) of the trip that the vehicle is running
     * on.
     */
    stsd?: string;
}

interface GetVehiclesResponse {
    /** Yes, it makes no sense that they named the field like a singular vehicle. */
    vehicle: VehicleInfo[];
}

/**
 * Given a set of vehicle IDs, returns the information for those vehicles, such as their
 * current position, destination, and whether they are delayed.
 */
export async function getVehicles(
    vehicleIDs: readonly string[],
    timeResolution: "m" | "s" = "m",
): Promise<VehicleInfo[]> {
    const url = _makeFullURL("getvehicles", {
        vid: vehicleIDs.join(","),
        tmres: timeResolution,
    });
    return (await getBusTimeResponse<GetVehiclesResponse>(url)).vehicle;
}

/**
 * Given a set of route IDs, returns the information for the vehicles traveling those
 * routes, such as their current position, destination, and whether they are delayed.
 */
export async function getVehiclesByRoute(
    routeIDs: readonly string[],
    timeResolution: "m" | "s" = "m",
): Promise<VehicleInfo[]> {
    const url = _makeFullURL("getvehicles", {
        rt: routeIDs.join(","),
        tmres: timeResolution,
    });
    return (await getBusTimeResponse<GetVehiclesResponse>(url)).vehicle;
}

export interface RouteInfo {
    /** Alphanumeric route ID. E.g. "8". */
    rt: string;
    /** Human-readable name for the route. E.g. "Shands to N Walmart Supercenter". */
    rtnm: string;
    /** Default CSS hex color for the route on the map. E.g. "#ffffff". */
    rtclr: string;
    /** Language-specific route designator meant for display. */
    rtdd: string;
    /**
     * The name of the data feed that the route was retrieved from, if this is a
     * multi-feed system.
     */
    rtpidatafeed?: string;
}

const _getRoutesURL = _makeFullURL("getroutes", {});

/**
 * Returns information for every transit route in the system.
 */
export async function getRoutes(): Promise<RouteInfo[]> {
    interface GetRoutesResponse {
        routes: RouteInfo[];
    }

    return (await getBusTimeResponse<GetRoutesResponse>(_getRoutesURL)).routes;
}

export interface DirectionInfo {
    /** Direction ID that should be passed to other requests. */
    id: string;
    /** Human-readable, locale-dependent name for the direction. */
    name: string;
}

/**
 * Get the directions that vehicles travel along a route. Typically there will be exactly
 * 2 directions, generically known as "inbound" and "outbound". The directions will likely
 * have localized names such as "East towards Rosa Parks" and "West towards Santa Fe".
 */
export async function getDirectionsForRoute(routeID: string): Promise<DirectionInfo[]> {
    interface GetDirectionsResponse {
        directions: DirectionInfo[];
    }

    const url = _makeFullURL("getdirections", { rt: routeID });
    return (await getBusTimeResponse<GetDirectionsResponse>(url)).directions;
}

export interface StopInfo {
    /** Unique ID for the stop. */
    stpid: string;
    /** Human-readable name for the stop. */
    stpnm: string;
    /**  Latitude position of the stop in decimal degrees (WGS 84). */
    lat: number;
    /**  Longitude position of the stop in decimal degrees (WGS 84). */
    lon: number;
    /** A list of detour IDs which add (temporarily service) this stop. */
    dtradd?: number[];
    /** A list of detour IDs which remove (detour around) this stop. */
    dtrrem?: number[];
    /**
     * Contains the GTFS stop sequence of the stop. Only included if the BusTime
     * property “developer.api.include.gtfsseq” is true and route & direction are
     * supplied
     */
    gtfsseq?: number;
    /** Is the stop ADA Accessible? Only included if supplied by the TA. */
    ada?: boolean;
}

interface GetStopsResponse {
    stops: StopInfo[];
}

/**
 * Given a set of stop IDs, returns the information for those stops, such as their
 * position, any detours that temporarily service them, and whether they are ADA
 * accessible.
 */
export async function getStops(stopIDs: readonly string[]): Promise<StopInfo[]> {
    const url = _makeFullURL("getstops", { stpid: stopIDs.join(",") });
    return (await getBusTimeResponse<GetStopsResponse>(url)).stops;
}

/**
 * Given a route and a direction, returns the information for the stops along that
 * route, such as their position, any detours that temporarily service them, and
 * whether they are ADA accessible.
 */
export async function getStopsForRoute(
    routeID: string,
    directionID: string,
): Promise<StopInfo[]> {
    const url = _makeFullURL("getstops", {
        rt: routeID,
        dir: directionID,
    });
    return (await getBusTimeResponse<GetStopsResponse>(url)).stops;
}

export interface PatternInfo {
    /** Unique ID for the pattern. */
    pid: number;
    /** Length of the pattern in feet. */
    ln: number;
    /**
     * ID of the direction this pattern belongs to. Typically, each route
     * will have exactly 2 directions.
     */
    rtdir: string;
    /**
     * Set of geo-positional points (including stops) that when connected
     * define the pattern.
     */
    pt: PatternPointInfo[];
    /** The ID of the detour this pattern was created by, if applicable. */
    dtrid?: string;
    /**
     * If this pattern was created by a detour, contains points for the
     * original/replaced pattern. Useful for, say, drawing a dashed line
     * on the map.  
     */
    dtrpt?: PatternPointInfo[];
}

export interface PatternPointInfo {
    /**
     * Position of this point in the overall pattern. This is pretty useless
     * assuming the points are always ordered correctly in the JSON array.
     */
    seq: number;
    /**
     * Type of the point. "S" means it is a proper bus stop, "W" means it is a
     * waypoint. Waypoints are just basic points necessary to draw the pattern
     * on a map. They have no meaning beyond that.
     */
    typ: "S" | "W";
    /** The ID of the stop this point corresponds to, if it is a stop. */
    stpid?: string;
    /** The name of the stop this point corresponds to, if it is a stop. */
    stpnm?: string;
    /**
     * The linear distance of this point (in feet) into the requested pattern,
     * if this point is a stop.
     */
    pdist?: number;
    /** Latitude position of the point in decimal degrees (WGS 84). */
    lat: number;
    /** Longitude position of the point in decimal degrees (WGS 84). */
    lon: number;
}

interface GetPatternsResponse {
    ptr: PatternInfo[];
}

/**
 * Given a set of pattern IDs, returns info for those patterns.
 */
export async function getPatterns(patternIDs: readonly string[]): Promise<PatternInfo[]> {
    const url = _makeFullURL("getpatterns", { pid: patternIDs.join(",") });
    return (await getBusTimeResponse<GetPatternsResponse>(url)).ptr;
}

/**
 * Given a route, returns all active patterns that define that route on a map.
 * 
 * The set of active patterns returned includes: one or more patterns marked as
 * “default” patterns for the specified route and all patterns that are currently
 * being executed by at least one vehicle on the specified route.
 */
export async function getPatternsForRoute(
    routeID: string,
): Promise<PatternInfo[]> {
    const url = _makeFullURL("getpatterns", { rt: routeID });
    return (await getBusTimeResponse<GetPatternsResponse>(url)).ptr;
}
