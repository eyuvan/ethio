document.addEventListener("DOMContentLoaded", () => {
    // 1. UI Elements Mapping
    const cardsGrid = document.getElementById("cards-grid");
    const bingoCardContainer = document.getElementById("bingo-card-container");
    const bingoCardGrid = document.getElementById("bingo-card-grid");
    const timerElement = document.getElementById("countdown-timer");
    const screen1 = document.getElementById("screen-1");
    const screen2 = document.getElementById("screen-2");
    
    // Live Dashboard Info Fields
    const gameIdElement = document.getElementById("game-id");
    const liveBetElement = document.getElementById("live-bet");
    const liveDerashElement = document.getElementById("live-derash");
    const liveStakeElement = document.getElementById("live-stake");
    const calledCountElement = document.getElementById("called-count");
    const callerScreen = document.getElementById("caller-screen");
    const topBar = document.getElementById("top-bar");
    const topPlayWallet = document.getElementById("top-play-wallet");

    const sections = {
        game: document.getElementById("game-section"),
        wallet: document.getElementById("wallet-section"),
        history: document.getElementById("history-section"),
        profile: document.getElementById("profile-section")
    };
    const navButtons = document.querySelectorAll(".nav-btn");

    const columnsData = {
        B: document.getElementById("col-B"),
        I: document.getElementById("col-I"),
        N: document.getElementById("col-N"),
        G: document.getElementById("col-G"),
        O: document.getElementById("col-O")
    };

    // 2. Local App Engine Configurations
    let selectedTicket = null;
    let countdownValue = 49;
    let gameIdCounter = 1;
    let totalCalledNumbersCount = 0;
    let currentStakeAmount = 10; // Change to 20 for custom testing configurations
    let simulatedPlayersCount = Math.floor(Math.random() * 25) + 15; // Simulates 15 - 40 players online

    // Requirement 4: 10 Birr Bonus instantly given to play wallet upon loading
    topPlayWallet.innerText = "10";

    // 3. Generate 1 to 600 Card Blocks Layout Loop
    for (let i = 1; i <= 600; i++) {
        const cardBox = document.createElement("div");
        cardBox.className = "card-box";
        cardBox.innerText = i;
        cardBox.addEventListener("click", () => {
            document.querySelectorAll(".card-box").forEach(el => el.classList.remove("selected"));
            cardBox.classList.add("selected");
            selectedTicket = i;
            liveBetElement.innerText = "1"; // User bet selection card count 
            
            generate5x5MatrixCard();
        });
        cardsGrid.appendChild(cardBox);
    }

    // 4. Matrix Numbers Custom Allocator
    function generate5x5MatrixCard() {
        bingoCardGrid.innerHTML = "";
        bingoCardContainer.style.display = "block";

        const getUniqueRandomRange = (min, max, count) => {
            let list = [];
            while (list.length < count) {
                let r = Math.floor(Math.random() * (max - min + 1)) + min;
                if (!list.includes(r)) list.push(r);
            }
            return list;
        };

        const bColumn = getUniqueRandomRange(1, 15, 5);
        const iColumn = getUniqueRandomRange(16, 30, 5);
        const nColumn = getUniqueRandomRange(31, 45, 5);
        const gColumn = getUniqueRandomRange(46, 60, 5);
        const oColumn = getUniqueRandomRange(61, 75, 5);

        for (let row = 0; row < 5; row++) {
            const cellsRow = [bColumn[row], iColumn[row], nColumn[row], gColumn[row], oColumn[row]];
            cellsRow.forEach((num, colIdx) => {
                const cell = document.createElement("div");
                cell.className = "bingo-cell";
                if (row === 2 && colIdx === 2) {
                    cell.innerText = "FREE";
                    cell.classList.add("free-space");
                } else {
                    cell.innerText = num;
                }
                bingoCardGrid.appendChild(cell);
            });
        }
    }

    // 5. Corrected Master Ranges Map Grid Initialization
    const initMasterBoardColumns = () => {
        const structuralRanges = {
            B: { start: 1, end: 15 },
            I: { start: 16, end: 30 },
            N: { start: 31, end: 45 },
            G: { start: 46, end: 60 },
            O: { start: 61, end: 75 }
        };
        
        for (let col in structuralRanges) {
            columnsData[col].innerHTML = "";
            let start = structuralRanges[col].start;
            let end = structuralRanges[col].end;
            for (let i = start; i <= end; i++) {
                const item = document.createElement("div");
                item.className = "board-item";
                item.id = `master-num-${i}`;
                item.innerText = i;
                columnsData[col].appendChild(item);
            }
        }
    };
    initMasterBoardColumns();

    // 6. Ticking Down Countdown Sequence
    let countdownInterval = setInterval(() => {
        countdownValue--;
        timerElement.innerText = countdownValue;
        if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            transitionToLiveScreenMode();
        }
    }, 1000);

    // 7. Swap View Modules (Requirement 1)
    function transitionToLiveScreenMode() {
        topBar.style.display = "none"; // Hide countdown header layout module 
        screen1.style.display = "none";
        screen2.style.display = "block";

        gameIdElement.innerText = String(gameIdCounter).padStart(4, '0');
        liveStakeElement.innerText = currentStakeAmount;
        
        // Calculate Derash formula parameter values cleanly
        let calculatedDerashPayout = 0;
        if (currentStakeAmount === 10) {
            calculatedDerashPayout = simulatedPlayersCount * 8;
        } else if (currentStakeAmount === 20) {
            calculatedDerashPayout = simulatedPlayersCount * 16;
        } else {
            calculatedDerashPayout = simulatedPlayersCount * (currentStakeAmount * 0.8);
        }
        liveDerashElement.innerText = calculatedDerashPayout;

        triggerLiveBingoCallerEngine();
    }

    // 8. Female Voice Reader Utterance Engine (Requirement 3)
    function speakBingoNumberFemaleVoice(textToSpeak) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            const voices = window.speechSynthesis.getVoices();
            
            // Query match profiles mapping common female voices safely
            const femaleVoice = voices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('zira') || 
                voice.name.toLowerCase().includes('google uk english female')
            );
            if (femaleVoice) { utterance.voice = femaleVoice; }
            utterance.rate = 1.0; 
            window.speechSynthesis.speak(utterance);
        }
    }
    if ('speechSynthesis' in window) { window.speechSynthesis.getVoices(); }

    // 9. Automated Interval Lottery Game Calls Engine
    function triggerLiveBingoCallerEngine() {
        let executionPool = [];
        for (let i = 1; i <= 75; i++) executionPool.push(i);
        executionPool.sort(() => Math.random() - 0.5);

        let gameLoopInterval = setInterval(() => {
            if (executionPool.length === 0) {
                clearInterval(gameLoopInterval);
                callerScreen.innerText = "OVER";
                return;
            }

            let extractedNum = executionPool.pop();
            let letterPrefix = "";

            if (extractedNum >= 1 && extractedNum <= 15) letterPrefix = "B";
            else if (extractedNum >= 16 && extractedNum <= 30) letterPrefix = "I";
            else if (extractedNum >= 31 && extractedNum <= 45) letterPrefix = "N";
            else if (extractedNum >= 46 && extractedNum <= 60) letterPrefix = "G";
            else if (extractedNum >= 61 && extractedNum <= 75) letterPrefix = "O";

            callerScreen.innerText = `${letterPrefix} - ${extractedNum}`;
            
            // Speech activation action
            speakBingoNumberFemaleVoice(`${letterPrefix} ${extractedNum}`);

            totalCalledNumbersCount++;
            calledCountElement.innerText = totalCalledNumbersCount;

            const targetElementNode = document.getElementById(`master-num-${extractedNum}`);
            if (targetElementNode) {
                targetElementNode.classList.add("called");
            }
        }, 3000);
    }

    // 10. Nav Bar Controllers Navigation Module Router
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const destinationSectionKey = button.getAttribute("data-section");
            navButtons.forEach(btn => btn.classList.remove("active"));
            for (let key in sections) { sections[key].style.display = "none"; }

            button.classList.add("active");
            sections[destinationSectionKey].style.display = "block";
        });
    });
});
