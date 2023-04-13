const questionText = document.getElementById('questionText');
const choiceA = document.getElementById('choiceA');
const choiceB = document.getElementById('choiceB');
const choiceC = document.getElementById('choiceC');
const choiceD = document.getElementById('choiceD');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const questions = [
    {
        question: 'How far are you willing to walk?',
        choices: ['Not far at all', 'A short walk', 'A little trek', 'Anywhere on campus'],
    },
    {
        question: 'What level of noise do you prefer?',
        choices: ['Silent', 'Quiet', 'Moderate noise', 'Lively'],
    },
    {
        question: 'How important is access to power outlets?',
        choices: ['Not important', 'Somewhat important', 'Important', 'Very important'],
    },
    {
        question: 'Do you prefer individual or group study spaces?',
        choices: ['Individual', 'Group', 'Either is fine'],
    },
    {
        question: 'Which type of seating do you prefer?',
        choices: ['Hard chairs', 'Cushioned chairs', 'Booths', 'Beanbags or lounge seating'],
    },
    {
        question: 'How important is natural light?',
        choices: ['Not important', 'Somewhat important', 'Important', 'Very important'],
    },
    {
        question: 'Do you need access to whiteboards or blackboards?',
        choices: ['Not necessary', 'Nice to have', 'Important', 'Very important'],
    },
    {
        question: 'Would you like access to food or drinks nearby?',
        choices: ['Not necessary', 'Nice to have', 'Important', 'Very important'],
    },
    {
        question: 'Do you prefer indoor or outdoor study spaces?',
        choices: ['Indoor', 'Outdoor', 'Either is fine'],
    },
    {
        question: 'How important is it to have nearby restrooms?',
        choices: ['Not important', 'Somewhat important', 'Important', 'Very important'],
    },
    {
        question: 'Would you like access to computer labs or printers?',
        choices: ['Not necessary', 'Nice to have', 'Important', 'Very important'],
    },
    {
        question: 'Do you prefer a more formal or casual study environment?',
        choices: ['Formal', 'Casual', 'Either is fine'],
    }
    // Here are all questions

];

let currentQuestion = 0;

function displayQuestion() {
    questionText.textContent = questions[currentQuestion].question;
    choiceA.textContent = questions[currentQuestion].choices[0];
    choiceB.textContent = questions[currentQuestion].choices[1];
    choiceC.textContent = questions[currentQuestion].choices[2];
    choiceD.textContent = questions[currentQuestion].choices[3];
}

function changeQuestion(step) {
    currentQuestion += step;
    if (currentQuestion < 0) {
        currentQuestion = 0;
    } else if (currentQuestion >= questions.length) {
        currentQuestion = questions.length - 1;
    }

    displayQuestion();
}

displayQuestion();

prevBtn.addEventListener('click', () => changeQuestion(-1));
nextBtn.addEventListener('click', () => changeQuestion(1));

// if a user clicks on a choice, we want to save that choice and move on to the next question
choiceA.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[0]);
    changeQuestion(1);

});
choiceB.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[1]);
    changeQuestion(1);

});
choiceC.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[2]);
    changeQuestion(1);

});
choiceD.addEventListener('click', () => {
    // save choice
    console.log(questions[currentQuestion].choices[3]);
    changeQuestion(1);

});
var csv = 'data.csv';
$.get(csv, function (data) {
    var lines = data.split('\r\n');
    var result = [];
    var headers = lines[0].split(',');
    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(',');
        for (var j = 0; j < headers.length; j++) {
            insert = currentline[j];
            obj[headers[j]] = insert;
        }
        // if all the space attributes are empty, don't add it to the result
        if (obj['Space'] != '') {
            result.push(obj);
        }
    }
    console.log(result);
});

