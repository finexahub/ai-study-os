import os
from google import genai
from google.genai import types

# Initialize the Gemini client. 
# Best practice for production: The client will automatically look for 
# an environment variable named GEMINI_API_KEY.
client = genai.Client()

def generate_quiz_questions(topic: str) -> str:
    """
    Calls the Gemini API to generate 5 CBSE Class 10 MCQ questions
    based on the specific prompt constraints provided.
    """
    prompt = f"""You are an exam question generator.

Create 5 multiple choice questions for CBSE Class 10.

Topic: {topic}

Rules:
• each question has 4 options
• only one correct answer
• difficulty medium

Format:

Question 1:
A)
B)
C)
D)

Answer:"""

    try:
        # Using the flash model for fast, cost-effective text generation
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"Error generating quiz from Gemini: {e}")
        return "Error: Could not generate questions at this time. Please try again."


def explain_concept(message: str, context: str = "") -> str:
    """
    Acts as an AI tutor to explain concepts to the student.
    Includes system instructions to maintain the persona of an AI study coach.
    """
    system_instruction = (
        "You are a friendly, encouraging personal AI study coach for a CBSE Class 10 student. "
        "Keep your explanations clear, concise, step-by-step, and easy to understand. "
        "Do not give direct answers to homework assignments; instead, guide the student to the answer."
    )
    
    prompt = f"Student's Question: {message}\n"
    if context:
        prompt += f"Context (what the student is currently studying): {context}\n"
        
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7 # Slight creativity for conversational warmth
            )
        )
        return response.text
    except Exception as e:
        print(f"Error generating explanation from Gemini: {e}")
        return "I'm having trouble connecting to my knowledge base right now. Let's try that again in a moment!"
