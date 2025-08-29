// Typing Animation
const typewriterText = [
    "Making legal documents accessible to everyone",
    "Simplifying complex legal jargon",
    "Understanding contracts made easy"
];

let textIndex = 0;
let charIndex = 0;

function typeWriter() {
    const typedTextElement = document.getElementById('typed-text');
    const currentText = typewriterText[textIndex];

    if (charIndex < currentText.length) {
        typedTextElement.textContent += currentText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 50);
    } else {
        setTimeout(eraseText, 2000);
    }
}

function eraseText() {
    const typedTextElement = document.getElementById('typed-text');
    
    if (charIndex > 0) {
        typedTextElement.textContent = typewriterText[textIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseText, 30);
    } else {
        textIndex = (textIndex + 1) % typewriterText.length;
        setTimeout(typeWriter, 500);
    }
}

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .stat-card').forEach(el => {
    observer.observe(el);
});

// Interactive Demo
const simplifyButton = document.querySelector('.simplify-button');
const demoInput = document.querySelector('.input-area textarea');
const demoOutput = document.querySelector('.output-area .result');

if (simplifyButton) {
    simplifyButton.addEventListener('click', () => {
        demoOutput.innerHTML = `
            <div class="loading">
                Analyzing and simplifying...
                <div class="loading-bar"></div>
            </div>
        `;
        
        setTimeout(() => {
            demoOutput.innerHTML = `
                <div class="simplified-text">
                    <h4>📑 Summary:</h4>
                    <p>This is a rental agreement that outlines your rights and responsibilities as a tenant.</p>
                    
                    <h4>🔑 Key Points:</h4>
                    <ul>
                        <li>Rent is due on the 1st of each month</li>
                        <li>Security deposit: $1,000</li>
                        <li>No pets allowed without written permission</li>
                    </ul>
                    
                    <h4>⚠️ Important Terms:</h4>
                    <p>30-day notice required before moving out</p>
                </div>
            `;
        }, 2000);
    });
}

// Particle Background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
        particlesContainer.appendChild(particle);
    }
}

// Mobile Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Chatbot functionality
function toggleChat() {
    const chatContainer = document.querySelector('.chatbot-container');
    if (chatContainer) {
        chatContainer.style.display = 
            chatContainer.style.display === 'block' ? 'none' : 'block';
    }
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage('user', message);
        input.value = '';
        
        setTimeout(() => {
            const responses = [
                "I can help you understand that legal term. Could you provide more context?",
                "Let me simplify that for you. This typically means...",
                "That's a common question about legal documents. Here's what you need to know...",
                "I can break that down into simpler terms. Would you like me to explain further?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage('bot', randomResponse);
        }, 1000);
    }
}

function addMessage(type, text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Animate stats
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCount = () => {
            if (current < target) {
                current += increment;
                stat.textContent = Math.round(current);
                setTimeout(updateCount, 20);
            } else {
                stat.textContent = target;
            }
        };
        updateCount();
    });
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    createParticles();

    // Observe stats section
    const statsSection = document.querySelector('.stats, .stats-grid');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        });
        statsObserver.observe(statsSection);
    }
});
