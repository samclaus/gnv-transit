<script lang="ts">
</script>

<h2 class="sheet-header">
    About GNV Transit
</h2>
<div class="sheet-content">
    <p>
        GNV Transit is intended to be a strict improvement over the
        <a href="https://riderts.app">GNV RideRTS</a> app, which is
        <a href="https://go-rts.com">RTS</a>'s deployment of the generic
        <em>BusTime</em> app made by
        <a href="https://www.cleverdevices.com/">Clever Devices</a>. GNV
        Transit still uses the BusTime API hosted on RTS's servers in
        Gainesville.
    </p>
    <p>
        The app is a work-in-progress and I welcome criticism or other
        feedback <a href="mailto:hello@samcla.us">via email</a>. Please be
        mindful that I am one person with limited time in the day, and no
        one is paying me to make the app.
    </p>
    <h3>Goals</h3>
    <ol>
        <li>
            <strong>Exceptional performance:</strong> the application should
            load quickly and not stutter as you use it.
        </li>
        <li>
            <strong>Intuitive:</strong> no features should be added which bloat
            the application or otherwise punish people who don't want to use them.
        </li>
        <li>
            <strong>Low data usage:</strong> the app uses modern browser
            capabilities to cache the application code and map data on your
            device. Map data for all of Gainesville (at several zoom levels)
            consumes maybe 100MB of storage space, which is not very much to store
            on your device, but could rip through your 5GB data plan if it wasn't
            cached and you used the app regularly.
        </li>
        <li>
            <strong>Public domain:</strong> I plan to eventually not only open-source
            this application, but to license it to the public domain so people can use
            the code however they please free of charge with no attribution required.
            First, I need to build my own reputation so I can find stable work. Ya feel?
        </li>
    </ol>
    <h3>Built Using</h3>
    <ul>
        <li>
            Map data © OpenStreetMap contributors. If you see something wrong
            with the map, such as an incorrectly aligned street,
            <a href="https://wiki.openstreetmap.org/wiki/Beginners%27_guide">
                you can contribute to OpenStreetMap
            </a>.
        </li>
        <li>
            Map <em>tiles</em> courtesy of <a href="https://carto.com/">CARTO</a>.
            Their servers pull information from OpenStreetMap and produce the sleek
            images you see displayed on this page.
        </li>
        <li>
            <a href="https://github.com/samclaus/leaflet-lite">My own derivative</a>
            of <a href="https://leafletjs.com">Leaflet</a>, a popular JavaScript
            widget library for rendering maps and handling interaction with them.
        </li>
        <li>
            <a href="https://svelte.dev">Svelte</a>, a UI framework/compiler that makes
            writing performant JavaScript applications much easier.
        </li>
    </ul>
    <p class="footer">
        Made in Gainesville by <a href="https://samcla.us">Sam Claus</a>. Logo designed
        by <a href="https://kaleya.li">Kaley Ali</a>.
    </p>
</div>

<style>
    .footer {
        margin-top: 3em;

        text-align: center;
    }
</style>
