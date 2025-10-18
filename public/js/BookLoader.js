/**
 * Generic function to load books by genre from API
 * @param {string} genre - The book genre to fetch
 * @param {string} containerId - The ID of the container element to render books into
 * @param {function} customRenderer - Optional custom function to render each book
 */
async function loadBooksByGenre(genre, containerId, customRenderer = null) {
    const bookContainer = document.getElementById(containerId);
    if (!bookContainer) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }

    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = '<p>Đang tải sách...</p>';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '20px';
    bookContainer.appendChild(loadingDiv);

    try {
        const response = await fetch(`/api/books/genre/${encodeURIComponent(genre)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch books for genre: ${genre}`);
        }

        const books = await response.json();
        bookContainer.innerHTML = ''; // Clear loading message

        if (books.length === 0) {
            bookContainer.innerHTML = `<p>Không có sách nào trong thể loại ${genre}.</p>`;
            return;
        }

        // Render books using custom renderer or default renderer
        if (customRenderer && typeof customRenderer === 'function') {
            books.forEach(book => customRenderer(book, bookContainer));
        } else {
            renderDefaultBook(bookContainer, books);
        }

        // Trigger pagination update after books are loaded
        setTimeout(() => {
            if (window.updatePagination) {
                window.updatePagination();
            }
        }, 100);

    } catch (error) {
        console.error('Error loading books:', error);
        bookContainer.innerHTML = '<p>Có lỗi xảy ra khi tải sách. Vui lòng thử lại sau.</p>';
    }
}

/**
 * Default book renderer
 * @param {HTMLElement} container - The container element
 * @param {Array} books - Array of book objects
 */
function renderDefaultBook(container, books) {
    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';

        const discountPrice = book.discount > 0
            ? (parseFloat(book.price.replace(' đ', '').replace('.', '')) * (1 - book.discount / 100))
            : parseFloat(book.price.replace(' đ', '').replace('.', ''));

        const formattedDiscountPrice = discountPrice.toLocaleString('vi-VN');
        const formattedOriginalPrice = parseFloat(book.price.replace(' đ', '').replace('.', '')).toLocaleString('vi-VN');

        bookItem.innerHTML = `
            <div class="book-image">
                <img src="../img/${book.image}" alt="${book.title}">
                <div class="overlay-info">
                    <a href="../html/Thongtinsanpham.html?id=${book.bookId}" class="info-btn">Thông tin sách</a>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <div class="book-price">
                    ${book.discount > 0 ? `
                        <div class="price-discount">
                            <span class="price">${formattedDiscountPrice} đ</span>
                            <span class="discount"> -${book.discount}%</span>
                        </div>
                        <span class="original-price">${formattedOriginalPrice} đ</span>
                    ` : `
                        <span class="price">${formattedOriginalPrice} đ</span>
                    `}
                </div>
                <a href="#" style="text-decoration: none;">MUA</a>
            </div>
        `;
        container.appendChild(bookItem);
    });
}

/**
 * Convenience function for loading Văn học books
 */
function loadVanhocBooks() {
    loadBooksByGenre('Văn học', 'book-list');
}

/**
 * Convenience function for loading Tâm lý - Kỹ năng sống books
 */
function loadTamlyKynangsongBooks() {
    loadBooksByGenre('Tâm lý - Kỹ năng sống', 'book-list');
}

/**
 * Convenience function for loading Tiểu thuyết books
 */
function loadTieuthuyetBooks() {
    loadBooksByGenre('Tiểu thuyết', 'book-list');
}

/**
 * Convenience function for loading Truyện tranh books
 */
function loadTruyentranhBooks() {
    loadBooksByGenre('Truyện tranh', 'book-list');
}

/**
 * Convenience function for loading Sách kinh tế books
 */
function loadSachkinhteBooks() {
    loadBooksByGenre('Sách kinh tế', 'book-list');
}
