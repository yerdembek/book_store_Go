const API_URL = window.location.origin === "null" ? "http://localhost:8080" : window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
    updateNav();

    if (document.getElementById("books-container")) {
        loadBooks();
    }

    if (document.getElementById("profile-username")) {
        loadProfile();
    }

    const createBookForm = document.getElementById("create-book-form");
    if (createBookForm) {
        createBookForm.addEventListener("submit", createBookWithFile);
    }
});

function updateNav() {
    const navContainer = document.getElementById("nav-buttons");
    if (!navContainer) return;

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (token) {
        navContainer.innerHTML = `
            <span class="navbar-text text-light me-3">Hello, ${email}</span>
            <a href="test-chat.html" class="btn btn-outline-light me-2">Chat</a>
            <a href="profile.html" class="btn btn-outline-light me-2">Profile</a>
            <button onclick="logout()" class="btn btn-danger">Logout</button>
        `;
        const addBtn = document.getElementById("add-book-btn");
        if (addBtn) addBtn.style.display = role === "admin" ? "inline-block" : "none";
    } else {
        navContainer.innerHTML = `
            <a href="login.html" class="btn btn-outline-light me-2">Login</a>
        `;
        const addBtn = document.getElementById("add-book-btn");
        if (addBtn) addBtn.style.display = "none";
    }
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;

    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", email);
            localStorage.setItem("role", data.user.role);
            window.location.href = "index.html";
        } else {
            alert("Login failed");
        }
    } catch (e) {
        console.error(e);
    }
}

async function register() {
    const email = document.getElementById("reg-email").value;
    const username = document.getElementById("reg-user").value;
    const password = document.getElementById("reg-pass").value;
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password })
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", email);
            localStorage.setItem("role", data.user.role);
            window.location.href = "index.html";
        } else {
            alert("Registration failed");
        }
    } catch (e) {
        console.error(e);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

async function loadBooks() {
    const container = document.getElementById("books-container");
    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border text-primary"></div></div>';

    try {
        const res = await fetch(`${API_URL}/books`);
        const books = await res.json();

        container.innerHTML = "";
        if (!books || books.length === 0) {
            container.innerHTML = '<p class="text-center w-100">No books found.</p>';
            return;
        }
        const role = localStorage.getItem("role");

        books.forEach(book => {
            let deleteBtn = "";
            if (role === "admin") {
                deleteBtn = `<button onclick="deleteBook('${book.id}')" class="btn btn-sm btn-outline-danger w-100 mt-2">Delete Book</button>`;
            }

            const card = `
                <div class="col">
                    <div class="card h-100 shadow-sm book-card">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${book.title}</h5>
                            <p class="card-text text-muted">${book.author}</p>
                            <span class="badge bg-primary mb-2">${book.is_premium ? "Premium" : "Free"}</span>
                        </div>
                        <div class="card-footer bg-white border-0">
                            <a href="read.html?id=${book.id}" class="btn btn-primary w-100 rounded-pill">Read Online</a>
                            ${deleteBtn}
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (e) {
        container.innerHTML = '<p class="text-danger text-center w-100">Error loading books</p>';
    }
}

async function createBookWithFile(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const title = document.getElementById("book-title").value;
    const author = document.getElementById("book-author").value;
    const isPremium = document.getElementById("book-premium").checked;
    const fileInput = document.getElementById("book-file");

    if (fileInput.files.length === 0) {
        alert("Please select a file!");
        return;
    }

    const status = document.getElementById("upload-status");
    if (status) status.style.display = "block";

    try {
        const res = await fetch(`${API_URL}/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, author, is_premium: isPremium })
        });

        if (!res.ok) throw new Error("Failed to create book metadata");

        const result = await res.json();
        const bookID = extractInsertedId(result);
        if (!bookID) throw new Error("Missing book id from server");

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        const uploadRes = await fetch(`${API_URL}/books/${bookID}/upload/file`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (uploadRes.ok) {
            alert("Book uploaded successfully!");
            window.location.reload();
        } else {
            alert("Book created, but file upload failed.");
        }

    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    } finally {
        if (status) status.style.display = "none";
    }
}

async function deleteBook(id) {
    if (!confirm("Delete this book?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) loadBooks();
}

async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const res = await fetch(`${API_URL}/api/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
        const user = await res.json();
        document.getElementById("profile-username").innerText = user.username;
        document.getElementById("profile-email").innerText = user.email;
        document.getElementById("profile-role").innerText = user.role;
        document.getElementById("edit-username").value = user.username;
    }
}

async function updateUsername() {
    const token = localStorage.getItem("token");
    const username = document.getElementById("edit-username").value;

    const res = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username })
    });
    if (res.ok) {
        alert("Username updated");
        location.reload();
    } else {
        alert("Error updating username");
    }
}

async function changePassword() {
    const token = localStorage.getItem("token");
    const oldPassword = document.getElementById("old-pass").value;
    const newPassword = document.getElementById("new-pass").value;

    const res = await fetch(`${API_URL}/api/profile/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    });
    if (res.ok) {
        alert("Password changed");
        document.getElementById("old-pass").value = "";
        document.getElementById("new-pass").value = "";
    } else {
        alert("Error changing password");
    }
}

async function deleteAccount() {
    if (!confirm("Are you sure? This is permanent.")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/profile`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });
    if (res.ok) logout();
}

async function upgradeSubscription(type) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/subscription/upgrade`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: type })
    });
    if (res.ok) alert("Subscribed to " + type + " successfully!");
    else alert("Subscription failed");
}

function extractInsertedId(result) {
    if (!result) return null;
    if (typeof result.InsertedID === "string") return result.InsertedID;
    if (result.InsertedID && typeof result.InsertedID === "object") {
        if (result.InsertedID.$oid) return result.InsertedID.$oid;
        if (result.InsertedID.OID) return result.InsertedID.OID;
    }
    if (typeof result.insertedId === "string") return result.insertedId;
    if (result.insertedId && typeof result.insertedId === "object") {
        if (result.insertedId.$oid) return result.insertedId.$oid;
    }
    return null;
}