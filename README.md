# AI Study OS 🧠

AI Study OS is a modern, AI-powered web application designed to act as a personal study coach for CBSE Class 10 students. It leverages the Gemini API to generate custom quizzes, explain difficult concepts, and track student progress over time.

## 🚀 Features

- **Smart Quiz Generator:** Instantly generate 5-question multiple-choice quizzes for any topic.
- **24/7 AI Tutor:** A dedicated chat interface for step-by-step concept explanations.
- **Weak Topic Tracking:** Automatically stores quiz scores in SQLite and identifies subjects where the student averages below 70%.
- **Modern UI:** Responsive, clean, and fast frontend built with TailwindCSS.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript, TailwindCSS (CDN)
- **Backend:** Python 3, FastAPI, Uvicorn
- **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash)
- **Database:** SQLite3

## 📁 Project Structure

\`\`\`text
ai_study_os/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── ai_agent.py      # Gemini API logic
│   ├── database.py      # SQLite operations
├── frontend/
│   ├── index.html       # Landing page
│   ├── dashboard.html   # Main student hub
│   ├── quiz.html        # Dynamic quiz interface
│   └── chat.html        # AI Tutor chat
├── static/
│   ├── styles.css       # Custom styles
│   └── app.js           # Frontend API calls & UI logic
├── requirements.txt     # Python dependencies
└── README.md            # Project documentation
\`\`\`

## ⚙️ Setup Instructions

1. **Clone or Download the Repository**
   Ensure you have the folder structure set up exactly as shown above.

2. **Install Python Dependencies**
   Open your terminal, navigate to the project root, and run:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Set Your Gemini API Key**
   You need a free API key from Google AI Studio. Set it in your terminal:
   - **Mac/Linux:** `export GEMINI_API_KEY="your_api_key_here"`
   - **Windows:** `set GEMINI_API_KEY="your_api_key_here"`

4. **Run the Backend Server**
   Navigate into the backend folder and start the FastAPI server:
   \`\`\`bash
   cd backend
   python main.py
   \`\`\`
   *The server will start on http://127.0.0.1:8000*

5. **Launch the Application**
   Simply open `frontend/index.html` in any modern web browser to start using AI Study OS!
