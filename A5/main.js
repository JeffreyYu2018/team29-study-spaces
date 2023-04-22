let final = JSON.parse(localStorage.getItem("finalSpace"));
console.log(final);
// Example
// Address : "\"254 Prospect St\""
// Availability : "1"
// Distance : "1"
// Hours : "12am-12am"
// Name : "Tsai Center"
// Noise : "1"
// "Picture " : "test.jpg\r"
//
// get the iframe with id = "map-iframe"

document.addEventListener("DOMContentLoaded", function() {
    // your code here
    const mapIframe = document.getElementById("map-iframe");
    // format the address to be used in the Google Maps Embed API
    const address = final.Address.replace(/ /g, "+") + ',+New+Haven,+CT'

    // Replace the YOUR_API_KEY with your actual Google Maps Embed API key
    const apiKey = 'AIzaSyC3S3ncQh-Zrn3Cln5pdunkKoUECoAqvA0';

    // Construct the Google Maps Embed URL
    const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${address}`;
    mapIframe.src = mapUrl;
});

// put the address in the addy <p> tag
const addy = document.getElementById("addy");
addy.innerHTML = final.Address.trim().replace(/"/g, "");

// put the hours in the hrs <p> tag
const hrs = document.getElementById("hrs");
hrs.innerHTML = final.Hours;

// TODO-- FINISH THESE AND MAKE HTINGS BASED ON EVERYTHIN


