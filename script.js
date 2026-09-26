document.addEventListener("DOMContentLoaded", () => {
    // 1. UI Elements Mapping
    const cardsGrid = document.getElementById("cards-grid");
    const bingoCardContainer = document.getElementById("bingo-card-container");
    const bingoCardGrid = document.getElementById("bingo-card-grid");
    const timerElement = document.getElementById("countdown-timer");
    const screen1 = document.getElementById("screen-1");
    const screen2 = document.getElementById("screen-2");
    
    // Live Game Dashboard Elements
    const gameIdElement = document.getElementById("game-id");
    const liveBetElement = document.getElementById("live-bet");
    const liveDerashElement = document.getElementById("live-derash");
    const liveStakeElement = document.getElementById("live-stake");
    const calledCountElement = document.getElementById("called-count");
    const callerScreen = document.getElementById("caller-screen");
    const topBar = document.getElementById("top-bar");

    // Wallets display fields
    const topPlayWallet = document.getElementById("top-play-wallet");
    
    // Bottom navigation setup
    const sections = {
        game: document.getElementById("game-section"),
        wallet: document.getElementById("wallet-section"),
        history: document.getElementById("history-section"),
        profile: document.getElementById("profile-section")
    };
    const navButtons = document.querySelectorAll(".nav-btn");

    // Board columns
    const columnsData = {
        B: document.getElementById("col-B"),
        I: document.getElementById("col-I"),
        N: document.getElementById("col-N"),
        G: document.getElementById("col-G"),
        O: document.getElementById("col-O")
    };

    // 2. State Variables
    let selectedTicket = null;
    let countdownValue = 49;
    let gameIdCounter = 1;
    let totalCalledNumbersCount = 0;
    
    // Mock simulation defaults for Stake calculations
    let currentStakeAmount = 10; // Change to 20 for custom testing
    let simulatedPlayersCount = Math.floor(Math.random() * 30) + 15; // Simulated players (15-45 players)

    // Apply Clause 3: 10 Birr Bonus initialization instantly for new registrations
    topPlayWallet.innerText = "10";

    // 3. Generate 1 to 600 Selection Tickets Loop Block
    for (let i = 1; i <= 600; i++) {
        const cardBox = document.createElement("div");
        cardBox.className = "card-box";
        cardBox.innerText = i;
        cardBox.addEventListener("click", () => {
            document.querySelectorAll(".card-box").forEach(el => el.classList.remove("selected"));
            cardBox.classList.add("selected");
            selectedTicket = i;
            liveBetElement.innerText = "1"; // User picked 1 card
            
            generate5x5BingoMatrix();
        });
        cardsGrid.appendChild(cardBox);
    }

    // 4. Matrix Generation Engine
    function generate5x5BingoMatrix() {
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

    // 5. Populate BINGO Columns (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)
    const initMasterBoard = () => {
        const structuralRanges = { B:, I:, N:, G:, O: [61,75] };
        for (let col in structuralRanges) {
            columnsData[col].innerHTML = "";
            let start = structuralRanges[col][0];
            let end = structuralRanges[col][1];
            for (let i = start; i <= end; i++) {
                const item = document.createElement("div");
                item.className = "board-item";
                item.id = `master-num-${i}`;
                item.innerText = i;
                columnsData[col].appendChild(item);
            }
        }
    };
    initMasterBoard();

    // 6. Countdown Timer Trigger
    let countdownInterval = setInterval(() => {
        countdownValue--;
        timerElement.innerText = countdownValue;
        if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            transitionToLiveScreenMode();
        }
    }, 1000);

    // 7. Transition To Live Mode (Clause 1 Requirements)
    function transitionToLiveScreenMode() {
        topBar.style.display = "none"; // Hide countdown header bar completely
        screen1.style.display = "none";
        screen2.style.display = "block";

        // Assign top live statistics panel calculations data info elements
        gameIdElement.innerText = String(gameIdCounter).padStart(4, '0');
        liveStakeElement.innerText = currentStakeAmount;
        
        // Calculate Derash formula parameter logic checks
        let calculatedDerashPayout = 0;
        if (currentStakeAmount === 10) {
            calculatedDerashPayout = simulatedPlayersCount * 8;
        } else if (currentStakeAmount === 20) {
            calculatedDerashPayout = simulatedPlayersCount * 16;
        } else {
            calculatedDerashPayout = simulatedPlayersCount * (currentStakeAmount * 0.8);
        }
        liveDerashElement.innerText = calculatedDerashPayout;

        triggerLiveBingoCaller();
    }

    // 8. Female Voice Announcer Logic Engine Function Block (Clause 2 Requirements)
    function speakBingoNumberFemaleVoice(textToSpeak) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            const voices = window.speechSynthesis.getVoices();
            
            // Attempt to assign a default standard english female voice profile option matches
            const femaleVoice = voices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('zira') || 
                voice.name.toLowerCase().includes('google uk english female')
            );
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            utterance.rate = 1.0; 
            window.speechSynthesis.speak(utterance);
        }
    }
    // Pre-trigger voice initialization engine loading profiles safely
    if ('speechSynthesis' in window) { window.speechSynthesis.getVoices(); }

    // 9. Live Random Bingo Game Caller loop sequence iteration block
    function triggerLiveBingoCaller() {
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

            let compiledAnnouncement = `${letterPrefix} - ${extractedNum}`;
            callerScreen.innerText = compiledAnnouncement;
            
            // Speak called element aloud in female translation structure instantly
            speakBingoNumberFemaleVoice(`${letterPrefix} ${extractedNum}`);

            // Increment Called statistics dashboard tracker
            totalCalledNumbersCount++;
            calledCountElement.innerText = totalCalledNumbersCount;

            // Illuminate target layout box number match node item row selector
            const exactTargetElementNode = document.getElementById(`master-num-${extractedNum}`);
            if (exactTargetElementNode) {
                exactTargetElementNode.classList.add("called");
            }
        }, 3000);
    }

    // 10. Navigation Tabs Click Handlers Switch Layout Panels Control
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
