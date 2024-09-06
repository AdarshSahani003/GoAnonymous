// Firebase Configuration (restricted key)
const firebaseConfig = {
  apiKey: "AIzaSyAcyNJq5x-HRsaBewFcfe0cix96fEgDcfY",
  authDomain: "goanonymous-8126e.firebaseapp.com",
  projectId: "goanonymous-8126e",
  storageBucket: "goanonymous-8126e.appspot.com",
  messagingSenderId: "334767869045",
  appId: "1:334767869045:web:cb64e9d39c577df87fbc3c",
  measurementId: "G-WLEFD6NJF2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const toggleSort = document.getElementById('toggleSort');
let sortByLatest = true; // Default sorting by latest

// Add a new message
messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageText = messageInput.value;
  if (messageText.trim() === '') return;

  // Add message to Firestore
  await db.collection('messages').add({
    text: messageText,
    upvotes: 0,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = '';
  fetchMessages(); // Refresh messages
});

// Toggle between Latest and Most Upvoted
toggleSort.addEventListener('change', () => {
  sortByLatest = !sortByLatest;
  fetchMessages();
});

// Fetch and display messages
async function fetchMessages() {
  let query = db.collection('messages');
  if (sortByLatest) {
    query = query.orderBy('timestamp', 'desc');
  } else {
    query = query.orderBy('upvotes', 'desc');
  }

  const snapshot = await query.get();
  messagesContainer.innerHTML = ''; // Clear previous messages

  snapshot.forEach(doc => {
    const message = doc.data();
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
      <p>${message.text}</p>
      <button class="upvote-btn" data-id="${doc.id}">Upvote (${message.upvotes})</button>
    `;
    messagesContainer.appendChild(messageElement);
  });

  // Attach upvote event listeners
  document.querySelectorAll('.upvote-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const messageRef = db.collection('messages').doc(id);
      const message = await messageRef.get();
      const newUpvotes = (message.data().upvotes || 0) + 1;
      await messageRef.update({ upvotes: newUpvotes });
      fetchMessages(); // Refresh after upvoting
    });
  });
}

// Initial fetch
fetchMessages();
