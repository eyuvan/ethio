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

# የጨዋตาው ሁኔታ መቆጣጠሪያ ክፍል
class BingoGame:
    def init(self):
        self.game_id = 1  # መነሻ ጨዋታ መለያ ቁጥር
        self.stake = 10
        self.players_count = 5
        self.all_numbers = list(range(1, 76))
        self.called_numbers = []
        self.current_call = "በመጠባበቅ ላይ..."
        self.is_running = False

    def calculate_derash(self):
        if self.stake == 10:
            return self.players_count * 8
        elif self.stake == 20:
            return self.players_count * 16
        return 0

    def reset_game(self):
        # ጨዋታው ሲያልቅ የመለያ ቁጥሩን በ 1 ጨምሮ በቅደም ተከተል (0001, 0002...) ማስቀጠል
        self.game_id += 1
        self.all_numbers = list(range(1, 76))
        random.shuffle(self.all_numbers)
        self.called_numbers = []
        self.current_call = "ተጀመረ!"
        self.is_running = True

    def get_letter(self, num):
        if 1 <= num <= 15: return "B"
        elif 16 <= num <= 30: return "I"
        elif 31 <= num <= 45: return "N"
        elif 46 <= num <= 60: return "G"
        elif 61 <= num <= 75: return "O"
        return ""

    def draw_number(self):
        if self.all_numbers:
            num = self.all_numbers.pop(0)
            letter = self.get_letter(num)
            self.current_call = f"{letter}-{num}"
            self.called_numbers.append({"number": num, "letter": letter})
            return {
                "game_id": f"{self.game_id:04d}",  # ቅርጸቱን 0001, 0002 ማድረጊያ
                "bet": f"{self.stake} ETB",
                "derash": f"{self.calculate_derash()} ETB",
                "called_count": len(self.called_numbers),
                "call": self.current_call
            }
        self.is_running = False
        return None

bingo_game = BingoGame()

# የዌብሶኬት ግንኙነት መቆጣጠሪያ
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

# የቢንጎ ቁጥር መጥሪያ ሉፕ (በየ 3 ሰከንዱ ቁጥር የሚያወጣ)
async def bingo_game_loop():
    while True:
        bingo_game.reset_game()
        print(f"አዲስ ጨዋታ ተጀመረ! Game ID: {bingo_game.game_id:04d}")
        
        while bingo_game.is_running and bingo_game.all_numbers:
            data = bingo_game.draw_number()
            if data:
                await manager.broadcast({
                    "type": "LIVE_DRAW",
                    "game_id": data["game_id"],
                    "bet": data["bet"],
                    "derash": data["derash"],
                    "called_count": data["called_count"],
                    "current_call": data["call"],
                    "history": bingo_game.called_numbers
                })
            await asyncio.sleep(3)
            
        await manager.broadcast({"type": "GAME_OVER"})
        await asyncio.sleep(10)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(bingo_game_loop())

# ----------------- አዲስ የተጨመረ፡ የተጠቃሚ ዳታ ማገናኛ API -----------------
@app.get("/api/user/{tg_id}")
async def get_user_data(tg_id: int):
    # ከተጫዋቹ ID ጋር ዳታቤዙን በማገናኘት የቦነስ እና ዋሌት መረጃዎችን ማንበብ
    conn = sqlite3.connect("bingo_game.db")
    cursor = conn.cursor()
    cursor.execute("SELECT main_wallet, play_wallet FROM users WHERE tg_id = ?", (tg_id,))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        return {
            "success": True,
            "main_wallet": user_data[0],
            "play_wallet": user_data[1]
        }
    return {"success": False, "main_wallet": 0, "play_wallet": 0}

@app.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if name == "main":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)