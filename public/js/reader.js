const API_URL = "http://localhost:8080";
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');
const formatFromUrl = urlParams.get('format');

const loader = document.getElementById('loader');
const pageInfo = document.getElementById('page-info');
const pdfContainer = document.getElementById('pdf-container');
const epubViewer = document.getElementById('epub-viewer');

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

if (!bookId) {
    alert("Книга не указана");
    window.location.href = 'index.html';
} else {
    loadBookData();
}

async function loadBookData() {
    try {
        const resp = await fetch(`${API_URL}/books/${bookId}`);
        const book = await resp.json();

        // ИГНОРИРУЕМ file_path и смотрим на URL
        if (formatFromUrl === 'epub') {
            initEpub();
        } else if (formatFromUrl === 'pdf') {
            initPdf();
        } else {
            loader.innerHTML = `<div class='text-danger'>Неизвестный формат из URL: ${formatFromUrl}</div>`;
        }
    } catch (err) {
        console.error(err);
        loader.innerHTML = "<div class='text-danger'>Ошибка загрузки данных книги</div>";
    }
}

function initEpub() {
    pdfContainer.style.display = 'none';
    epubViewer.style.display = 'block';
    epubViewer.style.background = 'white'; // EPUB лучше читать на белом

    const bookUrl = `${API_URL}/books/${bookId}/download/epub`;
    const book = ePub(bookUrl);
    const rendition = book.renderTo("epub-viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated", // Листание страницами
        manager: "default"
    });

    rendition.display().then(() => {
        loader.style.display = 'none';
    });

    // Навигация
    document.getElementById('next-btn').onclick = () => rendition.next();
    document.getElementById('prev-btn').onclick = () => rendition.prev();

    rendition.on("relocated", (location) => {
        const percent = Math.round(location.start.percentage * 100);
        pageInfo.textContent = `Прогресс: ${percent}%`;
    });

    // Зум для EPUB (изменение шрифта)
    let fontSize = 100;
    document.getElementById('zoom-in').onclick = () => {
        fontSize += 10;
        rendition.themes.fontSize(`${fontSize}%`);
    };
    document.getElementById('zoom-out').onclick = () => {
        fontSize -= 10;
        rendition.themes.fontSize(`${fontSize}%`);
    };
}

function initPdf() {
    pdfContainer.style.display = 'block';
    epubViewer.style.display = 'none';

    const canvas = document.getElementById('the-canvas');
    const ctx = canvas.getContext('2d');
    const bookUrl = `${API_URL}/books/${bookId}/download/pdf`;

    pdfjsLib.getDocument(bookUrl).promise.then(pdf => {
        let pageNum = 1;
        let scale = 1.2;

        function renderPage(num) {
            pdf.getPage(num).then(page => {
                const viewport = page.getViewport({ scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                page.render({ canvasContext: ctx, viewport: viewport });
                pageInfo.textContent = `Стр. ${num} / ${pdf.numPages}`;
            });
        }

        renderPage(pageNum);

        document.getElementById('next-btn').onclick = () => {
            if (pageNum >= pdf.numPages) return;
            pageNum++; renderPage(pageNum);
        };
        document.getElementById('prev-btn').onclick = () => {
            if (pageNum <= 1) return;
            pageNum--; renderPage(pageNum);
        };
        document.getElementById('zoom-in').onclick = () => { scale += 0.2; renderPage(pageNum); };
        document.getElementById('zoom-out').onclick = () => { scale -= 0.2; renderPage(pageNum); };

        loader.style.display = 'none';
    });
}