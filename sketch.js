// Adapted from https://p5js.org/examples/interaction-snake-game.html
//
var host = "localhost:4444";
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
    var command = null;
    if (frame.people.length < 1) {
      return command;
    }

    // Normalize by subtracting the root (pelvis) joint coordinates
    var pelvis_x = frame.people[0].joints[0].position.x;
    var pelvis_y = frame.people[0].joints[0].position.y;
    var pelvis_z = frame.people[0].joints[0].position.z;
    var left_wrist_x = (frame.people[0].joints[7].position.x - pelvis_x) * -1;
    var left_wrist_y = (frame.people[0].joints[7].position.y - pelvis_y) * -1;
    var left_wrist_z = (frame.people[0].joints[7].position.z - pelvis_z) * -1;

    if (left_wrist_z < 100) {
      return command;
    }

    if (left_wrist_x < 200 && left_wrist_x > -200) {
      if (left_wrist_y > 500) {
        command = 73; // UP
      } else if (left_wrist_y < 100) {
        command = 75; // DOWN
      }
    } else if (left_wrist_y < 500 && left_wrist_y > 100) {
      if (left_wrist_x > 200) {
        command = 76; // RIGHT
      } else if (left_wrist_x < -200) {
        command = 74; // LEFT
      }
    }

    cursor_x = left_wrist_x
    cursor_y = left_wrist_y
    return command;
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
// the snake is divided into small segments, which are drawn and edited on each 'draw' call
let numSegments = 10;
let direction = 'right';

const xStart = 0; //starting x coordinate for snake
const yStart = 250; //starting y coordinate for snake
const diff = 10;

let cursor_x = 0
let cursor_y = 0
let refreshX, refreshY

let img_top_left,img_top_right,img_bot_left,img_bot_right
let img_width=350,img_height=250
let coord
let counter=0
let timer=false
let noises=[],conveniences=[],distances=[]
let myInterval

function preload() {
  img_top_left = loadImage('assets/bass.jpg')
  img_top_right = loadImage('assets/ceid.jpg')
  img_bot_left = loadImage('assets/hq131.jpg')
  img_bot_right = loadImage('assets/sss410.jpg')
  table = loadTable("studyspaces.csv", "csv", "header");
}

headers = ['noise', 'convenience', 'distance']
values = [[1,4,3],[2,2,4],[4,1,1],[3,3,2]]

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  coord = [[0,0],[0,windowHeight/2],[windowWidth/2,0],[windowWidth/2,windowHeight/2]] // coordinates of quadrants
  imgs = [img_top_left,img_top_right,img_bot_left,img_bot_right]
  background(102);
  let c = color('red');
  // fill(c);
  for (let i = 0; i < 4; i++) {
    quadX = coord[i][0]
    quadY = coord[i][1]
    img = imgs[i]
    imgX = quadX + windowWidth/32
    imgY = quadY + windowHeight*3/16
    stroke('#222222');
    strokeWeight(4);
    c = color('white')
    fill(c)
    rect(coord[i][0], coord[i][1], windowWidth/2, windowHeight/2);
    c = color('red')
    drawBarCharts(headers, values[i], quadX, quadY)
    drawStudySpaceImages(imgs[i], imgX, imgY)
    updateProgress(i, imgX, imgY)
  }

  // Your Matches
  c = color('#D3D3D3')
  fill(c);
  YourMatchesWidth = 500
  YourMatchesHeight = 100
  rect(windowWidth/2-YourMatchesWidth/2, 0, YourMatchesWidth, YourMatchesHeight)
  textAlign(CENTER);
  textSize(30);
  c = color('black')
  fill(c)
  text('Your Matches', windowWidth/2, YourMatchesHeight/2)

  // Refresh
  c = color('green')
  fill(c);
  RefreshWidth = 250
  RefreshHeight = 80
  VertOffset = 40
  refreshX = windowWidth*3/4
  refreshY = VertOffset
  rect(refreshX, refreshY, RefreshWidth, RefreshHeight, 20)
  textAlign(CENTER);
  textSize(30);
  c = color('black')
  fill(c)
  text('Refresh', windowWidth*3/4+RefreshWidth/2, RefreshHeight/2+VertOffset)

  // Redo Quiz 
  c = color('pink')
  fill(c);
  RedoWidth = 250
  RedoHeight = 80
  VertOffset = 40
  rect(windowWidth-(windowWidth*3/4)-RedoWidth, VertOffset, RedoWidth, RedoHeight, 20)
  textAlign(CENTER);
  textSize(30);
  c = color('black')
  fill(c)
  text('Redo Quiz', windowWidth/4-RedoWidth/2, RedoHeight/2+VertOffset)


  stroke(255);
  c = color('red')
  fill(c);
  console.log("counter equals: " + counter)
  // WITH MOUSE
  arc(mouseX, mouseY, 80, 80, 0, (counter / 5) * QUARTER_PI);
  c = color('blue')
  fill(c)
  ellipse(mouseX, mouseY, 50, 50);
  // img_top_left.mouseOver(changeGray)
  updateRefresh()


  // DRAWING COMMAND WITH KINECT DATA
  // ellipse(cursor_x+width/2, cursor_y+height/2, 30, 30)
}

function drawStudySpaceImages(img, imgX, imgY) {
  image(img, imgX, imgY, img_width, img_height);
}

function updateProgress(id, imgX, imgY) {
  if (mouseX > imgX && mouseX < (imgX + img_width)) {
    if (mouseY > imgY && mouseY < (imgY + img_height)){
      switch (id) {
        case 0:
          console.log("IMAGE ONE")
          break;
        case 1:
          console.log("IMAGE TWO")
          break;
        case 2:
          console.log("IMAGE THREE")
          break;
        case 3:
          console.log("IMAGE FOUR")
          break;
      } 
      if (!timer) {
        myInterval = setInterval(function () {
          counter++;
        }, 50);
        timer = true
      }
    } 
    else {
      // clearInterval(myInterval)
    }
  } else {
    // clearInterval(myInterval)
  }
}

function updateRefresh() {
  if (mouseX > refreshX && mouseX < (refreshX + refreshWidth)) {
    if (mouseY > refreshY && mouseY < (refreshY + refreshHeight)){
      console.log("REFRESH")
    } 
  }
}

function drawBarCharts(headers, values, originX, originY) {
  for (let i = 0; i < values.length; i++) {
    //place years
    c = color('black')
    fill(c)
    textOffset = 30
    textAlign(RIGHT, TOP)
    textSize(30)
    text(headers[i], originX + windowWidth*3/8 - textOffset, originY + windowHeight / 4 + i * 30)
    //pull numbers
    // noises[i] = table.getString(i, 'noise')
    //draw graph
    barMaxLength = 250
    c = color('red')
    fill(c);
    rect(originX + windowWidth*3/8, originY + windowHeight / 4 + i * 30, barMaxLength - values[i] * 50, 30)
  }
}

function sendWristCommand(command) {
  switch (command) {
    case 74:
      if (direction !== 'right') {
        direction = 'left';
      }
      break;
    case 76:
      if (direction !== 'left') {
        direction = 'right';
      }
      break;
    case 73:
      if (direction !== 'down') {
        direction = 'up';
      }
      break;
    case 75:
      if (direction !== 'up') {
        direction = 'down';
      }
      break;
  }
  console.log(direction);
}

