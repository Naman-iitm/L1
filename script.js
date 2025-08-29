// ----------------------
// Document Upload Logic
// ----------------------
const fileInput = document.getElementById('fileInput');
const uploadLabel = document.querySelector('.upload-label');
const dummyText = document.getElementById('dummyText');
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryDiv = document.getElementById('summary');

// Dummy extracted text and summary
const exampleExtractedText = "This is a sample legal contract. The parties agree to the following terms and conditions...";
const dummySummary = "Summary: This contract outlines the agreement between parties, specifying terms, conditions, and obligations. Always consult a legal professional for detailed interpretation.";

// Show dummy extracted text on file selection
fileInput.addEventListener('change', function(e){
    if(e.target.files.length > 0){
        const fileName = e.target.files[0].name;
        dummyText.textContent = exampleExtractedText + ` [File: ${fileName}]`;
        summaryDiv.textContent = "";
    }
});

// Allow clicking on upload box to open file dialog
uploadLabel.addEventListener('click', function(){
    fileInput.click();
});

// Summarize Document Button
summarizeBtn.addEventListener('click', function(){
    summaryDiv.textContent = dummySummary;
});

// ----------------------
// Chatbot Logic
// ----------------------
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// Dummy AI responses
const aiResponses = [
    "Hello! How can I assist you with your legal document today?",
    "LegalClear AI helps simplify legal jargon and extract key points from your documents.",
    "Please upload a document to get started.",
    "I'm here to answer your legal document-related questions!",
    "Note: Always consult a licensed attorney for legal advice.",
    "You can ask me to summarize, explain clauses, or clarify terms."
];
let aiResponseCounter = 0;

// Render a message in chat
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + sender;
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle send button
sendBtn.addEventListener('click', function(){
    const userMsg = chatInput.value.trim();
    if(userMsg){
        addMessage(userMsg, 'user');
        chatInput.value = '';
        setTimeout(function(){
            addMessage(aiResponses[aiResponseCounter % aiResponses.length], 'ai');
            aiResponseCounter++;
        }, 700);
    }
});

// Enter key for chat input
chatInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
        sendBtn.click();
    }
});

// Initial AI greeting
window.addEventListener('DOMContentLoaded', function(){
    addMessage("Hi! I'm LegalClear AI. Upload a document or ask me anything about legal documents.", 'ai');
});
