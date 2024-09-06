// Initialize Firebase
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
  
  // Handle form submission
  document.getElementById('messageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('messageInput').value;
    if (messageInput.trim() === '') return;
  
    await db.collection('messages').add({
      text: messageInput,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      upvotes: 0
    });
  
    document.getElementById('messageInput').value = '';
    loadMessages();
  });
  
  // Load and display messages
  async function loadMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
  
    let q;
    if (sortByLatest) {
      q = db.collection('messages').orderBy('timestamp', 'desc').limit(50);
    } else {
      q = db.collection('messages').orderBy('upvotes', 'desc').limit(50);
    }
  
    try {
      const querySnapshot = await q.get();
      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
          <p>${messageData.text}</p>
          <span class="upvotes">${messageData.upvotes} Upvotes</span>
          <button class="upvoteBtn" data-id="${doc.id}">Upvote</button>
        `;
        messagesContainer.appendChild(messageElement);
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }
  
  // Handle upvote button clicks
  document.getElementById('messagesContainer').addEventListener('click', async (e) => {
    if (e.target.classList.contains('upvoteBtn')) {
      const messageId = e.target.getAttribute('data-id');
      const messageRef = db.collection('messages').doc(messageId);
      try {
        // Update the upvote count in Firestore
        await messageRef.update({
          upvotes: firebase.firestore.FieldValue.increment(1)
        });
  
        // Refresh the messages list to reflect the updated upvotes
        loadMessages();
      } catch (error) {
        console.error('Error updating upvotes:', error);
      }
    }
  });
  
  // Initialize sorting
  let sortByLatest = true;
  
  document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
    
    // Toggle switch event listener
    document.getElementById('toggleSort').addEventListener('change', () => {
      sortByLatest = !sortByLatest;
      document.getElementById('toggleLabel').textContent = `Sort by: ${sortByLatest ? 'Latest' : 'Most Upvoted'}`;
      loadMessages();
    });
  });
  