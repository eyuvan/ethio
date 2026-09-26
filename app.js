// --- 1. የካርቴላ መምረጫ አወቃቀር (1-600) ---
const grid = document.getElementById('grid-container');
if (grid) {
    for (let i = 1; i <= 600; i++) {
        let div = document.createElement('div');
        div.className = 'cartela';
        div.innerText = i;
        div.onclick = function() {
            document.querySelectorAll('.cartela').forEach(c => c.classList.remove('selected'));
            div.classList.add('selected');
        };
        grid.appendChild(div);
    }
}

// --- 2. የቢንጎ ቦርድ ቁጥሮች ዝርዝር ማውጫ (1-75) ---
function createBingoBoard() {
    for(let i=1; i<=15; i++) { document.getElementById('list-B').innerHTML += '<span id="cell-' + i + '">' + i + '</span>'; }
    for(let i=16; i<=30; i++) { document.getElementById('list-I').innerHTML += '<span id="cell-' + i + '">' + i + '</span>'; }
    for(let i=31; i<=45; i++) { document.getElementById('list-N').innerHTML += '<span id="cell-' + i + '">' + i + '</span>'; }
    for(let i=46; i<=60; i++) { document.getElementById('list-G').innerHTML += '<span id="cell-' + i + '">' + i + '</span>'; }
    for(let i=61; i<=75; i++) { document.getElementById('list-O').innerHTML += '<span id="cell-' + i + '">' + i + '</span>'; }
}
createBingoBoard();

// --- 3. ለትንሹ ስክሪን የዘፈቀደ ቀለማት ---
const ballColors = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502", "#9b59b6", "#00d2d3", "#ff6b81"];

// --- 4. የካውንትዳውን ሰዓት ቆጣሪ ሎጂክ ---
let timer = 49;
const countdownElement = document.getElementById('countdown');

if (countdownElement) {
    const clock = setInterval(function() {
        timer--;
        countdownElement.innerText = timer;
        if (timer <= 0) {
            clearInterval(clock);
            document.getElementById('selection-page').classList.add('hidden');
            document.getElementById('live-game-page').classList.remove('hidden');
            
            connectToBingoWebSocket(); // ሰዓቱ ሲያልቅ ከባክኤንድ ጋር ይገናኛል
        }
    }, 1000);
}

// --- 5. የዌብሶኬት ግንኙነት ---
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
                const randomColor = ballColors[Math.floor(Math.random() * ballColors.length)];
                ballScreen.style.backgroundColor = randomColor;
            }
            
            if (data.history) {
                data.history.forEach(function(item) {
                    let cell = document.getElementById('cell-' + item.number);
                    if (cell) cell.classList.add('called-highlight');
                });
            }
        }
        
        if (data.type === "GAME_OVER") {
            const ballScreen = document.getElementById('live-ball-screen');
            if (ballScreen) {
                ballScreen.innerText = "END";
                ballScreen.style.backgroundColor = "#333";
            }
        }
    };
}