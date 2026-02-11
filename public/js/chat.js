let socket;
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatStatus = document.getElementById('chat-status');

const currentUserEmail = localStorage.getItem("user_email") || "Гость";

function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?email=${encodeURIComponent(currentUserEmail)}`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        chatStatus.innerText = "В сети";
        chatStatus.className = "badge bg-success";
        console.log("Соединение установлено");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        addMessage(data);
    };

    socket.onclose = (e) => {
        chatStatus.innerText = "Отключен";
        chatStatus.className = "badge bg-danger";
        console.log("Соединение закрыто. Повтор через 3 сек...", e.reason);
        setTimeout(connect, 3000); // Авто-реконнект
    };

    socket.onerror = (err) => {
        console.error("Ошибка сокета: ", err);
        socket.close();
    };
}

function addMessage(msg) {
    const isMe = msg.sender === currentUserEmail;

    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isMe ? 'msg-me' : 'msg-other'}`;

    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    msgDiv.innerHTML = `
        ${!isMe ? `<span class="msg-info">${msg.sender}</span>` : ''}
        <div class="msg-content">${msg.content}</div>
        <span class="msg-time">${time}</span>
    `;

    chatMessages.appendChild(msgDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.onsubmit = (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();

    if (content && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(content);
        messageInput.value = '';
    }
};

if (localStorage.getItem("token")) {
    connect();
} else {
    alert("Пожалуйста, войдите в систему, чтобы пользоваться чатом");
    window.location.href = "login.html";
}