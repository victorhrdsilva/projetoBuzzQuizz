let quizzData, optionsBoard, verifySelected, hitsPercentage, questions, levels, singleQuizz, id
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
        <button onclick="createQuizz()">Criar Quizz</button>
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
    id = element.classList[0]
    singleQuizz = axios.get(`${linkQuizzes}/${id}`)
    singleQuizz.then(loadPageOfSingleQuizz)
}


function comparator() { 
	return Math.random() - 0.5; 
}

function loadPageOfSingleQuizz (element) {
    questions = element.data.questions
    levels = element.data.levels
    console.log(levels)
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
    document.querySelector('.quizz-image').scrollIntoView({block: "start", behavior: "smooth"});
}

function selectOption(element) {
    verifySelected = element.classList.contains('selected');
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
    next.scrollIntoView({block: "start", behavior: "smooth"});
}

function verifyEndGame() {
    if (totalClicks == questions.length) {
        hitsPercentage = points/questions.length*100;
        hitsPercentage = Math.round(hitsPercentage);
        showResult ()
    }
}

function showResult () {
    let userLevel
    for(let i = (levels.length - 1); i >= 0; i--) {
        let minValueLevel = levels[i].minValue;
        if (hitsPercentage >= minValueLevel){
            userLevel = levels[i];
        }
    }
    page.innerHTML += `
    <div class="question-board result hidden">
        <div class="question result" style="background-color: red;">
            <p>${hitsPercentage}% de acerto: ${userLevel.title}</p>
        </div>
        <div class="result-box">
            <img
                src="${userLevel.image}">
            <p>${userLevel.text}</p>
        </div>
    </div>
    <div class="buttons">
        <button onclick="resetQuizz()" class="reset">Reiniciar Quizz</button>
        <button onclick="home()" class="home">Voltar para home</button>
    </div>`

    let result = document.querySelector('.result')
    result.classList.remove('hidden')
}

function resetQuizz() {
    singleQuizz = axios.get(`${linkQuizzes}/${id}`)
    singleQuizz.then(loadPageOfSingleQuizz)
    totalClicks = 0
    hitsPercentage = 0
    points = 0
    userLevel = undefined
}

function home() {
    window.location.reload()
}

// CRIAR QUIZZ 

let title, urlImage, questionNumber, questionNivel

function createQuizz() {
    page.classList.add('crate-quizz-information')
    page.innerHTML = `
    <div>
        <h2>Comece pelo começo</h2>
    </div>
    <div class="crate-quizz-information input">
        <input id="title" type="url" placeholder="Título do seu quizz">
        <input id="url-image" type="text" placeholder="URL da imagem do seu quizz">
        <input id="question-number" type="number" placeholder="Quantidade de perguntas do quizz">
        <input id="question-nivel" type="number" placeholder="Quantidade de níveis do quizz">
    </div>
    <button onclick="sendInformationsQuizz()" class="create-button">Prosseguir pra criar perguntas</button>`
}

function sendInformationsQuizz(){
    title = document.getElementById('title').value;
    urlImage = document.getElementById('url-image').value;
    questionNivel = document.getElementById('question-nivel').value;
    questionNumber = document.getElementById('question-number').value;

    function checkUrl(string) {
        try {
         let url = new URL(string);
         return true;
       } catch(err) {
           return false;
       }
     }

    checkUrl(urlImage)

    if(title != undefined && urlImage != undefined && questionNumber != undefined && questionNivel != undefined) {
        if (title.length > 20 && title.length < 65 && checkUrl(urlImage) && questionNumber >= 3 && questionNivel >= 2) {
        } else {
            alert('Preencha os campos corretamente para continuar')
        }
    } else {
        alert('Preencha todos os campos para continuar')
    }
}

function createQuestions () {
    page = `
    <div>
        <h2>Crie suas perguntas</h2>
    </div>
    <div class="crate-quizz-information input">
        <h2>Pergunta 1</h2>
        <input id="question1" type="text" placeholder="Texto da pergunta">
        <input id="question1-color" type="text" placeholder="Cor de fundo da pergunta">
        <h2>Resposta correta</h2>
        <input id="correct-answer" type="text" placeholder="Resposta correta">
        <input id="correct-answer-image" type="url" placeholder="URL da imagem">
        <h2>Respostas incorretas</h2>
        <input id="wrong-answer1" type="text" placeholder="Resposta incorreta 1">
        <input id="wrong-answer1-image" type="url" placeholder="URL da imagem 1">
        <input class="space"  id="wrong-answer2" type="text" placeholder="Resposta incorreta 2">
        <input id="wrong-answer2-image" type="url" placeholder="URL da imagem 2">
        <input class="space" id="wrong-answer3" type="text" placeholder="Resposta incorreta 3">
        <input id="wrong-answer3-image" type="url" placeholder="URL da imagem 3">
    </div>
    <div class="crate-quizz-information input closed">
        <h2>Pergunta 2</h2>
        <ion-icon function="openCreateQuizz(2)" name="create-outline"></ion-icon>
    </div>
    <div class="crate-quizz-information input closed">
        <h2>Pergunta 3</h2>
        <ion-icon function="openCreateQuizz(3)" name="create-outline"></ion-icon>
    </div>
    `

    if(questionNumber > 3) {
        for (let i = 4; i < questionNumber; i++) {
            page += `
            <div class="crate-quizz-information input closed">
                <h2>Pergunta ${i}</h2>
                <ion-icon function="openCreateQuizz(${i})" name="create-outline"></ion-icon>
            </div>`
        }
    }

    page += `<button onclick="sendInformationsQuestion()" class="create-button">Prosseguir pra criar níveis</button>`

}