// የቴሌግራም ዌብ አፕን መክፈቻ
const tg = window.Telegram.WebApp;
tg.expand();

let selectedCards = [];
let countdownValue = 49;
let gameIdCounter = 1;

// 1. የ 1 - 600 ካርቴላዎችን መፍጠር
const container = document.getElementById('cards-container');
for (let i = 1; i <= 600; i++) {
    let card = document.createElement('div');
    card.classList.add('card-box');
    card.innerText = i;
    card.onclick = () => selectCard(card, i);
    container.appendChild(card);
}

function selectCard(element, num) {
    if (selectedCards.includes(num)) {
        selectedCards = selectedCards.filter(id => id !== num);
        element.classList.remove('selected');
    } else {
        if (selectedCards.length < 3) {
            selectedCards.push(num);
            element.classList.add('selected');
        } else {
            alert("ቢበዛ መምረጥ የሚችሉት 3 ካርቴላ ብቻ ነው!");
        }
    }
}

// 2. Countdown Timer እና ወደ ቢንጎ ቦርድ መቀየር
const timerElement = document.getElementById('timer');
let timerInterval = setInterval(() => {
    countdownValue--;
    timerElement.innerText = countdownValue;
    
    if (countdownValue <= 0) {
        clearInterval(timerInterval);
        startBingoGame();
    }
}, 1000);

function startBingoGame() {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-id').innerText = String(gameIdCounter).padStart(4, '0');
    setupBingoBoard();
    simulateBingoCalls();
}

// 3. የቢንጎ ቁጥሮችን በየፈርጁ መዘርዘር (B:1-15, I:16-30, ወዘተ)
function setupBingoBoard() {
    const columns = {
        'B': { min: 1, max: 15, el: document.getElementById('col-B') },
        'I': { min: 16, max: 30, el: document.getElementById('col-I') },
        'N': { min: 31, max: 45, el: document.getElementById('col-N') },
        'G': { min: 46, max: 60, el: document.getElementById('col-G') },
        'O': { min: 61, max: 75, el: document.getElementById('col-O') }
    };

    for (let key in columns) {
        columns[key].el.innerHTML = '';
        for (let i = columns[key].min; i <= columns[key].max; i++) {
            let numSpan = document.createElement('span');
            numSpan.id = num-${i};
            numSpan.innerText = i;
            columns[key].el.appendChild(numSpan);
        }
    }
}

// 4. የቁጥሮች ጥሪዎችን ማስመስል (Simulation)
function simulateBingoCalls() {
    let allNumbers = Array.from({length: 75}, (_, i) => i + 1);
    // በየ 3 ሰከንዱ አዲስ ቁጥር መጥራት
    let callInterval = setInterval(() => {
        if (allNumbers.length === 0) {
            clearInterval(callInterval);
            return;
        }
        let randomIndex = Math.floor(Math.random() * allNumbers.length);
        let calledNum = allNumbers.splice(randomIndex, 1)[0];
        
        let letter = '';
        if (calledNum <= 15) letter = 'B';
        else if (calledNum <= 30) letter = 'I';
        else if (calledNum <= 45) letter = 'N';
        else if (calledNum <= 60) letter = 'G';
        else letter = 'O';

        document.getElementById('current-call').innerText = ${letter} - ${calledNum};
        
        let cell = document.getElementById(num-${calledNum});
        if (cell) cell.classList.add('called-active');
    }, 3000);
}

// 5. Navigation Tabs መቀያየሪያ
function switchTab(tabName) {
    ['game-screen', 'wallet-screen', 'history-screen', 'profile-screen'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
    document.getElementById(${tabName}-screen).classList.remove('hidden');
}