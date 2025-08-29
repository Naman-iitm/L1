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

simplifyButton.addEventListener('click', () => {
    const loadingText = "Analyzing and simplifying...";
    demoOutput.innerHTML = `
        <div class="loading">
            ${loadingText}
            <div class="loading-bar"></div>
        </div>
    `;
    
    setTimeout(() => {
        const sampleOutput = `
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
        demoOutput.innerHTML = sampleOutput;
    }, 2000);
});

// Particle Background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
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

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    createParticles();
});
