// Adapted from https://p5js.org/examples/interaction-snake-game.html
//
var host = "cpsc484-03.yale.internal:8888";
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

    cursor_x = left_wrist_x + windowWidth/2
    cursor_y = windowHeight - left_wrist_y
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
let refreshX, refreshY, redoX, redoY
let refreshWidth, refreshHeight, redoWidth, redoHeight

let img_top_left,img_top_right,img_bot_left,img_bot_right
let imgWidth=350,imgHeight=250
let coord
let counter=0
let timer=false
let noises=[],conveniences=[],distances=[]
let myInterval
let imgCoord = []

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
  coord = [[0,0],[0,windowHeight/2],[windowWidth/2,0],[windowWidth/2,windowHeight/2]] // coordinates of quadrants
  imgs = [img_top_left,img_top_right,img_bot_left,img_bot_right]
  // setup image coords
  for (let i = 0; i < 4; i++) {
    quadX = coord[i][0]
    quadY = coord[i][1]
    imgCoord.push([quadX + windowWidth/32, quadY + windowHeight*3/16])
  }
  refreshWidth = 250
  refreshHeight = 80
  redoWidth = 250
  redoHeight = 80
  vertOffset = 40
}

function draw() {

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
  }
  updateProgress(imgCoord)

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

  refreshX = windowWidth*3/4
  refreshY = vertOffset
  rect(refreshX, refreshY, refreshWidth, refreshHeight, 20)
  textAlign(CENTER);
  textSize(30);
  c = color('black')
  fill(c)
  text('Refresh', windowWidth*3/4+refreshWidth/2, refreshHeight/2+vertOffset)

  // Redo Quiz 
  redoX = windowWidth-(windowWidth*3/4)-redoWidth
  redoY = vertOffset
  c = color('pink')
  fill(c);
  rect(redoX, redoY, redoWidth, redoHeight, 20)
  textAlign(CENTER);
  textSize(30);
  c = color('black')
  fill(c)
  text('Redo Quiz', windowWidth/4-redoWidth/2, redoHeight/2+vertOffset)


  stroke(255);
  c = color('red')
  fill(c);
  // WITH MOUSE
  arc(cursor_x, cursor_y, 80, 80, 0, (counter / 5) * QUARTER_PI);
  c = color('black')
  fill(c)
  ellipse(cursor_x, cursor_y, 50, 50)
  // img_top_left.mouseOver(changeGray)


  // DRAWING COMMAND WITH KINECT DATA
  
}

function drawStudySpaceImages(img, imgX, imgY) {
  image(img, imgX, imgY, imgWidth, imgHeight);
}

function updateProgress(imgCoord) {
  let imgX_0 = imgCoord[0][0], imgX_1 = imgCoord[1][0], imgX_2 = imgCoord[2][0], imgX_3 = imgCoord[3][0]
  let imgY_0 = imgCoord[0][1], imgY_1 = imgCoord[1][1], imgY_2 = imgCoord[2][1], imgY_3 = imgCoord[3][1]

  if ((cursor_x > imgX_0 && cursor_x < (imgX_0 + imgWidth) && cursor_y > imgY_0 && cursor_y < (imgY_0 + imgHeight)) ||
    (cursor_x > imgX_1 && cursor_x < (imgX_1 + imgWidth) && cursor_y > imgY_1 && cursor_y < (imgY_1 + imgHeight)) ||
    (cursor_x > imgX_2 && cursor_x < (imgX_2 + imgWidth) && cursor_y > imgY_2 && cursor_y < (imgY_2 + imgHeight)) ||
    (cursor_x > imgX_3 && cursor_x < (imgX_3 + imgWidth) && cursor_y > imgY_3 && cursor_y < (imgY_3 + imgHeight)) ||
    (cursor_x > refreshX && cursor_x < (refreshX + refreshWidth) && cursor_y > refreshY && cursor_y < (refreshY + refreshHeight)) ||
    (cursor_x > redoX && cursor_x < (redoX + redoWidth) && cursor_y > redoY && cursor_y < (redoY + redoHeight))
  ) {
    if (!timer) {
      myInterval = setInterval(function () {
        counter++;
      }, 50);
      timer = true
    }
  } else {
    clearInterval(myInterval)
    timer = false
    counter = 0
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