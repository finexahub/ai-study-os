from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import our custom logic files
import ai_agent
import database

# Initialize the database tables on server startup
database.init_db()

app = FastAPI(
    title="AI Study OS API",
    description="Backend API for the CBSE Class 10 AI Study Assistant"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizRequest(BaseModel):
    topic: str

class ChatMessage(BaseModel):
    message: str
    context: str = ""

class QuizSubmission(BaseModel):
    topic: str
    score: int
    total: int

@app.post("/generate_quiz")
async def generate_quiz(request: QuizRequest):
    # Call the Gemini AI Agent
    ai_response = ai_agent.generate_quiz_questions(request.topic)
    
    if "Error:" in ai_response:
        raise HTTPException(status_code=500, detail="Failed to generate quiz")
        
    return {
        "status": "success", 
        "data": ai_response
    }

@app.post("/chat")
async def chat_with_tutor(request: ChatMessage):
    # Call the Gemini AI Agent
    ai_response = ai_agent.explain_concept(request.message, request.context)
    return {
        "status": "success", 
        "reply": ai_response
    }

@app.post("/submit_quiz")
async def submit_quiz(submission: QuizSubmission):
    # Save the score to SQLite
    database.save_score(submission.topic, submission.score, submission.total)
    return {
        "status": "success", 
        "message": "Score saved successfully."
    }

@app.get("/progress")
async def get_progress():
    # Fetch calculated weak topics from SQLite
    weak_topics = database.get_weak_topics()
    return {
        "status": "success", 
        "weak_topics": weak_topics
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
