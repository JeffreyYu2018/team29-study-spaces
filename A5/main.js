let final = JSON.parse(localStorage.getItem("ideal"));
console.log(final);

// Set the address
const address = "15+High+St,+New+Haven,+CT";

// Replace the YOUR_API_KEY with your actual Google Maps Embed API key
const apiKey = YOUR_API_KEY;

// Construct the Google Maps Embed URL
const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${address}`;

// Update the iframe src attribute
document.getElementById("map-iframe").src = mapUrl;
