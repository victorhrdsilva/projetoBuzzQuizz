let quizzData, optionsBoard, verifySelected, porcentageOfHits, questions
let totalClicks = 0
let points = 0
let linkQuizzes = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes'
let quizzes = axios.get(linkQuizzes);
let page = document.querySelector(".quizz-list")
quizzes.then(loadQuizzList)



function loadQuizzList(quizz) {
    quizzData = quizz.data

    page.innerHTML = `
    <div class="create-quizz">
        <p>Você não criou nenhum quizz ainda :(</p>
        <button>Criar Quizz</button>
    </div>
    <div class="all-quizzes">
        <h2>Todos os Quizzes</h2>
        <div class="row-quizzes">
                    
        </div>
    </div>
        `
    for (let i = 0; i < quizzData.length; i++) {
        let rowQuizzes = document.querySelector(".row-quizzes")
        let currentQuizz = quizzData[i]
        rowQuizzes.innerHTML += `
        <div onclick="loadQuizzWithID(this)" class="${currentQuizz.id} quizz" style="background-image: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 64.58%, #000000 100%), url('${currentQuizz.image}');">
            <p>${currentQuizz.title}</p>
        </div>
        `
        }
}

function loadQuizzWithID(element) {
    let id = element.classList[0]
    let singleQuizz = axios.get(`${linkQuizzes}/${id}`)
    singleQuizz.then(loadPageOfSingleQuizz)
}


function comparator() { 
	return Math.random() - 0.5; 
}

function loadPageOfSingleQuizz (element) {
    console.log(element)
    questions = element.data.questions
    page.innerHTML = `
    <div class="quizz-image" style="background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.57), rgba(0, 0, 0, 0.57)), url('${element.data.image}')">
        <p>${element.data.title}</p>
    </div>`
    for(let i = 0; i < questions.length; i++) {
        let question = questions[i]
        let answers = question.answers
        answers.sort(comparator);
        page.innerHTML += `
        <div class="question-board">
            <div class="question" style="background-color: ${question.color};">
                <p>${question.title}</p>
            </div>
            <div class="question${i} options-board">
                <div class="question-board-verify-answer hidden">
                </div>
            </div>
            <div class="pending">
            </div>
        </div>`
        optionsBoard = document.querySelector(`.question${i}`)
        for (let j = 0; j < answers.length; j++) {
            let answer = answers[j]
            optionsBoard.innerHTML += `
            <div class="${answer.isCorrectAnswer} option" onclick="selectOption(this)">
                <img src="${answer.image}">
                <p>${answer.text}</p>
            </div>`
        }
    }
}

function selectOption(element) {
    verifySelected = element.classList.contains('selected');
    console.log(verifySelected)
    if (!verifySelected) {
        totalClicks++;
    }

    element.classList.add('selected')
    let parentElement = element.parentNode
    parentElement.querySelector('.hidden').classList.remove('hidden')
    let optionsFalse = parentElement.querySelectorAll('.false')
    for(let i = 0; i < optionsFalse.length; i++) {
        optionsFalse[i].classList.add('color')
    }
    parentElement.querySelector('.true').classList.add('color')
    
    let verifyCorrectAnswer = element.classList.contains('true');
    if (verifyCorrectAnswer) {
        points++;
    };

    setTimeout(nextQuestion, 2000)
    verifyEndGame()
}

function nextQuestion() {
    let next = document.querySelector('.pending')
    next.classList.remove('pending');
    next.querySelector('.pending')
    next.scrollIntoView();
}

function verifyEndGame() {
    if (totalClicks == questions.length) {
        porcentageOfHits = points/questions.length*100;
        porcentageOfHits = Math.round(porcentageOfHits);
        showResult ()
    }
}

function showResult () {

}
