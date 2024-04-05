let wsConnection;
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messageContainer = document.getElementById("messageContainer");
const wsOpenButton = document.getElementById("ws-open");
const wsCloseButton = document.getElementById("ws-close");

// Function to display a received message in the chat window
function displayMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.textContent = `Received message: ${message}`;
  messageContainer.appendChild(messageElement);
}

// Function to clear all messages from the chat window
function clearMessages() {
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild);
  }
}

// Function to close the WebSocket connection if it's open
function closeOpenConnection() {
  if (!!wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
}

// Event listener for the message form submission
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();

  if (message && !!wsConnection) {
    saveMessage(message);
    wsConnection.send(message);

    messageInput.value = "";
    console.log(`Sent "${message}"`);
  }
});

// Function to save a message to the server
function saveMessage(message) {
  fetch("/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
}

// Function to load chat history from the server
function loadChatHistory() {
  clearMessages();

  fetch("/message/history")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    })
    .then((messages) => {
      messages.forEach(displayMessage);
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      // Handle the error (e.g., display an error message to the user)
    });
}

// Event listener for opening a new WebSocket connection
wsOpenButton.addEventListener("click", () => {
  closeOpenConnection();
  loadChatHistory();

  wsConnection = new WebSocket("ws://localhost:3000");

  wsConnection.addEventListener("error", () => {
    console.error("WebSocket error");
  });

  wsConnection.addEventListener("open", () => {
    console.log("WebSocket connection established");
  });

  wsConnection.addEventListener("close", () => {
    console.log("WebSocket connection closed");
  });

  wsConnection.addEventListener("message", (message) => {
    displayMessage(message.data);
  });
});

// Event listener for closing the WebSocket connection
wsCloseButton.addEventListener("click", closeOpenConnection);
