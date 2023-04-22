const questionText = document.getElementById('questionText');
const choiceA = document.getElementById('choiceA');
const choiceB = document.getElementById('choiceB');
const choiceC = document.getElementById('choiceC');
const choiceD = document.getElementById('choiceD');
const prevBtn = document.getElementById('prevBtn');

let studySpaces;

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
  return differences.slice(0, 4);
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
        window.location.href = "index.html";
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
