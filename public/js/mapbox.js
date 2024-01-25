/* eslint-disable */

export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoicGFkbWFwcmFzYWQiLCJhIjoiY2xycXFpc2lnMDFsYTJram56NmprcHQ0eCJ9.wfrdGA9JOwKiaxne_2-2Ag';

    const map = new mapboxgl.Map({
        container: 'map', 
        style: 'mapbox://styles/padmaprasad/clrqqucr0003601qv4abm9989', 
        scrollZoom: false
        // center: [-118.1134, 34.11174], 
        // zoom: 4,
        // interactive: false
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc => {
    
        const el = document.createElement('div');
        el.className = 'marker';
    
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);
    
        // Add popup
        new mapboxgl.Popup({
            offset: 30
            })
            .setLngLat(loc.coordinates)
            .setHTML(`<p> Day ${loc.day}: ${loc.description} </p>`)
            .addTo(map);
    
         // Extend map bounds to include location
        bounds.extend(loc.coordinates);
    
    map.fitBounds(bounds, {
        padding: {
                top: 200,
                bottom: 150,
                left: 100,
                right: 100
         }
      });
    });
};

