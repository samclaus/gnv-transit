import { type ActionReturn } from "svelte/action";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css"

export interface LeafletParams {

}

export function leaflet(
    container: HTMLElement,
    params?: LeafletParams,
): ActionReturn<LeafletParams> {
    const map = L.map(container).fitWorld().locate({ setView: true, maxZoom: 16 });

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
    ).addTo(map);

    function onWindowResize(): void {
        map.invalidateSize();
    }

    window.addEventListener("resize", onWindowResize);

    return {
        destroy(): void {
            window.removeEventListener("resize", onWindowResize);
            map.remove();
        },
    };
}