const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYXNob2trdW1hcmthcnJpIiwiYSI6ImNtNW45eTk5dDA3bjcycXI0NGw1dDE3a3UifQ.WGthlWARGmAPnZdgW7GBtg';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/ashokkumarkarri/cm5nu3wk000e901qyfsx50do3', // style URL
  scrollZoom: false,
  // center: [-115.19767285137631, 36.16480965104903], // starting position [lng, lat]
  // zoom: 10, // starting zoom
  // interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  //Create marker
  const el = document.createElement('div');
  el.className = 'marker'; //it was already written in css file

  //Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates) //cordiantes is an array of lng and lat
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  //extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 200,
    right: 200,
  },
});
