document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Elements & State
    const cardsGrid = document.getElementById("cards-grid");
    const bingoCardContainer = document.getElementById("bingo-card-container");
    const bingoCardGrid = document.getElementById("bingo-card-grid");
    const timerElement = document.getElementById("countdown-timer");
    const screen1 = document.getElementById("screen-1");
    const screen2 = document.getElementById("screen-2");
    const gameIdElement = document.getElementById("game-id");
    const callerScreen = document.getElementById("caller-screen");

    // Navigation Sections
    const sections = {
        game: document.getElementById("game-section"),
        wallet: document.getElementById("wallet-section"),
        history: document.getElementById("history-section"),
        profile: document.getElementById("profile-section")
    };
    const navButtons = document.querySelectorAll(".nav-btn");

    let selectedTicket = null;
    let countdownValue = 49;
    let gameIdCounter = 1;
    let timerInterval = null;
    let callerInterval = null;
    let calledNumbers = [];

    // BINGO Columns Board References
    const columnsData = {
        B: document.getElementById("col-B"),
        I: document.getElementById("col-I"),
        N: document.getElementById("col-N"),
        G: document.getElementById("col-G"),
        O: document.getElementById("col-O")
    };

    // 2. Generate 1 to 600 Selection Tickets
    for (let i = 1; i <= 600; i++) {
        const cardBox = document.createElement("div");
        cardBox.className = "card-box";
        cardBox.innerText = i;
        cardBox.addEventListener("click", () => {
            // Remove selection from previous
            document.querySelectorAll(".card-box").forEach(el => el.classList.remove("selected"));
            cardBox.classList.add("selected");
            selectedTicket = i;
            
            // Generate and show the 5x5 Grid for this ticket
            generateBingoCard();
        });
        cardsGrid.appendChild(cardBox);
    }

    // 3. Generate 5x5 Bingo Card Matrix
    function generateBingoCard() {
        bingoCardGrid.innerHTML = "";
        bingoCardContainer.style.display = "block";

        // Helper to get random numbers based on standard BINGO constraints
        const getRandomRange = (min, max, count) => {
            let nums = [];
            while (nums.length < count) {
                let r = Math.floor(Math.random() * (max - min + 1)) + min;
                if (!nums.includes(r)) nums.push(r);
            }
            return nums;
        };

        const bNums = getRandomRange(1, 15, 5);
        const iNums = getRandomRange(16, 30, 5);
        const nNums = getRandomRange(31, 45, 5);
        const gNums = getRandomRange(46, 60, 5);
        const oNums = getRandomRange(61, 75, 5);

        // Build 5x5 Matrix (Row by Row)
        for (let row = 0; row < 5; row++) {
            const rowData = [bNums[row], iNums[row], nNums[row], gNums[row], oNums[row]];
            
            rowData.forEach((num, colIdx) => {
                const cell = document.createElement("div");
                cell.className = "bingo-cell";
                
                // Center cell (Row 2, Column 2) is "FREE" space
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

    // 4. Populate BINGO Columns (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)
    const setupBoardColumns = () => {
        const ranges = { B:, I:, N:, G:, O: [61,75] };
        for (let col in ranges) {
            columnsData[col].innerHTML = ""; // Clear board
            for (let i = ranges[col][0]; i <= ranges[col][1]; i++) {
                const item = document.createElement("div");
                item.className = "board-item";
                item.id = `board-num-${i}`;
                item.innerText = i;
                columnsData[col].appendChild(item);
            }
        }
    };
    setupBoardColumns();

    // 5. Countdown Timer Logic (From 49 down to 0)
    timerInterval = setInterval(() => {
        countdownValue--;
        timerElement.innerText = countdownValue;

        if (countdownValue <= 0) {
            clearInterval(timerInterval);
            switchToLiveGame();
        }
    }, 1000);

    // 6. Switch to Screen 2 (Live Game Mode)
    function switchToLiveGame() {
        screen1.style.display = "none";
        screen2.style.display = "block";
        
        // Pad Game ID (e.g., 0001)
        gameIdElement.innerText = String(gameIdCounter).padStart(4, '0');
        
        startBingoCalling();
    }

    // 7. Live Bingo Calling Engine (Every 3 seconds)
    function startBingoCalling() {
        let allNumbers = [];
        for (let i = 1; i <= 75; i++) allNumbers.push(i);
        
        // Shuffle numbers
        allNumbers.sort(() => Math.random() - 0.5);

        callerInterval = setInterval(() => {
            if (allNumbers.length === 0) {
                clearInterval(callerInterval);
                callerScreen.innerText = "GAME OVER";
                return;
            }

            let currentNum = allNumbers.pop();
            let prefix = "";

            if (currentNum >= 1 && currentNum <= 15) prefix = "B";
            else if (currentNum >= 16 && currentNum <= 30) prefix = "I";
            else if (currentNum >= 31 && currentNum <= 45) prefix = "N";
            else if (currentNum >= 46 && currentNum <= 60) prefix = "G";
            else if (currentNum >= 61 && currentNum <= 75) prefix = "O";

            // Update mini screen display
            callerScreen.innerText = `${prefix} - ${currentNum}`;

            // Light up corresponding number on the master board
            const boardItem = document.getElementById(`board-num-${currentNum}`);
            if (boardItem) {
                boardItem.classList.add("called");
            }
        }, 3000);
    }

    // 8. Navigation Bar Click Handler
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetSection = button.getAttribute("data-section");

            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove("active"));
            for (let key in sections) {
                sections[key].style.display = "none";
            }

            // Activate chosen section
            button.classList.add("active");
            sections[targetSection].style.display = "block";
        });
    });
});
