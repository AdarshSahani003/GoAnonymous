// Import Firebase SDK modules directly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  await addDoc(collection(db, 'messages'), {
    text: messageText,
    upvotes: 0,
    timestamp: new Date()
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
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy(sortByLatest ? 'timestamp' : 'upvotes', 'desc')
  );

  const querySnapshot = await getDocs(messagesQuery);
  messagesContainer.innerHTML = ''; // Clear previous messages

  querySnapshot.forEach((doc) => {
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
  document.querySelectorAll('.upvote-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const messageRef = doc(db, 'messages', id);
      const messageSnap = await getDoc(messageRef);
      const newUpvotes = (messageSnap.data().upvotes || 0) + 1;
      await updateDoc(messageRef, { upvotes: newUpvotes });
      fetchMessages(); // Refresh after upvoting
    });
  });
}

// Initial fetch
fetchMessages();
