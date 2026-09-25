import asyncio
import random
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
        self.stake = 10  # በነባሪ (Default) 10 ብር (ተጫዋቹ 10 ወይም 20 መምረጥ ይችላል)
        self.players_count = 5  # ለምሳሌ 5 ተጫዋቾች ገብተዋል ብለን ብናስብ
        self.all_numbers = list(range(1, 76))
        self.called_numbers = []
        self.current_call = "በመጠባበቅ ላይ..."
        self.is_running = False

    def calculate_derash(self):
        # 1ኛ መስፈርት፡ የደራሽ ስሌት (Stake 10 ከሆነ በ 8፣ 20 ከሆነ በ 16 ይባዛል)
        if self.stake == 10:
            return self.players_count * 8
        elif self.stake == 20:
            return self.players_count * 16
        return 0

    def reset_game(self, chosen_stake=10, active_players=5):
        self.game_id += 1
        self.stake = chosen_stake
        self.players_count = active_players
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
                "game_id": f"{self.game_id:04d}",
                "bet": f"{self.stake} ETB",
                "derash": f"{self.calculate_derash()} ETB",
                "called_count": len(self.called_numbers), # የጥሪዎች ብዛት
                "call": self.current_call,
                "num": num,
                "letter": letter
            }
        self.is_running = False
        return None

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

async def bingo_game_loop():
    while True:
        # ለምሳሌ በየመሀሉ 10 ወይም 20 ብር በራንደም እየመረጠ እንዲጫወት ለማሳየት
        current_stake = random.choice([10, 20])
        current_players = random.randint(3, 12)
        bingo_game.reset_game(chosen_stake=current_stake, active_players=current_players)
        
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
            await asyncio.sleep(3) # በየ 3 ሰከንዱ ቁጥር ይወጣል
            
        await manager.broadcast({"type": "GAME_OVER"})
        await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(bingo_game_loop())
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