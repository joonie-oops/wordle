const wordleAttempt = document.querySelectorAll('.try');
const loadingAnimation = document.querySelector('.loading-animation');
let currTryIndex = 0;
let currTryBlock = wordleAttempt[currTryIndex];
let currTryPointer = -1;
let currTrySquare;
let gameOver = false;
let answerWord = '';

document.addEventListener("keyup", async function (event) {
    if (gameOver) {
        return;
    }

    if (isAlpha(event.key)) {
        moveForwardPointer();
        currTrySquare.innerText = event.key.toUpperCase();

    } else if (event.key === 'Enter' && currTryPointer === 4) {
        addLoadingAnimation();
        const condition = await checkAnswerValid();
        removeLoadingAnimation();
        if (condition) {
            checkWordMatch();
            moveToNextArray();
        } else {
            addAnimationForWrongWord();
        }
    } else if (event.key === 'Backspace') {
        moveBackPointer();
    }
})

function isAlpha(char) {
    const re = /^[A-Za-z]$/;
    return re.test(char);
}

function moveForwardPointer() {
    if (currTryPointer <= 3) {
        currTryPointer++;
        updateSquare();
    }
}

//Must call below function when pointer changes
function updateSquare() {
    currTrySquare = currTryBlock.children[currTryPointer];
}

function moveBackPointer() {
    if (currTrySquare === undefined) {
        return;
    }
    currTrySquare.innerText = '';
    if (currTryPointer > 0) {
        currTryPointer--;
        updateSquare();
    } else {
        currTryPointer = -1;
    }
}

function moveToNextArray() {
    currTryIndex++;
    checkGameOver();
    currTryPointer = -1;
    currTryBlock = wordleAttempt[currTryIndex];
    updateSquare();
}

function checkGameOver() {
    if (currTryIndex > 5) {
        alert("GAME OVER!");
        currTryIndex = 0;
        gameOver = true;
    }
}

function userWordToString() {
    let testWord = '';
    for (let i = 0; i < currTryBlock.children.length; i++) {
        testWord += currTryBlock.children[i].innerText;
    }
    return testWord;
}

function checkWordMatch() {
    const myStrWord = userWordToString();
    const wordCountObject = makeWordCountObject(answerWord);

    for (let i = 0; i < myStrWord.length; i++) {
        currTryBlock.children[i].style.backgroundColor = '#888';
        currTryBlock.children[i].style.color = "white";
        if (answerWord[i] === myStrWord[i].toLowerCase()) {
            currTryBlock.children[i].style.backgroundColor = 'darkgreen';
            wordCountObject[myStrWord[i].toLowerCase()] -= 1;
            continue;
        }
    }

    for (let i = 0; i < myStrWord.length; i++) {
        if (answerWord.includes(myStrWord[i].toLowerCase())) {
            console.log(wordCountObject);
            if (wordCountObject[myStrWord[i].toLowerCase()] > 0) {
                currTryBlock.children[i].style.backgroundColor = 'goldenrod';
                wordCountObject[myStrWord[i].toLowerCase()] -= 1;
            }
        }
    }

    if (winCondition()) {
        const title = document.querySelector('.title');
        title.innerText = 'You Win!';
        title.classList.add('rainbow');
    }
}

function winCondition() {
    return userWordToString().toLowerCase() === answerWord;
}


async function retrieveWord() {
    const promise = await fetch('https://words.dev-apis.com/word-of-the-day');
    const processingPromise = await promise.json();
    answerWord = processingPromise.word;
}

addLoadingAnimation();
retrieveWord();
removeLoadingAnimation();

function makeWordCountObject(word) {
    let testWord = word.split('');
    let wordReduced = testWord.reduce((acc, curr) => {
        if (!(curr in acc)) {
            acc[curr] = 0;
        }
        acc[curr]++;
        return acc;
    }, {})
    return wordReduced;
}

async function checkAnswerValid() {
    let userWord = userWordToString();
    const response = await fetch('https://words.dev-apis.com/validate-word', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "word": userWord })
    });

    const returnedResponse = await response.json();
    return returnedResponse.validWord;
}

function addAnimationForWrongWord() {
    for (let i = 0; i < currTryBlock.children.length; i++) {
        currTryBlock.children[i].classList.add('wrongWord');
        currTryBlock.children[i].addEventListener('animationend', function () {
            currTryBlock.children[i].classList.remove('wrongWord');
        })
    }
}

function addLoadingAnimation() {
    loadingAnimation.classList.add('showVisibility');
}

function removeLoadingAnimation() {
    loadingAnimation.classList.remove('showVisibility');
}