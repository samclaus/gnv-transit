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
        }).fitWorld().locate({ setView: true, maxZoom: 16 });

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
        ).addTo(map);

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

<svelte:window on:resize={() => map?.invalidateSize()} />

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
