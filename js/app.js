// Your Firebase configuration
const firebaseConfig = {
  apiKey: "your-public-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, doc, getDoc, updateDoc } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const messagesContainer = document.getElementById('messagesContainer');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const toggleSort = document.getElementById('toggleSort');
const toggleLabel = document.getElementById('toggleLabel');

let sortByLatest = true;

messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageText = messageInput.value;
  if (messageText) {
    await addDoc(collection(db, 'messages'), {
      text: messageText,
      upvotes: 0,
      timestamp: new Date()
    });
    messageInput.value = '';
  }
});

const fetchMessages = async () => {
  const q = query(collection(db, 'messages'), orderBy(sortByLatest ? 'timestamp' : 'upvotes', sortByLatest ? 'desc' : 'desc'));
  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.innerHTML = `
        <p>${data.text}</p>
        <button class="upvote" data-id="${doc.id}">Upvote (${data.upvotes})</button>
      `;
      messagesContainer.appendChild(messageDiv);
    });
  });
};

fetchMessages();

messagesContainer.addEventListener('click', async (e) => {
  if (e.target.classList.contains('upvote')) {
    const id = e.target.getAttribute('data-id');
    const messageRef = doc(db, 'messages', id);
    const docSnap = await getDoc(messageRef);
    const newUpvotes = docSnap.data().upvotes + 1;
    await updateDoc(messageRef, { upvotes: newUpvotes });
  }
});

toggleSort.addEventListener('change', () => {
  sortByLatest = !sortByLatest;
  toggleLabel.textContent = `Sort by: ${sortByLatest ? 'Latest' : 'Most Upvoted'}`;
  fetchMessages();
});
