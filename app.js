let selectedCartelaNumber = null;
let currentMyCardCells = []; 

// 1. ካርቴላ ሲመረጥ የ 5x5 ማትሪክስ ማመንጨት (በቀደመው app.js ውስጥ ያለውን ተካ)
function generateBingoCard5x5(cartelaNumber) {
    const previewContainer = document.getElementById('preview-5x5');
    if (!previewContainer) return;
    previewContainer.innerHTML = ''; 
    currentMyCardCells = []; // ዝርዝሩን ማጽዳት
    
    const ranges = { 'B':, 'I':, 'N':, 'G':, 'O': };
    let cardData = { B: [], I: [], N: [], G: [], O: [] };
    
    for (let key in ranges) {
        let min = ranges[key]; let max = ranges[key];
        let pool = []; for (let n = min; n <= max; n++) pool.push(n);
        pool.sort(function() { return 0.5 - Math.random(); });
        cardData[key] = pool.slice(0, 5); 
    }
    
    const keys = ['B', 'I', 'N', 'G', 'O'];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            let cell = document.createElement('div');
            cell.className = 'bingo-cell';
            if (row === 2 && col === 2) {
                cell.innerText = "FREE";
                cell.classList.add('free');
            } else {
                let currentLetter = keys[col];
                cell.innerText = cardData[currentLetter][row];
            }
            currentMyCardCells.push(cell.innerText); // 25ቱን ቁጥሮች ማስቀመጥ
            previewContainer.appendChild(cell);
        }
    }
}

// 2. ሰዓቱ 0 ሲል ካርቴላውን ወደ ባክኤንድ አውቶማቲክ መላክ
// (በቀደመው የሰዓት ቆጣሪ if (timer <= 0) ውስጥ ይተኩት)
if (timer <= 0) {
    clearInterval(clock);
    if (!selectedCartelaNumber) {
        // ተጫዋቹ ካልመረጠ በራንደም አንዱን መርጦ ማስገባት (ጨዋታ እንዳያመልጠው)
        generateBingoCard5x5(Math.floor(Math.random() * 600) + 1);
    }
    
    // የ 5x5 ካርቴላውን ቁጥሮች ለባክኤንድ ማስመዝገብ (Auto Check እንዲደረግ)
    fetch('http://localhost:8000/api/game/register-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tg_id: telegramUserId,
            matrix_cells: currentMyCardCells
        })
    }).then(() => {
        // ገጹን ወደ ላይቭ ጨዋታ መቀየር
        document.getElementById('main-app-container').classList.add('hidden');
        document.getElementById('live-game-page').classList.remove('hidden');
        connectToBingoWebSocket();
    });
}

// 3. የዌብሶኬት መልዕክት መቀበያ (የተሻሻለ)
function connectToBingoWebSocket() {
    const ws = new WebSocket("ws://localhost:8000/ws/game");
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.type === "LIVE_DRAW") {
            document.getElementById('lbl-game-id').innerText = data.game_id;
            document.getElementById('lbl-bet').innerText = data.bet;
            document.getElementById('lbl-derash').innerText = data.derash;
            document.getElementById('lbl-called-count').innerText = data.called_count;
            
            const ballScreen = document.getElementById('live-ball-screen');
            if (ballScreen) {
                ballScreen.innerText = data.current_call;
                ballScreen.style.backgroundColor = ballColors[Math.floor(Math.random() * ballColors.length)];
            }
            
            if (data.history) {
                data.history.forEach(function(item) {
                    let cell = document.getElementById('cell-' + item.number);
                    if (cell) cell.classList.add('called-highlight');
                });
            }
        }
        
        // አውቶማቲክ አሸናፊ ሲገኝ የሚመጣ መልዕክት
        if (data.type === "WINNER_FOUND") {
            const ballScreen = document.getElementById('live-ball-screen');
            if (ballScreen) {
                ballScreen.innerText = "BINGO";
                ballScreen.style.backgroundColor = "#2ed573";
            }
            alert(data.message); // የአሸናፊውን መለያ ያውጃል
        }
    };
}