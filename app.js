const supabaseUrl = 'https://mlzkkljtvhlshtoujubm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1semtrbGp0dmhsc2h0b3VqdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDMyOTMsImV4cCI6MjA1ODkxOTI5M30._fYLWHH0EHtTyvqslouIcrOFz8l-ZBaqraKAON7Ce8k';
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const userSelect = document.getElementById('user-select');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const loginContainer = document.getElementById('login-container');
const connectedUser = document.getElementById('connected-user');
const connectedUsername = document.getElementById('connected-username');
const logoutButton = document.getElementById('logout-button');

let users = {}; // Objet pour stocker les utilisateurs
let currentUserId = null; // ID de l'utilisateur connecté
let lastMessageTimestamp = null; // Dernier timestamp des messages récupérés

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
        getMessages(); // Rafraîchir les messages après l'insertion
    }
}

// Fonction pour récupérer les messages via une requête GET
async function getMessages() {
    console.log('Fetching messages...');
    let query = `${supabaseUrl}/rest/v1/messages?select=*&order=created_at.asc`;
    if (lastMessageTimestamp) {
        query += `&created_at=gt.${lastMessageTimestamp}`;
    }
    const response = await fetch(query, {
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
        if (data.length > 0) {
            lastMessageTimestamp = data[data.length - 1].created_at;
        }
        data.forEach(message => {
            const messageElement = document.createElement('div');
            const senderName = users[message.id_sent]?.username || 'Unknown'; // Récupérer le nom de l'utilisateur
            messageElement.textContent = `${senderName}: ${message.content}`;
            chatMessages.appendChild(messageElement);
        });
    }
}

// Fonction pour rafraîchir les messages automatiquement
function refreshMessages() {
    setInterval(getMessages, 5000); // Rafraîchir les messages toutes les 5 secondes
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
            loginContainer.style.display = 'none'; // Masquer le bloc de connexion
            connectedUser.style.display = 'block'; // Afficher le message de l'utilisateur connecté
            connectedUsername.textContent = user.username; // Afficher le nom de l'utilisateur connecté
            getMessages();
            refreshMessages(); // Démarrer le rafraîchissement automatique des messages
        } else {
            alert('Mot de passe incorrect');
        }
    } else {
        alert('Utilisateur non trouvé');
    }
}

// Fonction pour se déconnecter
function logout() {
    currentUserId = null;
    loginContainer.style.display = 'block'; // Afficher le bloc de connexion
    connectedUser.style.display = 'none'; // Masquer le message de l'utilisateur connecté
    chatMessages.innerHTML = ''; // Vider les messages affichés
    lastMessageTimestamp = null; // Réinitialiser le dernier timestamp des messages
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

// Se déconnecter lorsque le bouton est cliqué
logoutButton.addEventListener('click', logout);

// Charger les utilisateurs et les messages au chargement de la page
window.onload = () => {
    getUsers().then(() => {
        getMessages();
    });
};
