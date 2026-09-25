// 1 - 600 ካርቴላዎችን መፍጠር
const grid = document.getElementById('cartela-grid');
for (let i = 1; i <= 600; i++) {
    let div = document.createElement('div');
    div.className = 'cartela';
    div.innerText = i;
    div.onclick = function() {
        // ሁሉንም በነጭ/በነበረበት አድርገን የተመረጠውን ብቻ ቀለም መቀየር
        document.querySelectorAll('.cartela').forEach(c => c.classList.remove('selected'));
        div.classList.add('selected');
        generate5x5Card(); // ካርቴላ ሲመረጥ 5x5 መስራት
    };
    grid.appendChild(div);
}

// 5x5 የቢንጎ ካርቴላ ማመንጫ (ራንደም ቁጥሮች ለናሙና)
function generate5x5Card() {
    const cardContainer = document.getElementById('my-bingo-card');
    cardContainer.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        let cell = document.createElement('div');
        cell.className = 'bingo-cell';
        cell.innerText = i === 12 ? "FREE" : Math.floor(Math.random() * 75) + 1;
        cardContainer.appendChild(cell);
    }
}

// የኔቪጌሽን ገጾችን መቀያየሪያ
function switchRoute(routeId) {
    document.querySelectorAll('.route').forEach(r => r.classList.remove('active'));
    document.getElementById(routeId).classList.add('active');
}

// Countdown Timer ሎጂክ (ከ 49 ጀምሮ ወደ ታች)
let timeLeft = 49;
const timerElement = document.getElementById('countdown');

const interval = setInterval(() => {
    timeLeft--;
    timerElement.innerText = timeLeft;
    
    if (timeLeft <= 0) {
        clearInterval(interval);
        // ሰዓቱ ሲያልቅ ወደ ሙሉ የጌም ገጽ (game.html) ይቀይራል
        window.location.href = "game.html";
    }
}, 1000);