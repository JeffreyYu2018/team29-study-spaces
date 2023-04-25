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
        // grab body_id from person with lowest y_pos value
        let min_y_pos = Infinity
        let body_id_index
        for (let b = 0; b < frame.people.length; b++) {
          if (frame.people[b].y_pos < min_y_pos) {
            min_y_pos = frame.people[b].y_pos
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

// settings for the cursor
let cursor_x = 0, cursor_y = 0

// settings of the start button
let startX, startY
let startWidth = 250, startHeight = 80

// settings of the timers and progress management 
let counter = 0 // keeps track of the progress bar
let timer = false // is the cursor hovering over an area that can be selected?
let myInterval  // function for updating the progress arc

function setup() {
  var myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.parent("welcome");
}

function draw() {
  background('white')
  // update cursor accordingly
  updateProgress()

  // draw welcome message
  textAlign(CENTER);
  textSize(70);
  c = color('black')
  fill(c)
  text('Welcome to our Quiz', windowWidth/2, windowHeight/2)

  // draw instructions message
  textAlign(CENTER);
  textSize(25);
  c = color('black')
  fill(c)
  text('To start, use your left wrist to control the cursor.', windowWidth/2, windowHeight * 4.1 / 7)

  // draw instructions message
  textAlign(CENTER);
  textSize(25);
  c = color('black')
  fill(c)
  text('Hover over the Start Button for 10 seconds to begin.', windowWidth/2, windowHeight * 5 / 8)

  // draw start button
  c = color('green')
  fill(c);
  horizontalOffset = startWidth / 2
  startX = windowWidth / 2 - horizontalOffset
  startY = windowHeight * 2 / 3
  rect(startX, startY, startWidth, startHeight, 20)
  textAlign(CENTER);
  textSize(30);
  c = color('white')
  fill(c)
  text('Start', windowWidth / 2, windowHeight * 5 / 7)

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
    // Cleanup
    clearInterval(myInterval)
    timer = false
    counter = 0

    // change pages
    window.location.href = 'questions.html'
  } else if (cursor_x > startX && cursor_x < (startX + startWidth) && cursor_y > startY && cursor_y < (startY + startHeight)) {
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
