import type { CastAwayReadonly } from "./type-util";

/**
 * A deferred promise, which is basically just an "unwrapped" promise where
 * you have easy access to not only the promise, but the resolve/reject
 * callbacks which mutate the promise. This can be very useful in situations
 * where you need to mix promise chaining and imperative, event-based code.
 * 
 * A concrete example is a websocket connection to the server. The connection
 * class has a method to make a request to the server which returns a promise
 * that will resolve if the server sends back a success reply, or reject with
 * some sort of error if, say, the internet cuts out or the server sends back
 * an error. Internally, this method will:
 * 
 * 1. Generate a unique ID for the request (using a simple integer counter that gets incremented with each request made)
 * 2. Create a deferred promise and register it in a map (using the integer request ID as the key)
 * 3. Send the request data "down the wire" (might go over WiFi, etc.) to the server
 * 4. Return the deferred promise to whatever code wanted to send a request (i.e., called the method)
 * 5. When the server EVENTUALLY sends back a reply (success OR error, good OR bad) for the same request ID, look up the deferred promise and resolve/reject
 * 6. Additional machinery is needed to reject the promise if, say, 20 seconds pass and the server does not send back a reply for the request ID, but that is out of the scope of this comment
 */
export class Deferred<T = void> {

    readonly promise: Promise<T>;
    readonly resolve!: (value: T | PromiseLike<T>) => void;
    readonly reject!: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>(
            (resolve, reject) => {
                (this as CastAwayReadonly<this>).resolve = resolve;
                (this as CastAwayReadonly<this>).reject = reject;
            },
        );
    }

}

/**
 * Wrap a function which returns a promise so that spam calling the WRAPPED
 * function will reuse the current promise if one is currently in-flight.
 */
 export function reuseInflight<T>(execute: () => Promise<T>): () => Promise<T> {
    let inflight: Promise<T> | undefined;

    return function (): Promise<T> {
        inflight ??= execute().finally(
            () => {
                inflight = undefined;
            },
        );
        return inflight;
    }
}

/**
 * Wrap a function which returns a promise so that spam calling the WRAPPED
 * function will reuse the current promise if one is currently in-flight.
 */
 export function reuseInflightKeyed<T>(execute: (key: string) => Promise<T>): (key: string) => Promise<T> {
    const inflightByKey = new Map<string, Promise<T>>();

    return function (key: string): Promise<T> {
        let inflight = inflightByKey.get(key);

        if (!inflight) {
            inflight = execute(key).finally(
                () => {
                    inflightByKey.delete(key)
                },
            );
            inflightByKey.set(key, inflight);
        }
        
        return inflight;
    }
}

/**
 * Wrap a function which returns a promise so that the first time the inner function returns a resolved
 * promise, the result will be cached and the inner function will never be executed again. Additonally,
 * this has the same semantics as "reuseInflight", meaning spam calling the wrapper function will never
 * spawn multiple promises from the inner function at a time.
 */
export function once<T>(execute: () => Promise<T>): () => Promise<T> {
    execute = reuseInflight(execute);

    let value: T | undefined;

    return async function (): Promise<T> {
        // Fucking clean 👌
        return value ??= await execute().then<T>(
            result => {
                execute = undefined as any; // let it be garbage collected
                return result;
            },
        );
    }
}

export async function waitForAllAndPropagateLastError(promises: Promise<unknown>[]): Promise<void> {
    let failed = false;
    let mostRecentErr: unknown;

    await Promise.all(
        promises.map(
            promise => promise.catch(
                err => {
                    failed = true; // be explicit in case the error is undefined or something
                    mostRecentErr = err;
                },
            ),
        ),
    );

    if (failed) {
        throw mostRecentErr;
    }
}
