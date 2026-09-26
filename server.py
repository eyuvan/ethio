import sqlite3
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

# ለውርርድ ጥያቄ የሚሆን የዳታ ፎርማት
class StakeRequest(BaseModel):
    tg_id: int
    stake_amount: float
    cartela_number: int

# ለአሸናፊነት ማረጋገጫ የሚሆን የዳታ ፎርማት
class WinCheckRequest(BaseModel):
    tg_id: int
    game_id: int
    matrix_cells: list  # የ 5x5 ካርቴላ ቁጥሮች ዝርዝር (25 ቁጥሮች)

# 1. የውርርድ መቀነሻ ሎጂክ (Stake Deduction)
@app.post("/api/game/deduct-stake")
async def deduct_stake(req: StakeRequest):
    conn = sqlite3.connect("bingo_game.db")
    cursor = conn.cursor()
    
    # የተጫዋቹን ቀሪ ሂሳብ ማረጋገጥ
    cursor.execute("SELECT main_wallet, play_wallet FROM users WHERE tg_id = ?", (req.tg_id,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="ተጠቃሚው አልተገኘም")
        
    main_wallet, play_wallet = user[0], user[1]
    total_balance = main_wallet + play_wallet
    
    if total_balance < req.stake_amount:
        conn.close()
        return {"success": False, "message": "လውርርድ የሚሆን በቂ ቀሪ ሂሳብ የለዎትም!"}
        
    # መጀመሪያ ከ Play Wallet ላይ ለመቀነስ መሞከር፣ ካልበቃ ከ Main Wallet ላይ መቀነስ
    remaining_stake = req.stake_amount
    new_play = play_wallet
    new_main = main_wallet
    
    if play_wallet >= remaining_stake:
        new_play -= remaining_stake
        remaining_stake = 0
    else:
        remaining_stake -= play_wallet
        new_play = 0
        new_main -= remaining_stake
        
    # በዳታቤዝ ውስጥ ቀሪ ሂሳብን ማዘመን
    cursor.execute(
        "UPDATE users SET main_wallet = ?, play_wallet = ? WHERE tg_id = ?",
        (new_main, new_play, req.tg_id)
    )
    conn.commit()
    conn.close()
    
    return {
        "success": True, 
        "message": "ውርርድዎ በተሳካ ሁኔታ ተቆርጧል", 
        "main_wallet": new_main, 
        "play_wallet": new_play
    }

# 2. የቢንጎ አሸናፊዎች መለያ ሎጂክ (Bingo Win Pattern Checker)
@app.post("/api/game/check-win")
async def check_bingo_win(req: WinCheckRequest):
    # አሁን በጨዋታው ላይ የወጡትን ቁጥሮች ከጨዋታው ሁኔታ (Game State) ማግኘት
    live_called_numbers = [item["number"] for item in bingo_game.called_numbers]
    
    # የ 5x5 ማትሪክስ አቀማመጥ መስራት (FREE የሚለውን ቦታ በራስ-ሰር እንደወጣ መቁጠር)
    matrix = []
    for i in range(0, 25, 5):
        matrix.append(req.matrix_cells[i:i+5])
        
    # መካከለኛዋን (FREE) ቁጥር በወጣ ቁጥር ዝርዝር ውስጥ መደመር (Row 2, Col 2)
    matrix[2][2] = "FREE" 
    
    # ዊን ፓተርን አመልካች ተግባር
    def is_cell_marked(cell_value):
        if cell_value == "FREE":
            return True
        return int(cell_value) in live_called_numbers

    # ሀ. አግድም መስመሮችን ማረጋገጥ (Rows)
    for row in matrix:
        if all(is_cell_marked(cell) for cell in row):
            return {"status": "BINGO", "message": "በአግድም መስመር አሸንፈዋል! 🎉"}
            
    # ለ. ወደታች መስመሮችን ማረጋገጥ (Columns)
    for col in range(5):
        if all(is_cell_marked(matrix[row][col]) for row in range(5)):
            return {"status": "BINGO", "message": "በአቀባዊ መስመር አሸንፈዋል! 🎉"}
            
    # ሐ. የሰያፍ መስመሮችን ማረጋገጥ (Diagonals)
    if all(is_cell_marked(matrix[i][i]) for i in range(5)): # ከግራ ወደ ቀኝ (\)
        return {"status": "BINGO", "message": "በሰያፍ መስመር አሸንፈዋል! 🎉"}
        
    if all(is_cell_marked(matrix[i][4-i]) for i in range(5)): # ከቀኝ ወደ ግራ (/)
        return {"status": "BINGO", "message": "በሰያፍ መስመር አሸንፈዋል! 🎉"}
        
    return {"status": "CONTINUE", "message": "ምንም የተሟላ መስመር የለም፣ ጨዋታው ይቀጥላል።"}