mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12",
  center:list.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9, // starting zoom
});

console.log(list.geometry.coordinates);

const marker = new mapboxgl
.Marker({color:"red"})
.setLngLat(list.geometry.coordinates)
.setPopup(new mapboxgl.Popup({offset:10})
.setHTML(`<h5>${list.location}</h5><p>Exact location will be shared after booking</p>`))
.addTo(map)

