const questionText = document.getElementById('questionText');
const choiceA = document.getElementById('choiceA');
const choiceB = document.getElementById('choiceB');
const choiceC = document.getElementById('choiceC');
const choiceD = document.getElementById('choiceD');
const prevBtn = document.getElementById('prevBtn');


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
    // {
    //     question: 'How important is access to power outlets?',
    //     choices: ['Not important', 'Somewhat important', 'Important', 'Very important'],
    // },
    // {
    //     question: 'Do you prefer individual or group study spaces?',
    //     choices: ['Individual', 'Group', 'Either is fine'],
    // },
    // {
    //     question: 'Which type of seating do you prefer?',
    //     choices: ['Hard chairs', 'Cushioned chairs', 'Booths', 'Beanbags or lounge seating'],
    // },
    // {
    //     question: 'How important is natural light?',
    //     choices: ['Not important', 'Somewhat important', 'Important', 'Very important'],
    // },
    // {
    //     question: 'Do you need access to whiteboards or blackboards?',
    //     choices: ['Not necessary', 'Nice to have', 'Important', 'Very important'],
    // },
    // {
    //     question: 'Would you like access to food or drinks nearby?',
    //     choices: ['Not necessary', 'Nice to have', 'Important', 'Very important'],
    // },
    // {
    //     question: 'Do you prefer indoor or outdoor study spaces?',
    //     choices: ['Indoor', 'Outdoor', 'Either is fine'],
    // },
    // {
    //     question: 'How important is it to have nearby restrooms?',
    //     choices: ['Not important', 'Somewhat important', 'Important', 'Very important'],
    // },
    // {
    //     question: 'Would you like access to computer labs or printers?',
    //     choices: ['Not necessary', 'Nice to have', 'Important', 'Very important'],
    // },
    // {
    //     question: 'Do you prefer a more formal or casual study environment?',
    //     choices: ['Formal', 'Casual', 'Either is fine'],
    // }
    // Here are all questions

];

const answers = [];

let currentQuestion = 0;

async function fetchCSV(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    return parseCSV(csvText);
}

function parseCSV(csvText) {
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

function calculateDifference(userAnswers, studySpaceAnswers) {
    let difference = 0;

    for (let i = 0; i < userAnswers.length; i++) {
        difference += Math.abs(userAnswers[i] - studySpaceAnswers[i]);
    }

    return difference;
}

function findIdealStudySpaces(userAnswers, studySpaces) {
    const differences = studySpaces.map(space => {
        const studySpaceAnswers = Object.values(space).slice(1).map(Number);
        const difference = calculateDifference(userAnswers, studySpaceAnswers);
        return { ...space, difference };
    });

    differences.sort((a, b) => a.difference - b.difference);

    return differences.slice(0, 4);
}

const userAnswers = [1, 2, 3];

(async () => {
    const csvUrl = 'studyspace_data.csv';
    const studySpaces = await fetchCSV(csvUrl);
    const idealStudySpaces = findIdealStudySpaces(userAnswers, studySpaces);
    console.log('Top 4 ideal study spaces:', idealStudySpaces);
})();

// Mock CSV string
const mockCSV = `Name,Noise,Distance,Availability
Saint Thomas Moore,1,3,1
Bass Library,1,2,1
Gilmore Music Library,1,2,1
Steep Café,2,3,1
Center for Engineering Innovation and Design (CEID),2,1,1
William L. Harkness Hall,1,2,1
Robert B. Haas Family Arts Library,1,3,1
Lillian Goldman Law Library,1,2,1
GoodLife Center,2,1,1
The Underground,4,1,1
School of Environment,2,2,1
Divinity School Library,1,4,1
Graduate New Haven,2,3,1
Cushing/Whitney Medical Library,2,4,1
Koffee,3,2,1
Fussy Coffee,3,3,1
Willoughby's (York Street),3,3,1
Humanities Quadrangle,2,2,1
Tsai Center,1,1,1
Digital Humanities Library,2,2,1
School of Management,1,3,1`;

// Test user's answers
const userAnswer = [1, 2, 2];

// Testing
const studySpaces = parseCSV(mockCSV);
const idealStudySpaces = findIdealStudySpaces(userAnswer, studySpaces);
console.log('Top 4 ideal study spaces:', idealStudySpaces);

// Assertions
const expectedIdealStudySpaces = [
    { Name: "Bass Library", Noise: "1", Distance: "2", Availability: "1", difference: 1 },
    { Name: "Gilmore Music Library", Noise: "1", Distance: "2", Availability: "1", difference: 1 },
    { Name: "William L. Harkness Hall", Noise: "1", Distance: "2", Availability: "1", difference: 1 },
    { Name: "Lillian Goldman Law Library", Noise: "1", Distance: "2", Availability: "1", difference: 1 },
];

if (JSON.stringify(idealStudySpaces) === JSON.stringify(expectedIdealStudySpaces)) {
    console.log("Test passed: Algorithm works as expected.");
} else {
    console.error("Test failed: Algorithm did not return expected results.");
}


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
        // run the algorithm
        ideal = findIdealStudySpaces(answers, studySpaces);
        console.log(ideal);
    }
    displayQuestion();
}

displayQuestion();

prevBtn.addEventListener('click', () => {
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

// when the user finishes answering all the questions, we want to run the algorithm
// and display the top 4 study spaces to the user

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



// 
// Step 1: Track what they answer for each question (1,2,3,4)
// Step 2: Read each line of the study spaces csv file and compare the answers to the attributes of each space
// track the differences between the answers and the attributes
// Keep the top 4 spaces with the least differences
// Step 3: Display the top 4 spaces to the user
