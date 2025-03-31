const supabaseUrl = 'https://mlzkkljtvhlshtoujubm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1semtrbGp0dmhsc2h0b3VqdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDMyOTMsImV4cCI6MjA1ODkxOTI5M30._fYLWHH0EHtTyvqslouIcrOFz8l-ZBaqraKAON7Ce8k'

const chatMessages = document.getElementById('chat-messages')
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')
const userSelect = document.getElementById('user-select')

// Fonction pour récupérer les utilisateurs
async function getUsers() {
  const response = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Error fetching users:', data)
  } else {
    userSelect.innerHTML = ''
    data.forEach(user => {
      const option = document.createElement('option')
      option.value = user.id
      option.textContent = user.username
      userSelect.appendChild(option)
    })
  }
}

// Fonction pour envoyer un message via une requête POST
async function sendMessage(userId, content) {
  console.log('Sending message:', { userId, content })

  const response = await fetch(`${supabaseUrl}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      id_sent: userId, // Utilisez l'ID de l'utilisateur sélectionné comme id_sent
      content: content,
      created_at: new Date().toISOString()
    })
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Error inserting message:', data)
  } else {
    console.log('Message inserted:', data)
    getMessages() // Rafraîchir les messages après l'insertion
  }
}

// Fonction pour récupérer les messages via une requête GET
async function getMessages() {
  console.log('Fetching messages...')

  const response = await fetch(`${supabaseUrl}/rest/v1/messages?select=*,users(username)&order=created_at.asc`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Error fetching messages:', data)
  } else {
    console.log('Messages fetched:', data)
    chatMessages.innerHTML = ''
    data.forEach(message => {
      const messageElement = document.createElement('div')
      messageElement.textContent = `${message.users.username}: ${message.content}`
      chatMessages.appendChild(messageElement)
    })
  }
}

// Envoyer un message lorsque le bouton est cliqué
sendButton.addEventListener('click', () => {
  console.log('Button clicked')
  const userId = userSelect.value // Utilisez l'ID de l'utilisateur sélectionné
  const content = messageInput.value
  if (content.trim() !== '') {
    console.log('Sending message with content:', content)
    sendMessage(userId, content)
    messageInput.value = ''
  } else {
    console.log('Message content is empty')
  }
})

// Charger les utilisateurs et les messages au chargement de la page
window.onload = () => {
  getUsers()
  getMessages()
}
