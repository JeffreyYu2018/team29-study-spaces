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

let noisenum = final.Noise;
let availnum = final.Availability;
let distnum = final.Distance;

// while noisenum isn't zero, add a star to the noise rating
while (noisenum > 0) {
    let noise = document.getElementById("noise");
    noise.innerHTML = noise.innerHTML + "★";
}
while (availnum > 0) {
    let avail = document.getElementById("avail");
    avail.innerHTML = avail.innerHTML + "★";
}
while (distnum > 0) {
    let dist = document.getElementById("dist");
    dist.innerHTML = dist.innerHTML + "★";
}

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

// find p.addy and put the address in it
let addy = document.getElementById("addy");
console.log(addy)
console.log(final.Address);
// replace the " with nothing
final.Address = final.Address.replace(/"/g, "");
addy.innerHTML = addy.innerHTML + final.Address;

let hrs = document.getElementById("hrs");
hrs.innerHTML = hrs.innerHTML + final.Hours;

// h1.name
let name = document.getElementById("name");
name.innerHTML = name.innerHTML + final.Name;

// when you click the button with id = "goback" it brings you to the main page
let goback = document.getElementById("goback");
goback.addEventListener("click", function() {
    // it goes back a folder in the directory
    window.location.href = "../index.html";
});

let pic = document.getElementById("pic");
let picaddy = "../assets/" + final.Picture.trim();
console.log(picaddy);
pic.src = picaddy;
