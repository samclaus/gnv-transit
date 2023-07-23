<script lang="ts" context="module">
    export const MAP_CTX_KEY = Symbol();
</script>

<script lang="ts">
    import { onDestroy, onMount, setContext } from "svelte";
    import * as L from "leaflet";
    import "leaflet/dist/leaflet.css";

    /**
     * Space-delimited list of classes to add to the map container element.
     */
    let className = "";
    export { className as class };

    // This will not be assigned a value until Svelte calls onMount()...
    let mapContainer: HTMLDivElement;
    // ...which will then allow us to initialize the map instance.
    let map: L.Map;

    // We cannot use the value of the map variable directly because it will not be
    // created until onMount() is called, which will happen immediately after this
    // code runs.
    setContext(MAP_CTX_KEY, () => map);

    onMount((): void => {
        map = L.map(mapContainer, {
            minZoom: 12,
            maxZoom: 17,
            maxBounds: [
                [29.76348328222648, -82.09842681884767],
                [29.520293014753662, -82.59281158447267],
            ],
            maxBoundsViscosity: 1,
            renderer: L.svg({ padding: 2 }),
        }).fitWorld().locate({ setView: true, maxZoom: 16 });

        map.addLayer(
            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 20
                },
            ),
        );

        // This will get cleaned up when we call map.remove()
        map.on("locationfound", ev => {
            L.circleMarker(ev.latlng, {
                radius: ev.accuracy,
                color: "#1E88E5",
            }).addTo(map);
        });
    });

    onDestroy((): void => {
        map?.remove();
    });
</script>

<div class="map {className}" bind:this={mapContainer}>
    {#if map}
		<slot />
	{/if}
</div>

<style>
    .map {
        isolation: isolate;
    }
</style>
