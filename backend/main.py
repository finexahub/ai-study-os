from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Initialize the FastAPI application
app = FastAPI(
    title="AI Study OS API",
    description="Backend API for the CBSE Class 10 AI Study Assistant"
)

# Configure CORS (Cross-Origin Resource Sharing)
# This allows our separate HTML/JS frontend to communicate safely with this backend API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP, allowing all origins. In production, restrict to frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Request Validation ---
# These ensure the frontend sends the exact data format we expect

class QuizRequest(BaseModel):
    topic: str

class ChatMessage(BaseModel):
    message: str
    context: str = ""  # Optional context (e.g., the current topic the student is viewing)

class QuizSubmission(BaseModel):
    topic: str
    score: int
    total: int

# --- API Endpoints ---

@app.post("/generate_quiz")
async def generate_quiz(request: QuizRequest):
    """
    Receives a topic from the frontend and returns 5 CBSE-style MCQ questions.
    (Will connect to ai_agent.py in the next step).
    """
    # TODO: Connect to Gemini AI agent
    return {
        "status": "success", 
        "message": f"Received request to generate quiz for: {request.topic}", 
        "data": [] # AI generated questions will go here
    }

@app.post("/chat")
async def chat_with_tutor(request: ChatMessage):
    """
    Handles student questions and returns AI explanations.
    (Will connect to ai_agent.py in the next step).
    """
    # TODO: Connect to Gemini AI agent
    return {
        "status": "success", 
        "reply": f"Hello! I am your AI Study Coach. You asked: '{request.message}'. (AI logic pending)"
    }

@app.post("/submit_quiz")
async def submit_quiz(submission: QuizSubmission):
    """
    Receives quiz scores to help detect weak topics.
    (Will connect to database.py in step 9).
    """
    # TODO: Save results to SQLite database
    return {
        "status": "success", 
        "message": f"Saved score of {submission.score}/{submission.total} for {submission.topic}."
    }

@app.get("/progress")
async def get_progress():
    """
    Retrieves the student's study history and identifies weak topics.
    (Will connect to database.py in step 9).
    """
    # TODO: Fetch aggregate data from SQLite database
    return {
        "status": "success", 
        "weak_topics": ["Trigonometry", "Chemical Reactions"] # Mock data for now
    }

# Entry point to run the server locally
if __name__ == "__main__":
    # Runs the app on http://127.0.0.1:8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
