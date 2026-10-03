// State Management
let mainWallet = 0;
let playWallet = 10;
let currentStake = 10;
let selectedCartelas = [];
let gameId = 1;
let countdown = 49;
let timerInterval = null;

// Page Initialization
window.onload = function() {
    generateCartelaGrid();
    setupBingoBoard();
    startCountdown();
    updateUIWalletValues();
};

// 1. Generate 1 to 600 Cartelas
function generateCartelaGrid() {
    const grid = document.getElementById("cartela-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    for (let i = 1; i <= 600; i++) {
        const box = document.createElement("div");
        box.className = "cartela-box";
        box.innerText = i;
        box.onclick = function() { selectCartela(i, box); };
        grid.appendChild(box);
    }
}

// 2. Handle Cartela Selection (Max 3)
function selectCartela(num, element) {
    if (selectedCartelas.includes(num)) {
        selectedCartelas = selectedCartelas.filter(id => id !== num);
        element.classList.remove("selected");
    } else {
        if (selectedCartelas.length >= 3) {
            alert("ቢበዛ መምረጥ የሚችሉት 3 ካርቴላ ብቻ ነው!");
            return;
        }
        selectedCartelas.push(num);
        element.classList.add("selected");
    }
    const countEl = document.getElementById("selected-count");
    if (countEl) countEl.innerText = selectedCartelas.length;
}

// 3. Tab Switching Navigation Logic
function switchTab(tabName) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    // Remove active class from buttons
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    
    if (tabName === 'game') {
        // If 'Game' is clicked, show selection screen or live screen depending on countdown
        if (countdown > 0) {
            document.getElementById("selection-screen").classList.remove("hidden");
        } else {
            document.getElementById("game-screen").classList.remove("hidden");
        }
        document.getElementById("btn-game").classList.add("active");
    } else {
        const activeScreen = document.getElementById(${tabName}-screen);
        const activeBtn = document.getElementById(btn-${tabName});
        if (activeScreen) activeScreen.classList.remove("hidden");
        if (activeBtn) activeBtn.classList.add("active");
    }
}

// 4. Countdown Logic (49 seconds)
function startCountdown() {
    countdown = 49;
    const timerEl = document.getElementById("countdown");
    if (timerEl) timerEl.innerText = countdown + "s";
    
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        countdown--;
        if (timerEl) timerEl.innerText = countdown + "s";
        
        if (countdown <= 0) {
            clearInterval(timerInterval);
            transitionToBingoGame();
        }
    }, 1000);
}

// 5. Switch Screen when Timer Hits 0
function transitionToBingoGame() {
    const selectionScreen = document.getElementById("selection-screen");
    const gameScreen = document.getElementById("game-screen");
    
    if (selectionScreen) selectionScreen.classList.add("hidden");
    if (gameScreen) gameScreen.classList.remove("hidden");
    
    const gameIdEl = document.getElementById("game-id");
    if (gameIdEl) gameIdEl.innerText = String(gameId).padStart(4, '0');
    
    renderActiveMatrices();
    startCallingNumbers();
}

// 6. Generate 5x5 Matrix for selected cartelas
function renderActiveMatrices() {
    const container = document.getElementById("active-cartelas-display");
    if (!container) return;
    container.innerHTML = "";
    
    if (selectedCartelas.length === 0) {
        container.innerHTML = "<p style='color:#ff3b30; text-align:center; font-weight:bold;'>ምንም ካርቴላ አልመረጡም! እባክዎ ቀጣዩን ጨዋታ ይጠብቁ።</p>";
        return;
    }
	selectedCartelas.forEach(id => {
        const wrap = document.createElement("div");
        wrap.style.marginTop = "15px";
        wrap.innerHTML = <h4 style='color:#ffcc00; margin:5px 0;'>📋 የመረጡት ካርቴላ #${id}</h4>;
        
        const matrix = document.createElement("div");
        matrix.className = "matrix-5x5";
        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement("div");
            cell.className = "matrix-cell";
            cell.innerText = Math.floor(Math.random() * 75) + 1;
            matrix.appendChild(cell);
        }
        wrap.appendChild(matrix);
        container.appendChild(wrap);
    });
}

// 7. Initialize Board Columns Structure
function setupBingoBoard() {
    const cols = {
        "B": { start: 1, end: 15 },
        "I": { start: 16, end: 30 },
        "N": { start: 31, end: 45 },
        "G": { start: 46, end: 60 },
        "O": { start: 61, end: 75 }
    };
    
    for (let key in cols) {
        const colEl = document.getElementById(col-${key});
        if (colEl) {
            colEl.innerHTML = "";
            for (let i = cols[key].start; i <= cols[key].end; i++) {
                colEl.innerHTML += <span id="num-${i}">${i}</span>;
            }
        }
    }
}

// 8. Simulation for calling bingo numbers
function startCallingNumbers() {
    let pool = Array.from({length: 75}, (_, i) => i + 1);
    let calledCount = 0;
    const liveBallEl = document.getElementById("live-ball-screen");
    
    let callInterval = setInterval(() => {
        if (pool.length === 0 || calledCount >= 10) { 
            clearInterval(callInterval);
            resetToNextGame();
            return;
        }
        
        let randIndex = Math.floor(Math.random() * pool.length);
        let num = pool.splice(randIndex, 1)[0];
        calledCount++;
        
        let letter = "";
        if (num <= 15) letter = "B";
        else if (num <= 30) letter = "I";
        else if (num <= 45) letter = "N";
        else if (num <= 60) letter = "G";
        else letter = "O";
        
        if (liveBallEl) liveBallEl.innerText = ${letter} - ${num};
        
        let boardNum = document.getElementById(num-${num});
        if (boardNum) boardNum.className = "called-num";
        
    }, 3000); 
}

function resetToNextGame() {
    setTimeout(() => {
        gameId++;
        selectedCartelas = [];
        const countEl = document.getElementById("selected-count");
        if (countEl) countEl.innerText = "0";
        
        document.getElementById("game-screen").classList.add("hidden");
        document.getElementById("selection-screen").classList.remove("hidden");
        
        document.querySelectorAll(".called-num").forEach(el => el.className = "");
        generateCartelaGrid();
        startCountdown();
    }, 4000);
}

function updateUIWalletValues() {
    // Syncs the hardcoded values across fields safely
    document.getElementById("top-main-wallet").innerText = mainWallet;
    document.getElementById("top-play-wallet").innerText = playWallet;
    document.getElementById("wallet-main").innerText = mainWallet;
    document.getElementById("wallet-play").innerText = playWallet;
    document.getElementById("prof-main").innerText = mainWallet;
    document.getElementById("prof-play").innerText = playWallet;
}