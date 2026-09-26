import asyncio
import random
import sqlite3
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BingoGame:
    def init(self):
        self.game_id = 1
        self.stake = 10
        self.players_count = 0
        self.all_numbers = list(range(1, 76))
        self.called_numbers = []
        self.current_call = "በመጠባበቅ ላይ..."
        self.is_running = False
        self.active_player_cards = {}  # የእያንዳንዱን ተጫዋች 5x5 ካርቴላ ለመያዝ {tg_id: list_of_25_cells}

    def calculate_derash(self):
        if self.stake == 10: return self.players_count * 8
        elif self.stake == 20: return self.players_count * 16
        return 0

    def reset_game(self):
        self.game_id += 1
        self.all_numbers = list(range(1, 76))
        random.shuffle(self.all_numbers)
        self.called_numbers = []
        self.current_call = "ተጀመረ!"
        self.is_running = True
        self.active_player_cards = {} # የድሮዎቹን ማጽዳት
        self.players_count = 0

    def check_matrix_win(self, cells):
        # 5x5 ማትሪክስ መስራት
        matrix = [cells[i:i+5] for i in range(0, 25, 5)]
        live_calls = [item["number"] for item in self.called_numbers]

        def is_marked(val):
            return val == "FREE" or int(val) in live_calls

        # 1. አግድም (Rows)
        for row in matrix:
            if all(is_marked(c) for c in row): return True
        # 2. ወደታች (Columns)
        for col in range(5):
            if all(is_marked(matrix[row][col]) for row in range(5)): return True
        # 3. ሰያፍ (Diagonals)
        if all(is_marked(matrix[i][i]) for i in range(5)): return True
        if all(is_marked(matrix[i][4-i]) for i in range(5)): return True
        
        return False

    def check_all_winners(self):
        # ሁሉንም ተጫዋቾች አውቶማቲክ መፈተሽ
        winners = []
        for tg_id, cells in self.active_player_cards.items():
            if self.check_matrix_win(cells):
                winners.append(tg_id)
        return winners

bingo_game = BingoGame()

class ConnectionManager:
    def init(self):
        self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try: await connection.send_json(message)
            except: pass

manager = ConnectionManager()

# የጨዋታው የቀጥታ ሉፕ
async def bingo_game_loop():
    while True:
        # ለተጫዋቾች መመዝገቢያ 49 ሰከንድ መስጠት (እዚህ ጋር ሰዓቱ ሲያልቅ ባክኤንዱ መቁጠር ይጀምራል)
        bingo_game.reset_game()
        print("የመመዝገቢያ ሰዓት ተጀምሯል...")
        await asyncio.sleep(49) # የፊት ክፍሉ ሰዓት እስኪያልቅ መጠበቅ
        
        bingo_game.players_count = len(bingo_game.active_player_cards)
        if bingo_game.players_count == 0:
            bingo_game.players_count = 3 # ማሳያ ተጫዋች (ለፈተና እንዲሆን)
            
        print(f"ጨዋታው በይፋ ተጀመረ! Game ID: {bingo_game.game_id:04d}")
        
        while bingo_game.is_running and bingo_game.all_numbers:
            if not bingo_game.all_numbers: break
            
            num = bingo_game.all_numbers.pop(0)
            # ፊደል መለየት
            if 1 <= num <= 15: letter = "B"
            elif 16 <= num <= 30: letter = "I"
            elif 31 <= num <= 45: letter = "N"
            elif 46 <= num <= 60: letter = "G"
            elif 61 <= num <= 75: letter = "O"
            
            bingo_game.current_call = f"{letter}-{num}"
            bingo_game.called_numbers.append({"number": num, "letter": letter})
            # አውቶማቲክ አሸናፊዎችን መፈተሽ (Auto Win Checker)
            winners = bingo_game.check_all_winners()
            
            if winners:
                bingo_game.is_running = False
                await manager.broadcast({
                    "type": "WINNER_FOUND",
                    "game_id": f"{bingo_game.game_id:04d}",
                    "current_call": f"ቢንጎ ተገኝቷል!",
                    "winners": winners,
                    "message": f"የጨዋታው አሸናፊ ID: {winners[0]} ሆኗል! 🎉"
                })
                break
                
            await manager.broadcast({
                "type": "LIVE_DRAW",
                "game_id": f"{bingo_game.game_id:04d}",
                "bet": f"{bingo_game.stake} ETB",
                "derash": f"{bingo_game.calculate_derash()} ETB",
                "called_count": len(bingo_game.called_numbers),
                "current_call": bingo_game.current_call,
                "history": bingo_game.called_numbers
            })
            await asyncio.sleep(3)
            
        if bingo_game.is_running: # ቁጥሮቹ ካለቁ
            await manager.broadcast({"type": "GAME_OVER", "message": "ጨዋታው ያለ አሸናፊ ተጠናቋል!"})
        await asyncio.sleep(10) # ለቀጣይ ጨዋታ እረፍት

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(bingo_game_loop())

# ተጫዋቹ ሰዓቱ ሲያልቅ ካርቴላውን የሚመዘግብበት API
@app.post("/api/game/register-card")
async def register_player_card(data: dict):
    tg_id = data.get("tg_id")
    cells = data.get("matrix_cells")
    bingo_game.active_player_cards[tg_id] = cells
    return {"success": True}