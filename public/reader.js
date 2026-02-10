const API_URL = "http://localhost:8080";
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');
const format = urlParams.get('format'); // 'pdf' или 'epub'

const loader = document.getElementById('loader');
const pageInfo = document.getElementById('page-info');

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

if (!bookId || !format) {
    alert("Книга не найдена в параметрах URL");
} else {
    initReader();
}

function initReader() {
    if (format === 'epub') {
        loadEpub();
    } else if (format === 'pdf') {
        loadPdf();
    } else {
        alert("Неподдерживаемый формат");
    }
}

function loadEpub() {
    const viewer = document.getElementById('epub-viewer');
    viewer.style.display = 'block';

    const bookUrl = `${API_URL}/books/${bookId}/download/epub`;

    const book = ePub(bookUrl);
    const rendition = book.renderTo("epub-viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated",
        manager: "default"
    });

    const display = rendition.display();

    display.then(() => {
        loader.style.display = 'none';
        console.log("EPUB успешно отрисован");
    });

    document.getElementById('next-btn').onclick = (e) => {
        e.preventDefault();
        rendition.next();
    };
    document.getElementById('prev-btn').onclick = (e) => {
        e.preventDefault();
        rendition.prev();
    };

    rendition.on("relocated", (location) => {
        const percent = Math.round(location.start.percentage * 100);
        pageInfo.textContent = `Прогресс: ${percent}%`;
    });

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

function loadPdf() {
    const canvas = document.getElementById('the-canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('pdf-container');
    container.style.display = 'block';

    const bookUrl = `${API_URL}/books/${bookId}/download/pdf`;

    pdfjsLib.getDocument(bookUrl).promise.then(pdf => {
        let currentPage = 1;
        let scale = 1.5;

        function renderPage(num) {
            pdf.getPage(num).then(page => {
                const viewport = page.getViewport({ scale: scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                page.render(renderContext);
                pageInfo.textContent = `Страница ${num} из ${pdf.numPages}`;
            });
        }

        renderPage(currentPage);

        document.getElementById('next-btn').onclick = () => {
            if (currentPage >= pdf.numPages) return;
            currentPage++;
            renderPage(currentPage);
        };

        document.getElementById('prev-btn').onclick = () => {
            if (currentPage <= 1) return;
            currentPage--;
            renderPage(currentPage);
        };

        document.getElementById('zoom-in').onclick = () => {
            scale += 0.2;
            renderPage(currentPage);
        };
        document.getElementById('zoom-out').onclick = () => {
            if (scale <= 0.5) return;
            scale -= 0.2;
            renderPage(currentPage);
        };

        loader.style.display = 'none';
    }).catch(err => {
        console.error("Ошибка загрузки PDF:", err);
        loader.style.display = 'none';
        alert("Ошибка при чтении PDF. Проверьте консоль.");
    });
}