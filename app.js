let selectedCartelas = [];
let countdown = 49;

// 1-600 ካርቴላ ማመንጫ
const grid = document.getElementById('cartela-grid');
for (let i = 1; i <= 600; i++) {
    let btn = document.createElement('button');
    btn.innerText = i;
    btn.classList.add('cartela-btn');
    btn.onclick = () => toggleCartela(i, btn);
    grid.appendChild(btn);
}

function toggleCartela(num, btn) {
    if (selectedCartelas.includes(num)) {
        selectedCartelas = selectedCartelas.filter(n => n !== num);
        btn.classList.remove('selected');
    } else {
        if (selectedCartelas.length >= 5) {
            alert("ቢበዛ መምረጥ የሚችሉት 5 ካርቴላ ብቻ ነው!");
            return;
        }
        selectedCartelas.push(num);
        btn.classList.add('selected');
    }
}

// የሰዓት ቆጣሪ (Countdown Timer)
let timerInterval = setInterval(() => {
    countdown--;
    document.getElementById('timer').innerText = countdown;
    if (countdown <= 0) {
        clearInterval(timerInterval);
        startBingoCall(); // ቢንጎ ቁጥር መጥራት መጀመር
    }
}, 1000);

// ስክሪን መቀያየሪያ (Navigation)
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    if (screenName === 'game') {
        if (countdown > 0) {
            document.getElementById('selection-screen').classList.remove('hidden');
        } else {
            document.getElementById('game-screen').classList.remove('hidden');
        }
    } else {
        document.getElementById(${screenName}-screen).classList.remove('hidden');
    }
}

// የቢንጎ ቁጥሮች ጥሪ (Random Caller)
function startBingoCall() {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    let allNumbers = Array.from({length: 75}, (_, i) => i + 1);
    // Shuffle numbers
    allNumbers.sort(() => Math.random() - 0.5);

    let callIndex = 0;
    let callInterval = setInterval(() => {
        if (callIndex >= allNumbers.length) {
            clearInterval(callInterval);
            return;
        }
        let num = allNumbers[callIndex];
        let letter = '';
        
        if (num >= 1 && num <= 15) { letter = 'B'; document.getElementById('list-B').innerText +=  ${num}; }
        else if (num >= 16 && num <= 30) { letter = 'I'; document.getElementById('list-I').innerText +=  ${num}; }
        else if (num >= 31 && num <= 45) { letter = 'N'; document.getElementById('list-N').innerText +=  ${num}; }
        else if (num >= 46 && num <= 60) { letter = 'G'; document.getElementById('list-G').innerText +=  ${num}; }
        else if (num >= 61 && num <= 75) { letter = 'O'; document.getElementById('list-O').innerText +=  ${num}; }

        document.getElementById('called-number').innerText = ${letter}-${num};
        callIndex++;
    }, 3000); // በየ 3 ሴኮንዱ ቁጥር ይጠራል
}
// ተጫዋቹ የመረጠውን የካርቴላ ቁጥር (ለምሳሌ ቁጥር 45) ወደ 5x5 የቢንጎ ቁጥሮች የሚቀይር ሎጂክ
function generateBingoMatrix(cartelaNumber) {
    // ለእያንዳንዱ ዓምድ የየራሱ የቁጥር ክልል አለው
    let ranges = {
        'B': { min: 1, max: 15 },
        'I': { min: 16, max: 30 },
        'N': { min: 31, max: 45 },
        'G': { min: 46, max: 60 },
        'O': { min: 61, max: 75 }
    };

    let matrix = { 'B': [], 'I': [], 'N': [], 'G': [], 'O': [] };

    // የካርቴላ ቁጥሩን መነሻ (Seed) በማድረግ ለእያንዳንዱ ተጫዋች የተለያየ ቁጥር እንዲወጣ እናደርጋለን
    let seed = cartelaNumber;
    function seededRandom() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // ለእያንዳንዱ ሌተር 5 ልዩ የዘፈቀደ ቁጥሮችን ማውጣት
    for (let letter in ranges) {
        let availableNumbers = [];
        for (let i = ranges[letter].min; i <= ranges[letter].max; i++) {
            availableNumbers.push(i);
        }

        // በዘፈቀደ ማዘዋወር (Shuffle)
        for (let i = availableNumbers.length - 1; i > 0; i--) {
            let j = Math.floor(seededRandom() * (i + 1));
            [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
        }

        // የመጀመሪያዎቹን 5 ቁጥሮች መውሰድ
        matrix[letter] = availableNumbers.slice(0, 5);
    }

    // በቢንጎ ህግ መሰረት የ 'N' ዓምድ መካከለኛ ቁጥር (Index 2) "FREE" ወይም 0 መሆን አለበት
    matrix['N'][2] = "FREE"; 

    return matrix;
}

// 5x5 ካርቴላውን በስክሪን ላይ የማሳያ ፈንክሽን
function displayBingoCard(cartelaNum) {
    let matrix = generateBingoMatrix(cartelaNum);
    let cardContainer = document.getElementById('my-bingo-cards');
    
    let cardHTML = <div class="bingo-card-box">
        <h4>ካርቴላ ቁጥር: ${cartelaNum}</h4>
        <div class="card-grid">
            <div class="c-head">B</div><div class="c-head">I</div><div class="c-head">N</div><div class="c-head">G</div><div class="c-head">O</div>
    ;

    for (let i = 0; i < 5; i++) {
        cardHTML += 
            <div class="cell" id="cell-B-${matrix['B'][i]}">${matrix['B'][i]}</div>
            <div class="cell" id="cell-I-${matrix['I'][i]}">${matrix['I'][i]}</div>
            <div class="cell" id="cell-N-${matrix['N'][i]}">${matrix['N'][i]}</div>
            <div class="cell" id="cell-G-${matrix['G'][i]}">${matrix['G'][i]}</div>
            <div class="cell" id="cell-O-${matrix['O'][i]}">${matrix['O'][i]}</div>
        ;
    }
    cardHTML += </div></div>;
    cardContainer.innerHTML += cardHTML;
}