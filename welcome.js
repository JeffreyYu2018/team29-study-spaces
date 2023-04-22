// Adapted from https://p5js.org/examples/interaction-snake-game.html
// Code for connecting to Kinect
var host = "cpsc484-03.yale.internal:8888/demo";
// var host = "localhost:4444";
$(document).ready(function() {
  frames.start();
  twod.start();
});

var frames = {
  socket: null,

  start: function() {
    var url = "ws://" + host + "/frames";
    frames.socket = new WebSocket(url);
    frames.socket.onmessage = function (event) {
      var command = frames.get_left_wrist_command(JSON.parse(event.data));
      if (command !== null) {
        sendWristCommand(command);
      }
    }
  },

  get_left_wrist_command: function (frame) {
    var pelvis_x = frame.people[0].joints[0].position.x;
    var pelvis_y = frame.people[0].joints[0].position.y;
    var left_wrist_x = (frame.people[0].joints[7].position.x - pelvis_x) * -1;
    var left_wrist_y = (frame.people[0].joints[7].position.y - pelvis_y) * -1;

    cursor_x = left_wrist_x + windowWidth/2
    cursor_y = windowHeight - left_wrist_y
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

// settings of the timers and progress management 
let counter = 0 // keeps track of the progress bar
let timer = false // is the cursor hovering over an area that can be selected?
let myInterval  // function for updating the progress arc


function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(102);

  // update cursor accordingly
  updateProgress(imgCoord)

  // Draw progress cursor
  stroke(255);
  c = color('red')
  fill(c);
  arc(cursor_x, cursor_y, 80, 80, 0, (counter / 5) * QUARTER_PI);
  c = color('black')
  fill(c)
  ellipse(cursor_x, cursor_y, 50, 50)
}

function drawStudySpaceImages(img, imgX, imgY) {
  image(img, imgX, imgY, imgWidth, imgHeight);
}

function updateProgress(imgCoord) {
  let imgX_0 = imgCoord[0][0], imgX_1 = imgCoord[1][0], imgX_2 = imgCoord[2][0], imgX_3 = imgCoord[3][0]
  let imgY_0 = imgCoord[0][1], imgY_1 = imgCoord[1][1], imgY_2 = imgCoord[2][1], imgY_3 = imgCoord[3][1]

  // Navigate amongst the page based on status of progress counter
  if (cursor_y > windowHeight / 2) {  // If left hand is raised halfway above the screen
    if (counter > 40) {
      console.log("START")
    } else {
      if (!timer) {
        myInterval = setInterval(function () {
          counter++;
        }, 50);
        timer = true
      } else {
        clearInterval(myInterval)
        timer = false
        counter = 0
      } 
    }
    // Cleanup
    clearInterval(myInterval)
    timer = false
    counter = 0
  }
  else if (cursor_y > windowHeight / 2)
  {

}

function drawStarCharts(headers, values, originX, originY) {
  for (let i = 0; i < n_stats; i++) { 
    c = color('black')
    fill(c)
    textOffset = 30
    textAlign(RIGHT, TOP)
    textSize(30)
    // assumes the middle values of the CSV are the statistics, so skips 1 (the original space)
    text(headers[i+1], originX + windowWidth*3/8 - textOffset, originY + windowHeight / 4 + i * 30 - 15)
    barMaxLength = 250
    c = color('red')
    fill(c);
    
    // ignore the first space since it's the space
    for (let n = 0; n < values[i+1]; n++) {
      star(originX + windowWidth*3/8 + 40*n, originY + windowHeight / 4 + i * 30, 7.5, 17.5, 5);
    }
    
  }
}

// taken from https://p5js.org/examples/form-star.html
function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}