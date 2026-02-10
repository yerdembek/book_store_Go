//  (MOCK DATA)-
const mockBooks = [
    { id: 1, title: "Гарри Поттер", author: "Дж.К. Роулинг", is_premium: false },
    { id: 2, title: "Властелин Колец", author: "Дж.Р.Р. Толкин", is_premium: true },
    { id: 3, title: "Изучаем Go", author: "Джон Доу", is_premium: false },
    { id: 4, title: "Atomic Habits", author: "James Clear", is_premium: true }
];

const mockUser = {
    username: "DemoUser",
    role: "admin"
};

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    updateNavbar(token);

    const path = window.location.pathname;
    if (path.includes("index.html") || path === "/") initMainPage();
    if (path.includes("login.html")) initLoginPage();
});

function updateNavbar(token) {
    const nav = document.getElementById("nav-buttons");
    if (!nav) return;

    if (token) {
        nav.innerHTML = `
            <button onclick="logout()" class="btn btn-outline-danger rounded-pill">Выйти</button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="login()" class="btn btn-dark rounded-pill">Вход (Demo)</button>
        `;
    }
}

// index
function initMainPage() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("books-container");
    const addBtn = document.getElementById("add-book-btn");

    if (addBtn) addBtn.style.display = token ? "inline-block" : "none";

    container.innerHTML = "";

    // Используем MOCK данные вместо fetch
    mockBooks.forEach(book => {
        const isPremium = book.is_premium;
        //  читают все, кто вошел
        const canRead = !isPremium || token;

        let actionBtn = "";
        if (canRead) {
            actionBtn = `<a href="read.html?id=${book.id}" class="btn btn-primary-custom w-100 mb-2">
                            <i class="bi bi-book-half me-2"></i>Читать
                         </a>`;
        } else {
            actionBtn = `<button onclick="alert('Купите подписку!')" class="btn btn-secondary w-100 mb-2">
                            <i class="bi bi-lock-fill me-2"></i>Нужна подписка
                         </button>`;
        }

        let uploadHtml = "";
        if (token) {
            uploadHtml = `
            <div class="pt-2 border-top bg-light p-2 rounded">
                <label class="small text-muted fw-bold">Файл (Demo):</label>
                <div class="input-group input-group-sm mt-1">
                    <input type="file" disabled class="form-control">
                    <button onclick="alert('В демо режиме нельзя загружать')" class="btn btn-dark">Upload</button>
                </div>
            </div>`;
        }

        const html = `
        <div class="col">
            <div class="book-card h-100 d-flex flex-column">
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

    // Фейковое создание книги
    const createForm = document.getElementById("create-book-form");
    if (createForm) {
        createForm.onsubmit = (e) => {
            e.preventDefault();
            alert("Книга 'создана'! (Обновите страницу, чтобы сбросить демо)");
            const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
            modal.hide();
        };
    }
}

// фейк логин
function login() {
    localStorage.setItem("token", "demo_token_123");
    location.reload();
}

function logout() {
    localStorage.clear();
    location.reload();
}