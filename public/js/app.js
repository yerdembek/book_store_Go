const API_URL = "http://localhost:8080"; // Замени на свой URL

// Универсальные заголовки с токеном
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Выход из системы
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    updateNavbar(token);

    const path = window.location.pathname;

    // Вызываем основную функцию инициализации (переименованную из initMainPage)
    if (path.includes("index.html") || path === "/" || path === "") {
        loadBooks(token, role);
    } else if (path.includes("profile.html")) {
        loadMyProfile();
    }
});

function updateNavbar(token) {
    const nav = document.getElementById("nav-buttons");
    if (!nav) return;

    if (token) {
        nav.innerHTML = `
            <a href="chat.html" class="btn btn-outline-primary rounded-pill me-2">Чат</a>
            <a href="profile.html" class="btn btn-outline-dark rounded-pill me-2">Профиль</a>
            <button onclick="logout()" class="btn btn-danger rounded-pill">Выйти</button>
        `;
    } else {
        nav.innerHTML = `
            <a href="login.html" class="btn btn-dark rounded-pill">Вход / Регистрация</a>
        `;
    }
}

// ЭТА ФУНКЦИЯ СОДЕРЖИТ ЛОГИКУ ЗАГРУЗКИ СПИСКА И ОБРАБОТЧИК ФОРМЫ
async function loadBooks(token, role) {
    const container = document.getElementById("books-container");
    const addBtn = document.getElementById("add-book-btn");
    if (!container) return;

    // Показываем кнопку добавления только админу
    if (addBtn) addBtn.style.display = (role === "admin") ? "inline-block" : "none";

    // --- ЛОГИКА ЗАГРУЗКИ КНИГ ---
    container.innerHTML = "<p class='text-center w-100'>Загрузка...</p>"; // Индикатор загрузки

    try {
        const resp = await fetch(`${API_URL}/books`);
        const books = await resp.json();
        container.innerHTML = "";

        if (!books || books.length === 0) {
            container.innerHTML = "<p class='text-center w-100'>Библиотека пуста</p>";
            return;
        }

        books.forEach(book => {
            const isPremium = book.is_premium;
            const canRead = !isPremium || token;
            const bookId = book.id || book._id;

            const isEpub = book.file_path && book.file_path.toLowerCase().endsWith('.epub');
            const format = isEpub ? 'epub' : 'pdf';

            const actionBtn = canRead
                ? `<a href="read.html?id=${bookId}&format=${format}" class="btn btn-primary-custom w-100 mb-2">Читать</a>`
                : `<button onclick="alert('Нужна подписка!')" class="btn btn-secondary w-100 mb-2">🔒 Premium</button>`;

            let adminBtns = "";
            if (role === "admin") {
                adminBtns = `<button onclick="deleteBook('${bookId}')" class="btn btn-outline-danger btn-sm w-100 mt-1">Удалить</button>`;
            }

            let uploadHtml = (role === "admin") ? `
                <div class="pt-2 border-top mt-2">
                    <div class="input-group input-group-sm">
                        <input type="file" id="file-${bookId}" class="form-control">
                        <button onclick="uploadFile('${bookId}')" class="btn btn-dark">ОК</button>
                    </div>
                </div>` : "";

            container.innerHTML += `
                <div class="col">
                    <div class="book-card h-100 shadow-sm border-0 p-3">
                        <h5 class="fw-bold">${book.title}</h5>
                        <p class="text-muted small">${book.author}</p>
                        ${actionBtn}
                        ${adminBtns}
                        ${uploadHtml}
                    </div>
                </div>`;
        });
    } catch (err) {
        container.innerHTML = "Ошибка загрузки.";
    }

    // --- ЛОГИКА ОБРАБОТЧИКА ФОРМЫ СОЗДАНИЯ КНИГИ ---
    const createForm = document.getElementById("create-book-form");
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('book-title').value;
            const author = document.getElementById('book-author').value;
            const isPremium = document.getElementById('book-premium').checked;

            if (!title || !author) return alert("Заполните все поля!");

            try {
                const resp = await fetch(`${API_URL}/books`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        title: title,
                        author: author,
                        is_premium: isPremium,
                    })
                });

                if (resp.ok) {
                    alert("Книга успешно создана! Список будет обновлен.");

                    const modalElement = document.getElementById('addBookModal');
                    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                    modal.hide();

                    location.reload();

                } else {
                    const data = await resp.json();
                    alert(data.error || "Ошибка при создании книги на сервере");
                }
            } catch (err) {
                alert("Ошибка сети при создании книги");
            }
        });
    }
}

async function deleteBook(id) {
    if (!confirm("Удалить эту книгу?")) return;
    try {
        const resp = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (resp.ok) location.reload();
        else alert("Ошибка при удалении");
    } catch (err) { alert("Сервер недоступен"); }
}

async function uploadFile(bookId) {
    const fileInput = document.getElementById(`file-${bookId}`);
    if (!fileInput || !fileInput.files[0]) return alert("Выберите файл!");

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${API_URL}/books/${bookId}/upload/file`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (resp.ok) {
            alert("Загружено!");
            location.reload();
        } else {
            alert("Ошибка при загрузке на сервер");
        }
    } catch (err) {
        alert("Ошибка сети");
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    try {
        const resp = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        if (resp.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user_email", data.user.email);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("role", data.user.role);
            window.location.href = "index.html";
        } else { alert(data.error || "Ошибка входа"); }
    } catch (err) { alert("Сервер недоступен"); }
}

async function register() {
    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;
    try {
        const resp = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
        });
        const data = await resp.json();
        if (resp.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user_email", data.user.email);
            localStorage.setItem("role", "user");
            window.location.href = "index.html";
        } else { alert(data.error || "Ошибка регистрации"); }
    } catch (err) { alert("Ошибка сети"); }
}

async function loadMyProfile() {
    const usernameEl = document.getElementById('profile-username');
    if (!usernameEl) return;

    try {
        const resp = await fetch(`${API_URL}/api/me`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (resp.ok) {
            const user = await resp.json();
            usernameEl.innerText = user.username;
            document.getElementById('profile-email').innerText = user.email;
            document.getElementById('profile-role').innerText = user.role;

            const subEl = document.getElementById('profile-sub');
            if (subEl && user.subscription) {
                subEl.innerText = user.subscription;
            }
        } else { logout(); }
    } catch (err) { console.error("Ошибка профиля", err); }
}