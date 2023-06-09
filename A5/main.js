// Jeff's CODE BELOW
// Adapted from https://p5js.org/examples/interaction-snake-game.html
// Code for connecting to Kinect
var host = "cpsc484-03.yale.internal:8888";
// var host = "localhost:4444";
$(document).ready(function() {
  frames.start();
  twod.start();
});

let body_id

var frames = {
  socket: null,

  start: function() {
    var url = "ws://" + host + "/frames";
    frames.socket = new WebSocket(url);
    frames.socket.onmessage = function (event) {
      frames.get_left_wrist_command(JSON.parse(event.data));
    }
  },

  get_left_wrist_command: function (frame) {
    if (frame.people === undefined || frame.people.length == 0) {
      console.log("no people in frame")
    } else {
      if (body_id === undefined) {  // no body currently selected
        // grab body_id from person with lowest z_pos value
        let min_z_pos = Infinity
        let body_id_index
        for (let b = 0; b < frame.people.length; b++) {
          if (frame.people[b].joints[7].position.z < min_z_pos) {
            min_z_pos = frame.people[b].joints[7].position.z
            body_id = frame.people[b].body_id
            body_id_index = b
          }
        }
        var pelvis_x = frame.people[body_id_index].joints[0].position.x;
        var pelvis_y = frame.people[body_id_index].joints[0].position.y;
        var left_wrist_x = (frame.people[body_id_index].joints[7].position.x - pelvis_x) * -1;
        var left_wrist_y = (frame.people[body_id_index].joints[7].position.y - pelvis_y) * -1;
  
        cursor_x = (((1.5*left_wrist_x) + windowWidth/2) + cursor_x)/2
        cursor_y = ((windowHeight - (1.5*left_wrist_y)) + cursor_y) / 2

      } else {
        // check if the body_id is still there
        // identify the person with the body id
        let body_id_index = undefined
        for (let b = 0; b < frame.people.length; b++) {
          if (frame.people[b].body_id === body_id) {
            body_id = frame.people[b].body_id
            body_id_index = b
            break;
          }
        }
        // is the person still there? if not, reset the loop and exist
        if (body_id_index === undefined) {
          body_id = undefined
        } else {  // otherwise, update the cursor location
          var pelvis_x = frame.people[body_id_index].joints[0].position.x;
          var pelvis_y = frame.people[body_id_index].joints[0].position.y;
          var left_wrist_x = (frame.people[body_id_index].joints[7].position.x - pelvis_x) * -1;
          var left_wrist_y = (frame.people[body_id_index].joints[7].position.y - pelvis_y) * -1;

          cursor_x = (((1.5*left_wrist_x) + windowWidth/2) + cursor_x)/2
          cursor_y = ((windowHeight - (1.5*left_wrist_y)) + cursor_y) / 2
        }
      }
    }
  }
};

var twod = {
  socket: null,

  start: function() {
    var url = "ws://" + host + "/twod";
    twod.socket = new WebSocket(url);
    twod.socket.onmessage = function(event) {
      twod.show(JSON.parse(event.data));
    }
  },

  show: function(twod) {
    $('.twod').attr("src", 'data:image/pnjpegg;base64,'+twod.src);
  }
};

// DECLARE VARIABLES
let cursor_x = 0, cursor_y = 0  // cursor tracks the left wrist of the person on the Kinect

// settings of the start button
let back_x, back_y, back_width, back_height
let nav_x, nav_y, nav_width, nav_height
let bA_x, bA_y, bB_x, bB_y, bC_x, bC_y, bD_x, bD_y
let bA_width, bA_height, bB_width, bB_height, bC_width, bC_height, bD_width, bD_height

// settings of the timers and progress management 
let counter = 0 // keeps track of the progress bar
let timer = false // is the cursor hovering over an area that can be selected?
let myInterval  // function for updating the progress arc

function setup() {
  var myCanvas = createCanvas(window.innerWidth, window.innerHeight);
  myCanvas.parent("container");

  back = select('#goback')

  back_x = back.position().x
  back_y = back.position().y
  back_width = back.width
  back_height = back.height
}

function draw() {
  clear()
  // update cursor accordingly
  updateProgress()

  // Draw progress cursor
  stroke(255);
  c = color('red')
  fill(c);
  arc(cursor_x, cursor_y, 80, 80, 0, (counter / 5) * QUARTER_PI);
  c = color('black')
  fill(c)
  ellipse(cursor_x, cursor_y, 50, 50)
}

function updateProgress() {
  // Navigate amongst the page based on status of progress counter
  if (counter > 40) {
    // Check where the cursor is pointed
    if ((cursor_x > back_x) && (cursor_x < (back_x + back_width)) && (cursor_y > back_y) && (cursor_y < (back_y + back_height))) {
        window.location.href = "../results.html";
    }
    // Cleanup
    clearInterval(myInterval)
    timer = false
    counter = 0
  } else if ((cursor_x > back_x) && (cursor_x < (back_x + back_width)) && (cursor_y > back_y) && (cursor_y < (back_y + back_height))) {
    if (!timer) {
      myInterval = setInterval(function () {
        counter++;
      }, 75);
      timer = true
    } 
  } else {
    clearInterval(myInterval)
    timer = false
    counter = 0
  }
}


// EJ's code
let final = JSON.parse(localStorage.getItem("finalSpace"));
console.log(final);
console.log(final['Picture\r']);

// // // Example
// // // Address : "\"254 Prospect St\""
// // // Availability : "1"
// // // Distance : "1"
// // // Hours : "12am-12am"
// // // Name : "Tsai Center"
// // // Noise : "1"
// // // "Picture " : "test.jpg\r"

let noisenum = final.Noise;
let availnum = final.Busyness;
let distnum = final.Distance;
// put this star in : U+2B50 the unicode for a star after the name

// while noisenum isn't zero, add a star to the noise rating
let noise = document.getElementById("noise");
noise.innerHTML = noise.innerHTML + "⭐".repeat(noisenum);

let avail = document.getElementById("convenience");
avail.innerHTML = avail.innerHTML + "⭐".repeat(availnum);

let dist = document.getElementById("distance");
dist.innerHTML = dist.innerHTML + "⭐".repeat(distnum);

// your code here
const mapIframe = document.getElementById("map-iframe");
// format the address to be used in the Google Maps Embed API
const address = final.Address.replace(/ /g, "+") + ',+New+Haven,+CT'

// Replace the YOUR_API_KEY with your actual Google Maps Embed API key
const apiKey = 'AIzaSyC3S3ncQh-Zrn3Cln5pdunkKoUECoAqvA0';

// Construct the Google Maps Embed URL
const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${address}`;
mapIframe.src = mapUrl;


// find p.addy and put the address in it
let addy = document.getElementById("addy");
// replace the " with nothing
final.Address = final.Address.replace(/"/g, "");
addy.innerHTML = addy.innerHTML + final.Address;

let hrs = document.getElementById("hrs");
hrs.innerHTML = hrs.innerHTML + final.Hours;

// h1.name
let name = document.getElementById("name");
name.innerHTML = name.innerHTML + final.Name;

let pic = document.getElementById("pic");
let picaddy = "../assets/" + final['Picture\r'].trim();
console.log(picaddy);
pic.src = picaddy;



