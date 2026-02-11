const API_URL = window.location.origin === "null" ? "http://localhost:8080" : window.location.origin;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    if (!bookId) {
        window.location.href = "index.html";
        return;
    }

    const loader = document.getElementById("loader");
    const container = document.getElementById("pdf-container");

    try {
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": "Bearer " + token } : {};

        const metaRes = await fetch(`${API_URL}/books/${bookId}`, { headers });
        if (!metaRes.ok) throw new Error("Не удалось загрузить данные книги");

        const book = await metaRes.json();
        const titleEl = document.getElementById("book-title-display");
        if (titleEl) titleEl.innerText = book.title;
        document.title = book.title;

        const pdfUrl = `${API_URL}/books/${bookId}/download/pdf`;
        const epubUrl = `${API_URL}/books/${bookId}/download/epub`;

        const pdfHead = await fetch(pdfUrl, { method: "HEAD", headers });
        if (pdfHead.ok || pdfHead.status === 405) {
            container.innerHTML = `
                <iframe src="${pdfUrl}#toolbar=0" type="application/pdf" width="100%" height="100%" style="border: none;">
                    <p class="text-white text-center mt-5">
                        Ваш браузер не поддерживает PDF.
                        <a href="${pdfUrl}" target="_blank" class="text-info">Скачать файл</a>
                    </p>
                </iframe>
            `;
        } else if (pdfHead.status === 404) {
            const epubHead = await fetch(epubUrl, { method: "HEAD", headers });
            if (epubHead.ok || epubHead.status === 405) {
                container.innerHTML = `
                    <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white">
                        <h3 class="mb-3">EPUB доступен для скачивания</h3>
                        <a href="${epubUrl}" class="btn btn-outline-light" target="_blank">Скачать EPUB</a>
                    </div>
                `;
            } else if (epubHead.status === 404) {
                throw new Error("Файл книги еще не загружен на сервер.");
            } else {
                throw new Error("Ошибка загрузки файла");
            }
        } else {
            throw new Error("Ошибка загрузки файла");
        }

        loader.style.display = "none";
        container.style.display = "block";

    } catch (err) {
        console.error(err);
        loader.innerHTML = `
            <div class="text-center text-danger mt-5">
                <h3>Ошибка открытия</h3>
                <p>${err.message}</p>
                <a href="index.html" class="btn btn-outline-light btn-sm mt-3">Назад в библиотеку</a>
            </div>
        `;
    }
});