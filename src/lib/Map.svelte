<script lang="ts" context="module">
    export const MAP_CTX_KEY = Symbol();
</script>

<script lang="ts">
    import { onDestroy, onMount, setContext } from "svelte";
    import * as L from "leaflet-lite";
    import "leaflet-lite/styles";
    import defaultMarkerURL from 'leaflet-lite/assets/marker.svg';

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
        map = new L.Map(mapContainer, new L.SVG({ padding: 2 }), {
            minZoom: 12,
            maxZoom: 17,
            maxBounds: new L.LatLngBounds(
                new L.LatLng(29.76348328222648, -82.09842681884767),
                new L.LatLng(29.520293014753662, -82.59281158447267),
            ),
        }).fitWorld();

        new L.Drag(map, { maxBoundsViscosity: 1 });
        L.enableScrollWheelZoom(map);
        L.enableDoubleClickZoom(map);
        new L.TouchZoom(map);
        new L.BoxZoom(map);
        new L.Keyboard(map);
        new L.TapHold(map);

        // This will get cleaned up when we call map.remove()
        new L.Locator(map).locate({ setView: true, maxZoom: 16 }).on("locationfound", ev => {
            map.addLayer(
                new L.Marker(ev.latlng, L.defaultIcon(defaultMarkerURL)),
            );
        });

        map.addLayer(
            new L.TileLayer(
                "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
                {
                    // TODO: attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 20
                },
            ),
        );

        map.on("click", ev => {
            console.log(ev.latlng);
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
