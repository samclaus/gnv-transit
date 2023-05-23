import type { PatternInfo, PatternPointInfo, StopInfo } from "./api";

function identical(v1: any, v2: any): boolean {
    if (typeof v1 !== typeof v2) {
        return false;
    }
    if (typeof v1 !== "object") {
        return v1 === v2;
    }
    for (const key in v1) {
        if (key !== "seq" && key !== "pdist" && !identical(v1[key], v2[key])) {
            return false;
        }
    }
    for (const key in v2) {
        if (key !== "seq" && key !== "pdist" && !identical(v1[key], v2[key])) {
            return false;
        }
    }
    return true;
}

export function checkForStopDiscrepancies(
    routeID: string,
    stops: readonly StopInfo[],
    patterns: readonly PatternInfo[],
): void {
    console.clear();

    const stopsByID = new Map<string, StopInfo>();

    let nDupStops = 0;

    for (const stop of stops) {
        const existing = stopsByID.get(stop.stpid);

        if (existing) {
            ++nDupStops;
            
            if (!identical(existing, stop)) {
                console.error("MISMATCHED DUPLICATE STOP:", { existing, stop });
                return;
            }
        } else {
            stopsByID.set(stop.stpid, stop);
        }
    }

    const pointsByID = new Map<string, PatternPointInfo>();
    const pointsWithoutStops: PatternPointInfo[] = [];

    let nDupPoints = 0;

    for (const pattern of patterns) {
        let seq = -1;
        for (const point of pattern.pt) {
            if (point.seq <= seq) {
                console.warn(`Seq for stop "${point.stpnm}" is ${point.seq}, prev was ${seq}`);
            }
            seq = point.seq;

            if (point.typ === "S") {
                const existing = pointsByID.get(point.stpid!);

                if (existing) {
                    ++nDupPoints;
                    if (!identical(existing, point)) {
                        console.error("MISMATCHED DUPLICATE POINT:", { existing, point });
                        return;
                    }
                    continue;
                }

                pointsByID.set(point.stpid!, point);

                const stop = stopsByID.get(point.stpid!);

                if (!stop) {
                    pointsWithoutStops.push(point);
                } else if (
                    stop.lat !== point.lat ||
                    stop.lon !== point.lon ||
                    stop.stpnm !== point.stpnm
                ) {
                    console.warn(`Mismatched stop/point:`, { stop, point });
                }
            }
        }
    }

    const stopsWithoutPoints: StopInfo[] = [];

    for (const stop of stopsByID.values()) {
        if (!pointsByID.has(stop.stpid)) {
            stopsWithoutPoints.push(stop);
        }
    }

    if (nDupStops > 0) {
        console.log(`${nDupStops} duplicate stop(s)`);
    }
    if (nDupPoints > 0) {
        console.log(
            nDupPoints === pointsByID.size
                ? `Each point mentioned exactly twice`
                : `${nDupPoints} duplicate point(s)`,
        );
    }
    if (pointsWithoutStops.length > 0) {
        console.error("Points without stops:");
        console.table(pointsWithoutStops);
    }
    if (stopsWithoutPoints.length > 0) {
        console.log("Stops without points:");
        console.table(stopsWithoutPoints);
    }

    console.info(`Diagnosis complete for route ${routeID}`);
}