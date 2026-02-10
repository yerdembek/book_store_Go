const API_URL = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    updateNavbar(token);

    const path = window.location.pathname;
    if (path.includes("index.html") || path.endsWith("/")) {
        initMainPage();
    }
});

function updateNavbar(token) {
    const nav = document.getElementById("nav-buttons");
    if (!nav) return;

    if (token) {
        nav.innerHTML = `
            <a href="profile.html" class="btn btn-outline-dark rounded-pill me-2">Профиль</a>
            <button onclick="logout()" class="btn btn-danger rounded-pill">Выйти</button>
        `;
    } else {
        nav.innerHTML = `
            <a href="login.html" class="btn btn-dark rounded-pill">Вход / Регистрация</a>
        `;
    }
}

async function initMainPage() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("books-container");
    const addBtn = document.getElementById("add-book-btn");

    if (addBtn) addBtn.style.display = token ? "inline-block" : "none";

    try {
        const resp = await fetch(`${API_URL}/books`);
        if (!resp.ok) throw new Error("Ошибка при получении книг");
        const books = await resp.json();

        container.innerHTML = "";

        if (!books || books.length === 0) {
            container.innerHTML = "<p class='text-center w-100'>В библиотеке пока пусто...</p>";
            return;
        }

        books.forEach(book => {
            const isPremium = book.is_premium;
            const canRead = !isPremium || token;

            const isEpub = book.file_path && book.file_path.toLowerCase().endsWith('.epub');
            const format = isEpub ? 'epub' : 'pdf';

            let actionBtn = "";
            if (canRead) {
                actionBtn = `<a href="read.html?id=${book.id}&format=${format}" class="btn btn-primary-custom w-100 mb-2">
                                <i class="bi bi-book-half me-2"></i>Читать
                             </a>`;
            } else {
                actionBtn = `<button onclick="alert('Для этой книги нужна подписка!')" class="btn btn-secondary w-100 mb-2">
                                <i class="bi bi-lock-fill me-2"></i>Нужна подписка
                             </button>`;
            }

            let uploadHtml = "";
            if (token) {
                uploadHtml = `
                <div class="pt-2 border-top bg-light p-2 rounded mt-2">
                    <label class="small text-muted fw-bold">Загрузить файл (PDF/EPUB):</label>
                    <div class="input-group input-group-sm mt-1">
                        <input type="file" id="file-${book.id}" class="form-control">
                        <button onclick="uploadFile('${book.id}')" class="btn btn-dark">OK</button>
                    </div>
                </div>`;
            }

            const html = `
            <div class="col">
                <div class="book-card h-100 d-flex flex-column shadow-sm border-0">
                    <div class="book-cover" style="background: ${isPremium ? '#4c1d95' : '#3b82f6'};">
                        ${isPremium ? '<span class="price-badge">Premium</span>' : '<span class="price-badge text-dark">Free</span>'}
                        <i class="bi bi-book" style="font-size: 4rem; opacity: 0.8;"></i>
                    </div>
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <h5 class="fw-bold text-truncate">${book.title}</h5>
                        <p class="text-muted small mb-3">${book.author}</p>
                        <div class="mt-auto">
                            ${actionBtn}
                            ${uploadHtml}
                        </div>
                    </div>
                </div>
            </div>`;
            container.innerHTML += html;
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p class='text-center text-danger w-100'>Не удалось загрузить книги. Проверьте сервер Go.</p>";
    }

    // РЕАЛЬНОЕ создание книги
    const createForm = document.getElementById("create-book-form");
    if (createForm) {
        createForm.onsubmit = async (e) => {
            e.preventDefault();
            const bookData = {
                title: document.getElementById("book-title").value,
                author: document.getElementById("book-author").value,
                is_premium: document.getElementById("book-premium").checked
            };

            const resp = await fetch(`${API_URL}/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });

            if (resp.ok) {
                alert("Книга создана!");
                location.reload();
            } else {
                alert("Ошибка при создании книги");
            }
        };
    }
}

async function uploadFile(bookId) {
    const fileInput = document.getElementById(`file-${bookId}`);
    if (!fileInput.files[0]) return alert("Выберите файл!");

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const resp = await fetch(`${API_URL}/books/${bookId}/upload/file`, {
            method: 'POST',
            body: formData
        });

        if (resp.ok) {
            alert("Файл успешно загружен и привязан!");
            location.reload();
        } else {
            alert("Ошибка при загрузке файла на сервер");
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

        if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        } else {
            alert("Неверный email или пароль");
        }
    } catch (err) {
        alert("Сервер недоступен");
    }
}

async function register() {
    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;

    const resp = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    });

    if (resp.ok) {
        alert("Регистрация успешна! Теперь войдите.");
        location.reload();
    } else {
        alert("Ошибка при регистрации (возможно, email уже занят)");
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}