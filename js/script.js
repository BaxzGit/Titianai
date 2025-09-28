// API Key Gemini AI - GANTI DENGAN API KEY ANDA
const GEMINI_API_KEY = 'AIzaSyCH8H2h5BvPhC0zBNTxF12H2axcKLE1i04';

// Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const clearChatBtn = document.getElementById('clearChatBtn');
const suggestQuestionBtn = document.getElementById('suggestQuestionBtn');
const suggestionsModal = document.getElementById('suggestionsModal');
const closeModal = document.querySelector('.close-modal');
const suggestionItems = document.querySelectorAll('.suggestion-item');
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

// Variables
let chatHistory = [];

// Event Listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

clearChatBtn.addEventListener('click', clearChat);
suggestQuestionBtn.addEventListener('click', showSuggestionsModal);
closeModal.addEventListener('click', hideSuggestionsModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === suggestionsModal) {
        hideSuggestionsModal();
    }
});

// Add event listeners to suggestion items
suggestionItems.forEach(item => {
    item.addEventListener('click', () => {
        userInput.value = item.getAttribute('data-question');
        hideSuggestionsModal();
        userInput.focus();
    });
});

mobileMenu.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Functions
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Check if API key is set
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        showNotification('Error: API Key belum diatur. Silakan hubungi administrator.', 'error');
        return;
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    // Show typing indicator
    const typingElement = showTypingIndicator();
    
    // Call Gemini AI API
    callGeminiAPI(message, typingElement);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${time}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-header">
                <i class="fas fa-robot"></i>
                <span>Titian AI</span>
            </div>
            <div class="message-content">${text}</div>
            <div class="message-time">${time}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to chat history
    chatHistory.push({ sender, text, time });
    
    return messageDiv;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-header">
            <i class="fas fa-robot"></i>
            <span>Titian AI</span>
        </div>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function callGeminiAPI(prompt, typingElement) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        removeTypingIndicator();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage(aiResponse, 'ai');
        } else {
            throw new Error('Format respons tidak sesuai');
        }
        
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        removeTypingIndicator();
        
        // Fallback responses if API fails
        const fallbackResponses = [
            "Maaf, saat ini saya mengalami gangguan teknis. Silakan coba lagi dalam beberapa saat.",
            "Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.",
            "Terjadi kesalahan koneksi. Pastikan Anda terhubung ke internet dan coba lagi."
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        addMessage(randomResponse, 'ai');
        
        showNotification('Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.', 'error');
    }
}

function clearChat() {
    chatMessages.innerHTML = '';
    chatHistory = [];
    
    // Add welcome message back
    addMessage('Halo! Saya Titian AI, asisten AI Anda. Saya siap membantu dengan berbagai pertanyaan dan tugas. Bagaimana saya bisa membantu Anda hari ini?', 'ai');
    
    showNotification('Percakapan telah dibersihkan', 'success');
}

function showSuggestionsModal() {
    suggestionsModal.style.display = 'flex';
}

function hideSuggestionsModal() {
    suggestionsModal.style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : 'success'}`;
    notification.textContent = message;
    notification.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        }
    });
});

// Button event handlers
document.getElementById('tryNowBtn').addEventListener('click', () => {
    document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
    userInput.focus();
});

document.getElementById('learnMoreBtn').addEventListener('click', () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('loginBtn').addEventListener('click', () => {
    showNotification('Fitur login akan segera hadir!', 'info');
});

document.getElementById('registerBtn').addEventListener('click', () => {
    showNotification('Fitur pendaftaran akan segera hadir!', 'info');
});

// Initialize chat with welcome message if empty
window.addEventListener('load', () => {
    if (chatHistory.length === 0) {
        setTimeout(() => {
            addMessage("Saya dapat membantu Anda dengan berbagai tugas seperti menulis, pemrograman, analisis, terjemahan, dan banyak lagi. Apa yang ingin Anda tanyakan?", 'ai');
        }, 1000);
    }
    
    // Check if API key is set
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('API Key Gemini AI belum diatur. Silakan ganti nilai GEMINI_API_KEY di file script.js');
        showNotification('Peringatan: API Key belum diatur. Fitur AI tidak akan berfungsi.', 'error');
    }
});
