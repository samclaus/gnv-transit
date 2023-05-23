
const RTS_API_KEY = import.meta.env.VITE_RTS_API_KEY;

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
    let url = `http://localhost:8080/https://riderts.app/bustime/api/v3/${path}?key=${RTS_API_KEY}&format=json`;

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
    const { vehicle: vehicles } = await getBusTimeResponse<GetVehiclesResponse>(url);
    return Array.isArray(vehicles) ? vehicles : []; // ugh
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

/**
 * A prediction is an estimate of when a particular vehicle will arrive at or
 * depart from a particular stop.
 */
export interface PredictionInfo {
    /** Date/time (local) the prediction was GENERATED. */
    tmstmp: string;
    /**
     * Type of prediction: "A" for arrival, "D" for departure. Departure predictions
     * are usually only available at the endpoints of a route, and other spots where
     * vehicles are scheduled to depart at an exact time.
     */
    typ: "A" | "D";
    /** ID of the stop this prediction was generated for. */
    stpid: string;
    /** Human-readable name of the stop this prediction was generated for. */
    stpnm: string;
    /** ID of the vehicle this prediction was generated for. */
    vid: number;
    /**
     * "Distance to SToP": the linear distance, in feet, that the vehicle has left
     * before it reaches the stop.
     */
    dstp: number;
    /** ID of the route the vehicle is traveling. */
    rt: string;
    /** Language-specific designator for the route the vehicle is traveling. */
    rtdd: string;
    /** ID of the direction the vehicle is traveling. */
    rtdir: string;
    /** (TODO: Name?) of the final destination the vehicle is traveling to. */
    des: string;
    /** Predicted date/time (local) of the vehicle's arrival/departure. */
    prdtm: string;
    /** Is the vehicle delayed? */
    dly: boolean;
    /** The dynamic action type affecting this prediction. TODO: wtf are dynamic action types? */
    dyn: number;
    /**
     * TA’s version of the scheduled block identifier for the work currently being
     * performed by the vehicle.
     */
    tablockid: string;
    /**
     * TA’s version of the scheduled trip identifier for the vehicle’s current trip.
     */
    tatripid: string;
    /** Trip ID defined by the TA scheduling system. */
    origtatripno: string;
    /**
     * Remaining minutes before the vehicle arrives/departs. This is just useless and
     * redundant compared to the predicted timestamp for arrival/departure.
     * 
     * Clients should really just compute the countdown locally.
     */
    prdctdn: number;
    /** The zone name if the vehicle has entered a defined zones, otherwise blank. */
    zone: string;
    /**
     * If this prediction is the last arrival (for this route) before a service gap,
     * this represents the number of minutes until the next scheduled bus arrival
     * (from the prediction time).
     * 
     * This only appears if the Transit Authority has the service gap feature enabled.
     * If nbus would have a value less than the configured minimum gap of time (default
     * 120 minutes), the element is empty. If nBus is “-1”, then this prediction is the
     * last bus of the day for this route.
     */
    nbus?: string;
    /**
     * The current passenger load of the vehicle this prediction is for. Cut-offs for
     * the different ratios are configured per BusTime deployment.
     */
    psgld: PassengerLoad;
    /**
     * GTFS stop sequence of the stop for which this prediction was generated. Only
     * included if the BusTime property “developer.api.include.gtfsseq” is true.
     */
    gtfsseq?: number;
    /**
     * Contains the time (in seconds past midnight) of the scheduled start of the trip
     * that the vehicle is currently performing.
     */
    stst?: number;
    /**
     * Contains the date (in “yyyy-mm-dd” format) of the scheduled start of the trip
     * that the vehicle is currently performing.
     */
    stsd?: string;
    /**
     * An integer code representing the flag-stop information for the prediction.
     * TODO: maybe create a TypeScript enum for this.
     *
     *  - -1 = UNDEFINED (no flag-stop information available)
     *  - 0 = NORMAL (normal stop)
     *  - 1 = PICKUP_AND_DISCHARGE (Flag stop for both pickup and discharge)
     *  - 2 = ONLY_DISCHARGE (Flag stop for discharge only)
     */
    flagstop: -1 | 0 | 1;
}

interface GetPredictionsResponse {
    prd: PredictionInfo[];
}

/**
 * Get predictions for upcoming arrivals/departures of a set of vehicles.
 */
export async function getPredictionsForVehicles(
    vehicleIDs: readonly string[],
    timeResolution: "m" | "s" = "m",
    maxPredictions = vehicleIDs.length * 3,
): Promise<PredictionInfo[]> {
    const url = _makeFullURL("getpredictions", {
        vid: vehicleIDs.join(","),
        tmres: timeResolution,
        top: maxPredictions,
    });
    return (await getBusTimeResponse<GetPredictionsResponse>(url)).prd;
}

/**
 * Get predictions for upcoming arrivals/departures at a set of stops. Optionally,
 * pass a set of route IDs to only show predictions pertaining to those routes.
 */
export async function getPredictionsForStops(
    stopIDs: readonly string[],
    routeIDs?: readonly string[],
    timeResolution: "m" | "s" = "m",
    maxPredictions?: number,
): Promise<PredictionInfo[]> {
    const params: Dict<string | number> = {
        stpid: stopIDs.join(","),
        tmres: timeResolution,
    };

    if (routeIDs) {
        params.rt = routeIDs.join(",");
    }
    if (typeof maxPredictions === "number") {
        params.top = maxPredictions;
    }

    const url = _makeFullURL("getpredictions", params);
    return (await getBusTimeResponse<GetPredictionsResponse>(url)).prd;
}

// TODO: service bulletins

// TODO: locale list

// TODO: RTPI data feeds

export const enum DetourState {
    Canceled,
    Active,
}

/** Describes a single direction of a single route that is affected by a detour. */
export interface DetouredRouteDirectionInfo {
    /** ID of the affected route. */
    rt: string;
    /** ID of the affected direction along the route. */
    dir: string;
}

export interface DetourInfo {
    /** Unique ID for this detour. */
    id: string;
    /** Current version of the detour. Only latest version is returned from API. */
    ver: number;
    /** Current state of the detour. */
    st: DetourState;
    /** Human-readable description of the detour. */
    desc: string;
    /** Affected route directions. */
    rtdirs: DetouredRouteDirectionInfo[];
    /** Start date/time for this detour. */
    startdt: string;
    /** End date/time for this detour. */
    enddt: string;
    /** The feed this detour came from, if the system has multiple RTPI feeds. */
    rtpidatafeed?: string;
}

/**
 * Get the detours (if any) for a particular route. Optionally, pass a
 * direction ID to only query detours for a particular direction along
 * the route.
 */
export async function getDetours(
    routeID: string,
    directionID?: string,
): Promise<DetourInfo[]> {
    interface GetDetoursResponse {
        dtrs: DetourInfo[];
    }

    const params: Dict<string> = {
        rt: routeID,
    };

    if (typeof directionID === "string") {
        params.rtdir = directionID;
    }

    const url = _makeFullURL("getdetours", params);
    return (await getBusTimeResponse<GetDetoursResponse>(url)).dtrs;
}

// TODO: agencies
