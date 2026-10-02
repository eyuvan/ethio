let selectedCards = [];
let countdownValue = 49;
let gameIdCounter = 1;
let timerInterval;

function startAppInit() {
    const container = document.getElementById('cards-container');
    if (container) {
        container.innerHTML = '';
        for (let i = 1; i <= 600; i++) {
            let card = document.createElement('div');
            card.classList.add('card-box');
            card.innerText = i;
            
            // የነበረው ስህተት እዚህ ጋር 'i' በመተካት ተስተካክሏል
            card.onclick = function() { selectCard(card, i); };
            
            container.appendChild(card);
        }
    }
    setupBingoBoard();
    startCountdown();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAppInit);
} else {
    startAppInit();
}

try {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
} catch(e) { console.log("Telegram bypassed"); }

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

function startCountdown() {
    const timerElement = document.getElementById('timer');
    if(!timerElement) return;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        countdownValue--;
        timerElement.innerText = countdownValue;
        
        if (countdownValue <= 0) {
            clearInterval(timerInterval);
            startBingoGame();
        }
    }, 1000);
}

function forceStartGame() {
    if(selectedCards.length === 0) {
        alert("እባክዎ መጀመሪያ ቢያንስ 1 ካርቴላ ይምረጡ!");
        return;
    }
    clearInterval(timerInterval);
    startBingoGame();
}

function startBingoGame() {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-id').innerText = String(gameIdCounter).padStart(4, '0');
    
    generateUserMatrices();
    simulateBingoCalls();
}

function setupBingoBoard() {
    const columns = {
        'B': { min: 1, max: 15, el: document.getElementById('col-B') },
        'I': { min: 16, max: 30, el: document.getElementById('col-I') },
        'N': { min: 31, max: 45, el: document.getElementById('col-N') },
        'G': { min: 46, max: 60, el: document.getElementById('col-G') },
        'O': { min: 61, max: 75, el: document.getElementById('col-O') }
    };

    for (let key in columns) {
        if (!columns[key].el) continue;
        columns[key].el.innerHTML = '';
        for (let i = columns[key].min; i <= columns[key].max; i++) {
            let numSpan = document.createElement('span');
            numSpan.id = num-${i};
            numSpan.innerText = i;
            columns[key].el.appendChild(numSpan);
        }
    }
}

function generateUserMatrices() {
    const container = document.getElementById('user-matrices-container');
    if(!container) return;
    container.innerHTML = '';

    selectedCards.forEach(cardNum => {
        let title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.margin = '10px 0 5px 0';
        title.innerText = ካርቴላ #${cardNum};
        container.appendChild(title);

        let matrixDiv = document.createElement('div');
        matrixDiv.classList.add('bingo-matrix');

        let bNums = getRandomUniqueNumbers(1, 15, 5);
        let iNums = getRandomUniqueNumbers(16, 30, 5);
        let nNums = getRandomUniqueNumbers(31, 45, 5);
        let gNums = getRandomUniqueNumbers(46, 60, 5);
        let oNums = getRandomUniqueNumbers(61, 75, 5);
		for (let row = 0; row < 5; row++) {
            let rowNums = [bNums[row], iNums[row], nNums[row], gNums[row], oNums[row]];
            rowNums.forEach((num, colIndex) => {
                let cell = document.createElement('div');
                cell.classList.add('matrix-cell');
                if (row === 2 && colIndex === 2) {
                    cell.classList.add('free-space');
                    cell.innerText = "FREE";
                } else {
                    cell.innerText = num;
                    cell.id = card-${cardNum}-${num};
                }
                matrixDiv.appendChild(cell);
            });
        }
        container.appendChild(matrixDiv);
    });
}

// ልዩ ቁጥር ማመንጫ
function getRandomUniqueNumbers(min, max, count) {
    let arr = [];
    while(arr.length < count) {
        let r = Math.floor(Math.random() * (max - min + 1)) + min;
        if(!arr.includes(r)) arr.push(r);
    }
    return arr;
}

function simulateBingoCalls() {
    let allNumbers = Array.from({length: 75}, (_, i) => i + 1);
    let callInterval = setInterval(() => {
        if (allNumbers.length === 0) {
            clearInterval(callInterval);
            return;
        }
        let randomIndex = Math.floor(Math.random() * allNumbers.length);
        let calledNum = allNumbers.splice(randomIndex, 1);
        
        let letter = '';
        if (calledNum <= 15) letter = 'B';
        else if (calledNum <= 30) letter = 'I';
        else if (calledNum <= 45) letter = 'N';
        else if (calledNum <= 60) letter = 'G';
        else letter = 'O';

        const callScreen = document.getElementById('current-call');
        if(callScreen) callScreen.innerText = ${letter} - ${calledNum};
        
        let boardCell = document.getElementById(num-${calledNum});
        if (boardCell) boardCell.classList.add('called-active');

        selectedCards.forEach(cardNum => {
            let userCell = document.getElementById(card-${cardNum}-${calledNum});
            if (userCell) {
                userCell.style.backgroundColor = '#e67e22';
                userCell.style.color = 'white';
            }
        });
    }, 3000);
}

function switchTab(tabName) {
    const tabs = ['game-tab', 'wallet-tab', 'history-tab', 'profile-tab'];
    const buttons = ['btn-game', 'btn-wallet', 'btn-history', 'btn-profile'];

    tabs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.classList.remove('active-tab');
    });

    const targetTab = document.getElementById(${tabName}-tab);
    const targetBtn = document.getElementById(btn-${tabName});
    
    if(targetTab) targetTab.classList.remove('hidden');
    if(targetBtn) targetBtn.classList.add('active-tab');
}