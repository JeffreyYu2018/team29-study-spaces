// if "backupspaces" in local storage, then delete it
if (localStorage.getItem("backupspaces") !== []) {
  localStorage.removeItem("backupspaces");
}

const questionText = document.getElementById('questionText');
const choiceA = document.getElementById('choiceA');
const choiceB = document.getElementById('choiceB');
const choiceC = document.getElementById('choiceC');
const choiceD = document.getElementById('choiceD');
const prevBtn = document.getElementById('prevBtn');

let studySpaces;

let body_id

// Questions for the survey
const questions = [
  {
    question: 'What level of noise do you prefer?',
    choices: ['Silent', 'Quiet', 'Moderate noise', 'Lively'],
  },
  {
    question: 'How far are you willing to walk?',
    choices: ['Not far at all', 'A short walk', 'A little trek', 'Anywhere on campus'],
  },
  {
    question: 'How busy a space would you prefer?',
    choices: ['Not at all', 'Somewhat busy', 'Moderate business', 'Very busy'],
  }
];

// answers array to store user's answers etc. [1,2,3]
const answers = [];

let currentQuestion = 0; //tracker of what question is currently being answered in the questions array

async function fetchCSV(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
    }
}


function parseCSV(csvText) { //parses the csv file
  const rows = csvText.split('\n').filter(row => row.trim() !== '');
  const header = rows.shift().split(',');

  return rows.map(row => {
    const rowData = row.split(',');
    return header.reduce((acc, columnName, index) => {
      acc[columnName] = rowData[index];
      return acc;
    }, {});
  });
}

function calculateDifference(userAnswers, studySpaceAnswers) { //calculates the difference between the user's answers and the study space's answers
  let difference = 0;

  for (let i = 0; i < userAnswers.length; i++) {
    difference += Math.abs(userAnswers[i] - studySpaceAnswers[i]);
  }

  return difference;
}

async function findIdealStudySpaces(userAnswers, studySpaces) { //finds the ideal study spaces based on the user's answers
  await fetchCSV('studyspace_data.csv');
  const differences = studySpaces.map(space => {
    const studySpaceAnswers = Object.values(space).slice(1).map(Number);
    const difference = calculateDifference(userAnswers, studySpaceAnswers);
    return { ...space, difference };
  });

  differences.sort((a, b) => a.difference - b.difference); //sorts the differences in ascending order
  return differences.slice(0, 8);
}


function displayQuestion() { //displays the question and choices
    questionText.textContent = questions[currentQuestion].question;
    choiceA.textContent = questions[currentQuestion].choices[0];
    choiceB.textContent = questions[currentQuestion].choices[1];
    choiceC.textContent = questions[currentQuestion].choices[2];
    choiceD.textContent = questions[currentQuestion].choices[3];
}

async function changeQuestion(step) {
    currentQuestion += step;
    if (currentQuestion < 0) {
      currentQuestion = 0;
    } else if (currentQuestion >= questions.length) {
      currentQuestion = questions.length - 1;
      // run the algorithm
      try {
        const studySpaces = await fetchCSV('studyspace_data.csv');
        ideal = await findIdealStudySpaces(answers, studySpaces);
        // go back into the study spaces and return the whole lines of the top 4 study spaces
        for (let i = 0; i < ideal.length; i++) {
          ideal[i] = studySpaces.find(space => space.Name === ideal[i].Name);
        }
        localStorage.setItem("ideal", JSON.stringify(ideal));
        console.log(localStorage.getItem("ideal"));
        window.location.href = "results.html";
      } catch (error) {
        console.error(error);
      }
    }
    displayQuestion();
  }

displayQuestion();

prevBtn.addEventListener('click', () => { //if the user clicks the previous button, we want to go back to the previous question
    changeQuestion(-1);
    // remove the last answer
    answers.pop();
});


// if a user clicks on a choice, we want to save that choice and move on to the next question
choiceA.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[0]);
    answers.push(1);
    changeQuestion(1);

});
choiceB.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[1]);
    answers.push(2);
    changeQuestion(1);

});
choiceC.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[2]);
    answers.push(3);
    changeQuestion(1);

});
choiceD.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[3]);
    answers.push(4);
    changeQuestion(1);

});


// Jeff's CODE BELOW
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

// DECLARE VARIABLES
let cursor_x = 0, cursor_y = 0  // cursor tracks the left wrist of the person on the Kinect

// settings of the start button
let prev_x, prev_y, prev_width, prev_height
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

  buttonA = select('#choiceA')
  buttonB = select('#choiceB')
  buttonC = select('#choiceC')
  buttonD = select('#choiceD')
  prev = select('#prevBtn')
  nav = select('#navbar')

  bA_x = buttonA.position().x
  bA_y = buttonA.position().y
  bB_x = buttonB.position().x
  bB_y = buttonB.position().y
  bC_x = buttonC.position().x
  bC_y = buttonC.position().y
  bD_x = buttonD.position().x
  bD_y = buttonD.position().y
  bA_width = buttonA.width
  bA_height = buttonA.height
  bB_width = buttonB.width
  bB_height = buttonB.height
  bC_width = buttonC.width
  bC_height = buttonC.height
  bD_width = buttonD.width
  bD_height = buttonD.height
  prev_x = prev.position().x
  prev_y = prev.position().y
  prev_width = prev.width
  prev_height = prev.height
  nav_x = nav.position().x
  nav_y = nav.position().y
  nav_width = nav.width
  nav_height = nav.height
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
    if ((cursor_x > bA_x) && (cursor_x < (bA_x + bA_width)) && (cursor_y > bA_y + nav_height) && (cursor_y < (bA_y + bA_height + nav_height))) {
      console.log(questions[currentQuestion].choices[0]);
      answers.push(1);
      changeQuestion(1);
    } else if  ((cursor_x > bB_x) && (cursor_x < (bB_x + bB_width)) && (cursor_y > bB_y + nav_height) && (cursor_y < (bB_y + bB_height + nav_height))) {
      // save choice
      console.log(questions[currentQuestion].choices[1]);
      answers.push(2);
      changeQuestion(1);
    } else if ((cursor_x > bC_x) && (cursor_x < (bC_x + bC_width)) && (cursor_y > bC_y + nav_height) && (cursor_y < (bC_y + bC_height + nav_height))) {
      // save choice
      console.log(questions[currentQuestion].choices[2]);
      answers.push(3);
      changeQuestion(1);
    } else if ((cursor_x > bD_x) && (cursor_x < (bD_x + bD_width)) && (cursor_y > bD_y + nav_height) && (cursor_y < (bD_y + bD_height + nav_height))) {
      // save choice
      console.log(questions[currentQuestion].choices[3]);
      answers.push(4);
      changeQuestion(1);
    } else if ((cursor_x > prev_x) && (cursor_x < (prev_x + prev_width)) && (cursor_y > prev_y) && (cursor_y < (prev_y + prev_height))) {
      changeQuestion(-1);
      // remove the last answer
      answers.pop();
    }
    // Cleanup
    clearInterval(myInterval)
    timer = false
    counter = 0
    // Cleanup
    clearInterval(myInterval)
    timer = false
    counter = 0
  } else if (((cursor_x > bA_x) && (cursor_x < (bA_x + bA_width)) && (cursor_y > bA_y + nav_height) && (cursor_y < (bA_y + bA_height + nav_height))) ||
    ((cursor_x > bB_x) && (cursor_x < (bB_x + bB_width)) && (cursor_y > bB_y + nav_height) && (cursor_y < (bB_y + bB_height + nav_height))) ||
    ((cursor_x > bC_x) && (cursor_x < (bC_x + bC_width)) && (cursor_y > bC_y + nav_height) && (cursor_y < (bC_y + bC_height + nav_height))) ||
    ((cursor_x > bD_x) && (cursor_x < (bD_x + bD_width)) && (cursor_y > bD_y + nav_height) && (cursor_y < (bD_y + bD_height + nav_height))) ||
    ((cursor_x > prev_x) && (cursor_x < (prev_x + prev_width)) && (cursor_y > prev_y) && (cursor_y < (prev_y + prev_height)))
  ) {
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
