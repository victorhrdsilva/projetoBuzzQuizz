let quizzData, optionsBoard, verifySelected, hitsPercentage, questions, levels, singleQuizz, id
let totalClicks = 0
let points = 0
let objectQuestion = {
    title: '',
    image: '',
    questions: [],
    levels: []
}
const listSerialization = localStorage.getItem("listSerialization")
let listIDQuizzesOfUser = JSON.parse(listSerialization)
let linkQuizzes = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes'
let quizzes = axios.get(linkQuizzes);
let page = document.querySelector(".quizz-list")
quizzes.then(loadQuizzList)


// CARREGA TODOS OS QUIZZES NA API

function loadQuizzList(quizz) {
    quizzData = quizz.data


    if (isNotUndefined(listIDQuizzesOfUser)) {
        page.innerHTML = `
        <div class="all-quizzes">
        <div class="title-quizzes-user">
            <h2>Seus Quizzes</h2>
            <ion-icon onclick="createQuizz()" name="add-circle"></ion-icon>
        </div>
        <div class="row-quizzes row-quizzes-user">

        </div>
        </div>
        `
    } else {
        page.innerHTML = `
        <div class="create-quizz">
            <p>Você não criou nenhum quizz ainda :(</p>
            <button onclick="createQuizz()">Criar Quizz</button>
        </div>
        `
    }

    page.innerHTML += `
    <div class="all-quizzes">
        <h2>Todos os Quizzes</h2>
        <div class="row-quizzes row-quizzes-all">

        </div>
    </div>
    `

    for (let i = 0; i < quizzData.length; i++) {
        let rowQuizzes = document.querySelector(".row-quizzes-all")
        let rowQuizzesUser = document.querySelector(".row-quizzes-user")
        let currentQuizz = quizzData[i]
        if (isNotUndefined(listIDQuizzesOfUser)) {
            for (let j = 0; j < listIDQuizzesOfUser.length; j++) {
                if (currentQuizz.id == listIDQuizzesOfUser[j]) {
                    rowQuizzesUser.innerHTML += `
                    <div onclick="loadQuizzWithID(this)" class="${currentQuizz.id} quizz" style="background-image: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 64.58%, #000000 100%), url('${currentQuizz.image}');">
                        <p>${currentQuizz.title}</p>
                    </div>
                    `
                }
            }
        }

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

function loadPageOfSingleQuizz(element) {
    questions = element.data.questions
    levels = element.data.levels
    page.innerHTML = `
    <div class="quizz-image" style="background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.57), rgba(0, 0, 0, 0.57)), url('${element.data.image}')">
        <p>${element.data.title}</p>
    </div>`
    for (let i = 0; i < questions.length; i++) {
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
    document.querySelector('.quizz-image').scrollIntoView({ block: "start", behavior: "smooth" });
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
    for (let i = 0; i < optionsFalse.length; i++) {
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
    next.scrollIntoView({ block: "start", behavior: "smooth" });
}

function verifyEndGame() {
    if (totalClicks == questions.length) {
        hitsPercentage = points / questions.length * 100;
        hitsPercentage = Math.round(hitsPercentage);
        showResult()
    }
}

function showResult() {
    let userLevel
    for (let i = (levels.length - 1); i >= 0; i--) {
        let minValueLevel = levels[i].minValue;
        if (hitsPercentage >= minValueLevel) {
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

let title, urlImage, questionNumber, questionLevels

function createQuizz() {
    page.classList.add('create-quizz-information')
    page.innerHTML = `
    <div>
        <h2>Comece pelo começo</h2>
    </div>
    <div class="create-quizz-information input">
        <input id="title" type="url" placeholder="Título do seu quizz">
        <input id="url-image" type="text" placeholder="URL da imagem do seu quizz">
        <input id="question-number" type="number" placeholder="Quantidade de perguntas do quizz">
        <input id="question-level" type="number" placeholder="Quantidade de níveis do quizz">
    </div>
    <button onclick="sendInformationsQuizz()" class="create-button">Prosseguir pra criar perguntas</button>`
}

function checkUrl(string) {
    try {
        let url = new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

function sendInformationsQuizz() {
    title = document.getElementById('title').value;
    urlImage = document.getElementById('url-image').value;
    questionLevels = document.getElementById('question-level').value;
    questionNumber = document.getElementById('question-number').value;


    if (title != undefined && urlImage != undefined && questionNumber != undefined && questionLevels != undefined) {
        if (title.length > 20 && title.length < 65 && checkUrl(urlImage) && questionNumber >= 3 && questionLevels >= 2) {
            objectQuestion.title = title;
            objectQuestion.image = urlImage;
            createQuestions()
        } else {
            alert('Preencha os campos corretamente para continuar')
        }
    } else {
        alert('Preencha todos os campos para continuar')
    }
}

// CRIAR QUESTÕES

function createQuestions() {
    page.classList.add('create-quizz-information')
    page.innerHTML = `
            <div>
                <h2>Crie suas perguntas</h2>
            </div>
    `
    for (let i = 1; i <= questionNumber; i++) {
        page.innerHTML += `
            <div class="create-quizz-information input question${i}">
                <div class="question-number">
                    <h2>Pergunta ${i}</h2>
                    <ion-icon onclick="openCreateQuizz(${i})" name="create-outline"></ion-icon>
                </div>
            <div class="closed">
                <input class="question-text" type="text" placeholder="Texto da pergunta ${i}">
                <input class="question-color" type="text" placeholder="Cor de fundo da pergunta ${i}">
                <h2>Resposta correta</h2>
                <input class="correct-answer" type="text" placeholder="Resposta correta">
                <input class="correct-answer-image" type="url" placeholder="URL da imagem">
                <h2>Respostas incorretas</h2>
                <input class="wrong-answer1" type="text" placeholder="Resposta incorreta 1">
                <input class="wrong-answer1-image" type="url" placeholder="URL da imagem 1">
                <input class="space wrong-answer2" type="text" placeholder="Resposta incorreta 2">
                <input class="wrong-answer2-image" type="url" placeholder="URL da imagem 2">
                <input class="space wrong-answer3" type="text" placeholder="Resposta incorreta 3">
                <input class="wrong-answer3-image" type="url" placeholder="URL da imagem 3">
            </div>`
    }
    page.innerHTML += `<button onclick="sendQuestionToValidate()" class="create-button">Prosseguir pra criar níveis</button>`

}

function openCreateQuizz(numberOfQuestion) {
    let questionOpened = document.querySelector('.open')
    let questionToOpen = document.querySelector(`.question${numberOfQuestion}`).querySelector('.closed');
    if (isNotUndefined(questionOpened) && questionOpened != questionToOpen) {
        questionOpened.classList.remove('open')
    }
    questionToOpen.classList.add('open');
}

// VALIDAR E CRIAR O OBJETO DO QUIZZ

let titleOfQuestion, colorOfQuestion, correctAnswer, correctAnswerImage, wrongAnswer1, wrongAnswer1Image, wrongAnswer2, wrongAnswer2Image, wrongAnswer3, wrongAnswer3Image
let sendedQuestions = 0

function isAHexadecimal(hexadecimal) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexadecimal);
}

function isNotUndefined(value) {
    return value !== undefined && value != "" && value !== null
}

function validateInformationQuestion(element) {
    titleOfQuestion = element.querySelector('.question-text').value;
    colorOfQuestion = element.querySelector('.question-color').value;
    correctAnswer = element.querySelector('.correct-answer').value;
    correctAnswerImage = element.querySelector('.correct-answer-image').value;
    wrongAnswer1 = element.querySelector('.wrong-answer1').value;
    wrongAnswer1Image = element.querySelector('.wrong-answer1-image').value;
    wrongAnswer2 = element.querySelector('.wrong-answer2').value;
    wrongAnswer2Image = element.querySelector('.wrong-answer2-image').value;
    wrongAnswer3 = element.querySelector('.wrong-answer3').value;
    wrongAnswer3Image = element.querySelector('.wrong-answer3-image').value;


    if (isNotUndefined(titleOfQuestion) && isNotUndefined(colorOfQuestion) && isNotUndefined(correctAnswer) && isNotUndefined(wrongAnswer1) && isNotUndefined(correctAnswerImage) && isNotUndefined(wrongAnswer1Image)) {
        if (titleOfQuestion.length >= 20 && isAHexadecimal(colorOfQuestion) && checkUrl(correctAnswerImage) && checkUrl(wrongAnswer1Image)) {
            if (wrongAnswer2 == "" && wrongAnswer2Image == "" && wrongAnswer3 == "" && wrongAnswer3Image == "") {
                sendInformationsQuestion(1);
                sendedQuestions++
            } else if (isNotUndefined(wrongAnswer2) && isNotUndefined(wrongAnswer2Image) && checkUrl(wrongAnswer2Image)) {
                if (wrongAnswer3 == "" && wrongAnswer3Image == "") {
                    sendInformationsQuestion(2);
                    sendedQuestions++
                } else if (isNotUndefined(wrongAnswer3) && isNotUndefined(wrongAnswer3Image) && checkUrl(wrongAnswer3Image)) {
                    sendInformationsQuestion(3);
                    sendedQuestions++
                } else {
                    alert("Os dados da resposta errada 2 e 3 não estão preenchidos corretamente")
                    return false
                }
            } else {
                alert("Parece que você deixou alguns dados incompletos, preencha-os corretamente para continuar")
                return false
            }
        } else {
            alert("Preencha todos os dados para continuar");
            return false
        }

    }
}

function sendInformationsQuestion(numberOfWrongAnswer) {
    if (numberOfWrongAnswer === 1) {
        objectQuestion.questions.push({
            title: titleOfQuestion,
            color: colorOfQuestion,
            answers: [
                {
                    text: correctAnswer,
                    image: correctAnswerImage,
                    isCorrectAnswer: true
                },
                {
                    text: wrongAnswer1,
                    image: wrongAnswer1Image,
                    isCorrectAnswer: false
                }
            ]
        }
        )
    } else if (numberOfWrongAnswer === 2) {
        objectQuestion.questions.push({
            title: titleOfQuestion,
            color: colorOfQuestion,
            answers: [
                {
                    text: correctAnswer,
                    image: correctAnswerImage,
                    isCorrectAnswer: true
                },
                {
                    text: wrongAnswer1,
                    image: wrongAnswer1Image,
                    isCorrectAnswer: false
                },
                {
                    text: wrongAnswer2,
                    image: wrongAnswer2Image,
                    isCorrectAnswer: false
                }
            ]
        }
        )
    } else if (numberOfWrongAnswer === 3) {
        objectQuestion.questions.push({
            title: titleOfQuestion,
            color: colorOfQuestion,
            answers: [
                {
                    text: correctAnswer,
                    image: correctAnswerImage,
                    isCorrectAnswer: true
                },
                {
                    text: wrongAnswer1,
                    image: wrongAnswer1Image,
                    isCorrectAnswer: false
                },
                {
                    text: wrongAnswer2,
                    image: wrongAnswer2Image,
                    isCorrectAnswer: false
                },
                {
                    text: wrongAnswer3,
                    image: wrongAnswer3Image,
                    isCorrectAnswer: false
                }
            ]
        }
        )
    }
}

function sendQuestionToValidate() {
    for (let i = 1; i <= questionNumber; i++) {
        let questionToValidate = document.querySelector(`.question${i}`)
        if (validateInformationQuestion(questionToValidate) == false) {
            objectQuestion.questions = []
            sendedQuestions = 0
            break
        }
    }
    if (sendedQuestions == questionNumber) {
        createLevels()
    }
}

// CRIA OS NÍVEIS DO QUIZZ

function createLevels() {
    page.innerHTML = `
            <div>
                <h2>Agora, decida os níveis</h2>
            </div>
    `
    for (let i = 1; i <= questionLevels; i++) {
        page.innerHTML += `
        <div class="create-quizz-information input question${i}">
            <div class="question-number">
                <h2>Nivel ${i}</h2>
                <ion-icon onclick="openCreateQuizz(${i})" name="create-outline"></ion-icon>
            </div>
            <div class="closed level">
                <input class="level-title" type="text" placeholder="Título do nível">
                <input class="min-hit-percentage" type="text" placeholder="% de acerto mínima">
                <input class="url-image-level" type="url" placeholder="URL da imagem do nível">
                <input class="level-description" type="text" placeholder="Descrição do nível">
            </div>
        </div>`
    }
    page.innerHTML += `<button onclick="sendLevelToValidate()" class="create-button">Prosseguir pra criar níveis</button>`
}

// VALIDAR INFORMAÇÕES DE NÍVEIS

let levelTitle, minHitPercentage, urlImageLevel, levelDescription, newQuizzOfUser;
let verifyLevelWith0Percent = false;

function verifyLevel0Percent(element) {
    minHitPercentage = element.querySelector('.min-hit-percentage').value;
    if (minHitPercentage == 0) {
        verifyLevelWith0Percent = true;
    }
}

function validateInformationLevels(element) {
    levelTitle = element.querySelector('.level-title').value;
    minHitPercentage = element.querySelector('.min-hit-percentage').value;
    urlImageLevel = element.querySelector('.url-image-level').value;
    levelDescription = element.querySelector('.level-description').value;

    if (isNotUndefined(levelTitle) && isNotUndefined(levelDescription) && isNotUndefined(urlImageLevel) && isNotUndefined(minHitPercentage)) {
        if (levelTitle.length >= 10 && minHitPercentage >= 0 && minHitPercentage <= 100 && checkUrl(urlImageLevel) && levelDescription.length >= 30) {
            sendInformationsLevel()
        } else {
            alert("Preencha todos os dados corretamente para continuar");
            return false
        }
    } else {
        alert("Preencha todos os dados para continuar");
        return false
    }
}

function sendLevelToValidate() {
    let verifyFinishedLevel = false;
    for (let i = 1; i <= questionLevels; i++) {
        let levelToValidate = document.querySelector(`.question${i}`)
        verifyLevel0Percent(levelToValidate)
    }

    if (verifyLevelWith0Percent) {
        for (let i = 1; i <= questionLevels; i++) {
            let levelToValidate = document.querySelector(`.question${i}`)

            if (validateInformationLevels(levelToValidate) == false) {
                break
            }

            verifyFinishedLevel = true;
        }
    } else {
        alert("Pelo menos um nível deve ter 0 como % de acerto")
    }

    if (verifyFinishedLevel) {
        sendQuizzForAPI()
    }
}

function sendInformationsLevel() {
    objectQuestion.levels.push({
        title: levelTitle,
        image: urlImageLevel,
        text: levelDescription,
        minValue: minHitPercentage
    })
}

let post

function sendQuizzForAPI() {
    post = axios.post(linkQuizzes, objectQuestion)
    post.then(sucessOfCreateQuizz)
}

function loadQuizzWithIDOfUSer(id) {
    singleQuizz = axios.get(`${linkQuizzes}/${id}`)
    document.querySelector('.create-quizz-information').classList.remove('create-quizz-information');
    singleQuizz.then(loadPageOfSingleQuizz)
}

function sucessOfCreateQuizz(element) {
    newQuizzOfUser = element.data
    IDOfNewQuizzOfUser = newQuizzOfUser.id
    if (isNotUndefined(listIDQuizzesOfUser)) {
        listIDQuizzesOfUser.push(IDOfNewQuizzOfUser)
        const newListIDQuizzesOfUserSerialization = JSON.stringify(listIDQuizzesOfUser)
        localStorage.setItem("listSerialization", newListIDQuizzesOfUserSerialization)
    } else {
        const newListIDQuizzesOfUser = [IDOfNewQuizzOfUser]
        const newListIDQuizzesOfUserSerialization = JSON.stringify(newListIDQuizzesOfUser)
        localStorage.setItem("listSerialization", newListIDQuizzesOfUserSerialization)
    }
    page.innerHTML = `
        <div>
            <h2>Seu quizz está pronto!</h2>
        </div>
        <div class="img-sucess-quizz quizz" style="background-image: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 64.58%, #000000 100%), url('${urlImage}');">
            <p>${title}</p>
        </div>
        <div class="buttons">
            <button onclick="loadQuizzWithIDOfUSer(${IDOfNewQuizzOfUser})" class="reset">Acessar Quizz</button>
            <button onclick="home()" class="home">Voltar pra home</button>
        </div>
    `
}