// Adapted from https://p5js.org/examples/interaction-snake-game.html
// Code for connecting to Kinect
var host = "cpsc484-03.yale.internal:8888";
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
      frames.get_left_wrist_command(JSON.parse(event.data));
    }
  },

  get_left_wrist_command: function (frame) {
    console.log(frame)
    if (frame.people === undefined || frame.people.length == 0) {
      console.log("no people in frame")
    } else {
      var pelvis_x = frame.people[0].joints[0].position.x;
      var pelvis_y = frame.people[0].joints[0].position.y;
      var left_wrist_x = (frame.people[0].joints[7].position.x - pelvis_x) * -1;
      var left_wrist_y = (frame.people[0].joints[7].position.y - pelvis_y) * -1;
  
      console.log(left_wrist_x)
      cursor_x = (1.5*left_wrist_x) + windowWidth/2
      cursor_y = windowHeight - (1.5*left_wrist_y)
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

// Grab the ideal study spaces from local storage
let idealspaces = JSON.parse(localStorage.getItem("ideal"));
console.log(idealspaces);

// DECLARE VARIABLES
let cursor_x = 0, cursor_y = 0  // cursor tracks the left wrist of the person on the Kinect

// settings of the refresh and redo buttons on the display
let refreshX, refreshY, redoX, redoY
let refreshWidth = 250, refreshHeight = 80, redoWidth = 250, redoHeight = 80

// settings of the Your Matches box at the top
let YourMatchesWidth = 500, YourMatchesHeight = 100

// settings for vertical offsets
let vertOffset = 40 // general variable to describe the offset of images from the borders
let vertOffsetQuad = 140

// settings for horizontal offset
let horizOffsetQuad = 20

// settings of the images in each quadrant
let img_top_left,img_top_right,img_bot_left,img_bot_right // links to the image objects holding the pictures
let imgWidth = 350, imgHeight = 250  // image size dimensions
let coord // locations of the images based on general points
let imgCoord = [] // specific offsets of images based on coord

// settings of the timers and progress management 
let counter = 0 // keeps track of the progress bar
let timer = false // is the cursor hovering over an area that can be selected?
let myInterval  // function for updating the progress arc

// settings of study space information
let table
let n_stats = 3 // number of statistics
let headers 
let values
let PICTUREINDEX = 6  // column # of picture links in CSV 

// Initialize images
function preload() {
  // load study space information
  table = loadTable("studyspace_data.csv", "csv", "header");
}


function setup() {
  // log all keys in the idealspaces[0] object
  console.log(Object.keys(idealspaces[3]))
  console.log(idealspaces[0]['Picture\r'])
  // load images
  img_top_left = loadImage('assets/' + idealspaces[0]['Picture\r'])
  img_top_right = loadImage('assets/' + idealspaces[1]['Picture\r'])
  img_bot_left = loadImage('assets/' + idealspaces[2]['Picture\r'])
  img_bot_right = loadImage('assets/' + idealspaces[3]['Picture\r'])

  // load study space information
  headers = table.columns
  values = table.getArray()
  console.log(values)

  createCanvas(windowWidth, windowHeight);
  coord = [[horizOffsetQuad,vertOffsetQuad],[horizOffsetQuad,windowHeight*56/100],[windowWidth/2+horizOffsetQuad/3,vertOffsetQuad],[windowWidth/2+horizOffsetQuad/3,windowHeight*56/100]] // coordinates of quadrants
  imgs = [img_top_left,img_top_right,img_bot_left,img_bot_right]
  // setup specific image coords
  for (let i = 0; i < 4; i++) {
    quadX = coord[i][0]
    quadY = coord[i][1]
    imgCoord.push([quadX + windowWidth/32, quadY + windowHeight*1/16])
  }
}

function draw() {
  background(243,243,243);
  let c = color('red');
  for (let i = 0; i < 4; i++) {
    // generate image coordinates
    quadX = coord[i][0]
    quadY = coord[i][1]
    img = imgs[i]
    imgX = quadX + windowWidth/32
    imgY = quadY + windowHeight*1/16

    // draw quadrants with grey outlines to divide up the screen
    c = color('white')
    fill(c)
    rect(coord[i][0], coord[i][1], windowWidth/2-1.5*horizOffsetQuad, windowHeight*2/5, 10);

    // fill in quadrant with data (title, star chart, image)
    c = color('black')
    fill(c)
    textAlign(CENTER);
    text(idealspaces[i]['Name'], imgX + imgWidth / 2, imgY + imgHeight + 15)
    drawStarCharts(headers, Object.values(idealspaces[i]), quadX, quadY)
    drawStudySpaceImages(imgs[i], imgX, imgY)
  }

  // update cursor accordingly
  updateProgress(imgCoord)

  // draw Your Matches box
  c = color(243,243,243)
  fill(c);
  rect(windowWidth/2-YourMatchesWidth/2, 0, YourMatchesWidth, YourMatchesHeight)
  textAlign(CENTER);
  textSize(50);
  c = color('black')
  fill(c)
  text('Your Matches', windowWidth/2, YourMatchesHeight/2)

  // Draw refresh button
  c = color('green')
  fill(c);
  refreshX = windowWidth*3/4
  refreshY = vertOffset
  rect(refreshX, refreshY, refreshWidth, refreshHeight, 20)
  textAlign(CENTER);
  textSize(30);
  c = color('white')
  fill(c)
  text('Refresh', windowWidth*3/4+refreshWidth/2, refreshHeight/2+vertOffset*3/5)

  // Draw Redo Quiz button
  redoX = windowWidth-(windowWidth*3/4)-redoWidth
  redoY = vertOffset
  c = color(34,133,255)
  fill(c);
  rect(redoX, redoY, redoWidth, redoHeight, 20)
  textAlign(CENTER);
  textSize(30);
  c = color('white')
  fill(c)
  text('Redo Quiz', windowWidth/4-redoWidth/2, redoHeight/2+vertOffset*3/5)

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
  if (counter > 40) {
    // EJ'S CODE TO CHANGE PAGES GOES HERE
    // Check where the cursor is pointed
    if (cursor_x > imgX_0 && cursor_x < (imgX_0 + imgWidth) && cursor_y > imgY_0 && cursor_y < (imgY_0 + imgHeight)) {
      // NAVIGATE TO IMAGE ZERO (TOP LEFT)
      // open A5/info.html
      window.localtion.href = 'A5/info.html'
    } else if (cursor_x > imgX_1 && cursor_x < (imgX_1 + imgWidth) && cursor_y > imgY_1 && cursor_y < (imgY_1 + imgHeight)) {
      // NAVIGATE TO IMAGE ONE (TOP RIGHT)
      window.localtion.href = 'A5/info.html'
    } else if (cursor_x > imgX_2 && cursor_x < (imgX_2 + imgWidth) && cursor_y > imgY_2 && cursor_y < (imgY_2 + imgHeight)) {
      // NAVIGATE TO IMAGE TWO (BOTTOM LEFT)
      window.localtion.href = 'A5/info.html'
    } else if (cursor_x > imgX_3 && cursor_x < (imgX_3 + imgWidth) && cursor_y > imgY_3 && cursor_y < (imgY_3 + imgHeight)) {
      // NAVIGATE TO IMAGE THREE (BOTTOM RIGHT)
      window.localtion.href = 'A5/info.html'
    } else if (cursor_x > refreshX && cursor_x < (refreshX + refreshWidth) && cursor_y > refreshY && cursor_y < (refreshY + refreshHeight)) {
      // REFRESH RESULTS AND DISPLAY NEW ONES
      // TODO: make sure i'm grabbing top 8 instead of 4
    } else if (cursor_x > redoX && cursor_x < (redoX + redoWidth) && cursor_y > redoY && cursor_y < (redoY + redoHeight)) {
      // RESTART THE QUIZ FROM BEGINNING
      window.localtion.href = 'A5/info.html'
    }
    // Cleanup
    clearInterval(myInterval)
    timer = false
    counter = 0
  }
  else if ((cursor_x > imgX_0 && cursor_x < (imgX_0 + imgWidth) && cursor_y > imgY_0 && cursor_y < (imgY_0 + imgHeight)) ||
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

function drawStarCharts(headers, values, originX, originY) {
  console.log(values)
  for (let i = 0; i < n_stats; i++) { 
    c = color('black')
    noStroke()
    fill(c)
    textOffset = 30
    textAlign(RIGHT, TOP)
    textSize(30)
    // assumes the middle values of the CSV are the statistics, so skips 1 (the original space)
    text(headers[i+1], originX + windowWidth*3/8 - textOffset, originY + (windowHeight / 4 - 2 * vertOffset) + i * 50 - 15)
    barMaxLength = 250
    c = color('red')
    fill(c);
    
    // ignore the first space since it's the space
    for (let n = 0; n < values[i+1]; n++) {
      star(originX + windowWidth*3/8 + 40*n, originY + (windowHeight / 4 - 2 * vertOffset) + i * 50, 7.5, 17.5, 5);
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