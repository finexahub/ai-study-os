// --- Global Configurations ---
const API_BASE_URL = "http://127.0.0.1:8000";

// --- Initialization ---
// Detect which page is currently loaded and run the corresponding logic
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    
    // Simple router based on file name
    if (path.includes("dashboard.html")) {
        initDashboard();
    } else if (path.includes("quiz.html")) {
        initQuiz();
    } else if (path.includes("chat.html")) {
        initChat();
    }
});

// ==========================================
// 1. DASHBOARD LOGIC
// ==========================================
function initDashboard() {
    const quizForm = document.getElementById("quiz-form");
    const topicInput = document.getElementById("topic-input");
    const generateBtn = document.getElementById("generate-btn");
    const loadingIndicator = document.getElementById("loading-indicator");

    // Load progress when dashboard opens
    fetchProgress();

    if (quizForm) {
        quizForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const topic = topicInput.value.trim();
            if (!topic) return;

            // UI Loading State
            generateBtn.disabled = true;
            generateBtn.classList.add("opacity-50", "cursor-not-allowed");
            loadingIndicator.classList.remove("hidden");

            try {
                // Call FastAPI Backend
                const response = await fetch(`${API_BASE_URL}/generate_quiz`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ topic: topic })
                });

                const data = await response.json();
                
                // Store the raw AI text and topic in localStorage to pass to the quiz page
                localStorage.setItem("currentQuizTopic", topic);
                localStorage.setItem("currentQuizData", data.data); // data.data holds the Gemini text

                // Redirect to the quiz page
                window.location.href = "quiz.html";
            } catch (error) {
                console.error("Error generating quiz:", error);
                alert("Failed to connect to the server. Is FastAPI running?");
            } finally {
                // Reset UI (in case user clicks back)
                generateBtn.disabled = false;
                generateBtn.classList.remove("opacity-50", "cursor-not-allowed");
                loadingIndicator.classList.add("hidden");
            }
        });
    }
}

async function fetchProgress() {
    try {
        const response = await fetch(`${API_BASE_URL}/progress`);
        const data = await response.json();
        
        // Note: For MVP, we are using the mock data returned by main.py
        // This will be fully dynamic after Step 9 (Database)
        const weakList = document.getElementById("weak-topics-list");
        if (weakList && data.weak_topics) {
            weakList.innerHTML = data.weak_topics.map(topic => `
                <li class="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm font-medium border border-red-100 flex justify-between">
                    <span>${topic}</span><span>⚠️</span>
                </li>
            `).join("");
        }
    } catch (error) {
        console.error("Could not load progress:", error);
    }
}

// ==========================================
// 2. QUIZ PAGE LOGIC
// ==========================================
function initQuiz() {
    const topic = localStorage.getItem("currentQuizTopic");
    const rawData = localStorage.getItem("currentQuizData");
    
    if (!topic || !rawData) {
        alert("No quiz data found. Redirecting to dashboard.");
        window.location.href = "dashboard.html";
        return;
    }

    document.getElementById("quiz-topic").textContent = topic;
    const container = document.getElementById("quiz-container");
    const loader = document.getElementById("quiz-loader");
    const submitBtn = document.getElementById("submit-quiz-btn");
    
    // Hide loader
    if(loader) loader.style.display = "none";

    // --- Parse the AI Text ---
    // A simple parser to extract questions, options, and answers from the Gemini text format
    const parsedQuestions = parseQuizText(rawData);
    
    if (parsedQuestions.length === 0) {
        container.innerHTML = `<p class="text-red-500">Error parsing AI response. Please try generating again.</p>`;
        return;
    }

    // Render questions to the DOM
    let html = "";
    parsedQuestions.forEach((q, index) => {
        html += `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 question-card" data-correct="${q.answer}">
            <h3 class="font-semibold text-lg text-gray-900 mb-4">${index + 1}. ${q.question}</h3>
            <div class="space-y-3">
                ${q.options.map((opt, oIndex) => `
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition">
                        <input type="radio" name="q${index}" value="${opt.charAt(0)}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" required>
                        <span class="ml-3 text-gray-700">${opt}</span>
                    </label>
                `).join("")}
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
    submitBtn.classList.remove("hidden");

    // Handle Submission and Grading
    document.getElementById("quiz-submit-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let score = 0;
        const cards = document.querySelectorAll(".question-card");
        
        cards.forEach((card, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const correctAnswer = card.getAttribute("data-correct").trim().toUpperCase();
            
            // Highlight answers
            const allLabels = card.querySelectorAll("label");
            allLabels.forEach(label => {
                const input = label.querySelector("input");
                if (input.value === correctAnswer) {
                    label.classList.add("bg-green-100", "border-green-400"); // Show correct
                } else if (input.checked && input.value !== correctAnswer) {
                    label.classList.add("bg-red-100", "border-red-400"); // Show incorrect selection
                }
                input.disabled = true; // Lock inputs
            });

            if (selected && selected.value === correctAnswer) {
                score++;
            }
        });

        // Hide submit button, show results
        submitBtn.classList.add("hidden");
        const resultsDiv = document.getElementById("quiz-results");
        resultsDiv.classList.remove("hidden", "scale-95", "opacity-0");
        document.getElementById("score-display").textContent = `${score}/${cards.length}`;

        // Send score to backend to track weak topics
        try {
            await fetch(`${API_BASE_URL}/submit_quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: topic, score: score, total: cards.length })
            });
        } catch (error) {
            console.error("Failed to save score:", error);
        }
    });
}

// Helper function to parse Gemini's text output into a structured array
function parseQuizText(text) {
    const questions = [];
    // Split by "Question X:" 
    const blocks = text.split(/Question \d+:/i).filter(b => b.trim().length > 0);
    
    blocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 5) return; // Needs at least Q, A, B, C, D, Answer
        
        const qText = lines[0];
        const options = [];
        let answer = "";
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].match(/^[A-D]\)/i)) {
                options.push(lines[i]);
            } else if (lines[i].toLowerCase().startsWith("answer:")) {
                // Extract just the letter A, B, C, or D
                answer = lines[i].replace(/answer:/i, "").trim().charAt(0);
            }
        }
        
        if (options.length >= 4 && answer) {
            questions.push({ question: qText, options: options.slice(0, 4), answer: answer });
        }
    });
    return questions;
}

// ==========================================
// 3. CHAT TUTOR LOGIC
// ==========================================
function initChat() {
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatHistory = document.getElementById("chat-history");
    const typingIndicator = document.getElementById("typing-indicator");

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // 1. Add User message to UI
        appendMessage("You", message, true);
        chatInput.value = "";
        
        // 2. Show typing indicator and scroll
        typingIndicator.classList.remove("hidden");
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            // 3. Call backend
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });
            const data = await response.json();
            
            // 4. Hide typing, add AI response to UI
            typingIndicator.classList.add("hidden");
            appendMessage("AI", data.reply, false);
        } catch (error) {
            typingIndicator.classList.add("hidden");
            appendMessage("System", "Error: Could not connect to the AI tutor.", false);
        }
    });

    function appendMessage(sender, text, isUser) {
        const div = document.createElement("div");
        div.className = `flex items-start mb-6 ${isUser ? "justify-end" : ""}`;
        
        const avatar = isUser 
            ? `<div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ml-3 shrink-0">You</div>`
            : `<div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm border border-indigo-200 mr-3 shrink-0">AI</div>`;
            
        const bubble = `
            <div class="${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'} p-4 rounded-2xl shadow-sm max-w-[85%] sm:max-w-[75%]">
                <p class="leading-relaxed whitespace-pre-wrap">${text}</p>
            </div>
        `;

        div.innerHTML = isUser ? bubble + avatar : avatar + bubble;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to bottom
    }
}
