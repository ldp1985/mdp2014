const supabaseUrl = 'https://mlzkkljtvhlshtoujubm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1semtrbGp0dmhsc2h0b3VqdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDMyOTMsImV4cCI6MjA1ODkxOTI5M30._fYLWHH0EHtTyvqslouIcrOFz8l-ZBaqraKAON7Ce8k';
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const userSelect = document.getElementById('user-select');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

let users = {}; // Objet pour stocker les utilisateurs
let currentUserId = null; // ID de l'utilisateur connecté

// Fonction pour récupérer les utilisateurs
async function getUsers() {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id,username,password`, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        console.error('Error fetching users:', data);
    } else {
        userSelect.innerHTML = '';
        data.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            userSelect.appendChild(option);
            users[user.id] = user; // Stocker les utilisateurs dans l'objet
        });
    }
}

// Fonction pour envoyer un message via une requête POST
async function sendMessage(userId, content) {
    console.log('Sending message:', { userId, content });
    const response = await fetch(`${supabaseUrl}/rest/v1/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
            id_sent: userId,
            user_id: userId,
            content: content,
            created_at: new Date().toISOString(),
            id_received: userSelect.value // Utilisez l'ID de l'utilisateur sélectionné comme destinataire
        })
    });
    const data = await response.json();
    if (!response.ok) {
        console.error('Error inserting message:', data);
    } else {
        console.log('Message inserted:', data);
        window.location.reload(); // Rafraîchir la page après l'insertion
    }
}

// Fonction pour récupérer les messages via une requête GET
async function getMessages() {
    console.log('Fetching messages...');
    const response = await fetch(`${supabaseUrl}/rest/v1/messages?select=*&order=created_at.asc`, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        console.error('Error fetching messages:', data);
    } else {
        console.log('Messages fetched:', data);
        chatMessages.innerHTML = '';
        data.forEach(message => {
            const messageElement = document.createElement('div');
            const senderName = users[message.id_sent]?.username || 'Unknown'; // Récupérer le nom de l'utilisateur
            messageElement.textContent = `${senderName}: ${message.content}`;
            chatMessages.appendChild(messageElement);
        });
    }
}

// Fonction pour se connecter
function login() {
    const username = loginUsername.value;
    const password = loginPassword.value;
    const user = Object.values(users).find(user => user.username === username);

    if (user) {
        if (user.password === '' || user.password === password) {
            currentUserId = user.id;
            alert('Connexion réussie');
            getMessages();
        } else {
            alert('Mot de passe incorrect');
        }
    } else {
        alert('Utilisateur non trouvé');
    }
}

// Envoyer un message lorsque le bouton est cliqué
sendButton.addEventListener('click', () => {
    console.log('Button clicked');
    if (currentUserId) {
        const content = messageInput.value;
        if (content.trim() !== '') {
            console.log('Sending message with content:', content);
            sendMessage(currentUserId, content);
            messageInput.value = '';
        } else {
            console.log('Message content is empty');
        }
    } else {
        alert('Veuillez vous connecter pour envoyer un message');
    }
});

// Se connecter lorsque le bouton est cliqué
loginButton.addEventListener('click', login);

// Charger les utilisateurs et les messages au chargement de la page
window.onload = () => {
    getUsers().then(() => {
        getMessages();
    });
};

