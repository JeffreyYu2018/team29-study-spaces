// Set the address
const address = "15+High+St,+New+Haven,+CT";

// Replace the YOUR_API_KEY with your actual Google Maps Embed API key
const apiKey = "AIzaSyC3S3ncQh-Zrn3Cln5pdunkKoUECoAqvA0";

// Construct the Google Maps Embed URL
const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${address}`;

// Update the iframe src attribute
document.getElementById("map-iframe").src = mapUrl;
