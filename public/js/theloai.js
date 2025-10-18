// theloai.js - Xử lý trang thể loại sách

class TheLoaiPage {
    constructor() {
        this.currentGenre = null;
        this.books = [];
        this.filteredBooks = [];
        this.currentSort = 'default';
        this.init();
    }

    init() {
        // Đợi DOM tải xong
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializePage());
        } else {
            this.initializePage();
        }
    }

    initializePage() {
        // Lấy genre từ URL
        this.currentGenre = this.getGenreFromURL();
        
        // Bind sort event
        this.bindSortEvent();
        
        // Nếu có genre, tải sách theo genre đó
        if (this.currentGenre) {
            this.loadBooksByGenre(this.currentGenre);
        } else {
            console.log("⚠️ Không có genre được chỉ định, sẽ hiển thị tất cả sách");
            // Fallback: hiển thị tất cả sách
            this.loadAllBooks();
        }
    }
    
    bindSortEvent() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applySorting();
            });
        }
    }
    
    applySorting() {
        // Clone books array to avoid mutating original
        let sortedBooks = [...this.books];
        
        switch(this.currentSort) {
            case 'name-asc':
                sortedBooks.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
                break;
            case 'name-desc':
                sortedBooks.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
                break;
            case 'price-asc':
                sortedBooks.sort((a, b) => {
                    const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                    const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                sortedBooks.sort((a, b) => {
                    const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                    const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                    return priceB - priceA;
                });
                break;
            default:
                // Keep original order
                break;
        }
        
        this.filteredBooks = sortedBooks;
        this.renderBooksFromFiltered();
    }
    
    renderBooksFromFiltered() {
        const container = this.getOrCreateBooksContainer();
        
        if (!this.filteredBooks || this.filteredBooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3 class="empty-title">Không tìm thấy sách</h3>
                    <p class="empty-description">Không có sách nào trong thể loại này.</p>
                </div>
            `;
            return;
        }

        const booksHTML = this.filteredBooks.map(book => this.createBookCard(book)).join('');
        
        container.innerHTML = `
            <div class="book-more">
                ${booksHTML}
            </div>
        `;
        
        console.log('📚 Rendered', this.books.length, 'books');
    }

    getGenreFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const genre = urlParams.get('genre');
        
        // Debug: In ra URL hiện tại
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Current pathname:', window.location.pathname);
        console.log('🔍 Query params genre:', genre);
        
        // Nếu không có genre trong query param, kiểm tra URL path
        if (!genre) {
            const path = window.location.pathname.toLowerCase();
            console.log('🔍 Checking path:', path);
            
            if (path.includes('tieuthuyet')) {
                console.log('✅ Detected genre: Tiểu thuyết');
                return 'Tiểu thuyết';
            } else if (path.includes('vanhoc')) {
                console.log('✅ Detected genre: Văn học');
                return 'Văn học';
            } else if (path.includes('truyentranh')) {
                console.log('✅ Detected genre: Truyện tranh');
                return 'Truyện tranh';
            } else if (path.includes('sachkinhte')) {
                console.log('✅ Detected genre: Sách kinh tế');
                return 'Sách kinh tế';
            } else if (path.includes('tamly-kynangsong')) {
                console.log('✅ Detected genre: Tâm lý-Kỹ năng sống');
                return 'Tâm lý-Kỹ năng sống';
            }
        }
        
        return genre;
    }

    async loadBooksByGenre(genre) {
        try {
            console.log(`📚 Đang tải sách theo thể loại: ${genre}`);
            
            // Hiển thị loading
            this.showLoading();
            
            // Call API để lấy sách theo genre
            const response = await fetch(`/api/books/genre/${encodeURIComponent(genre)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.books = await response.json();
            this.filteredBooks = [...this.books]; // Initialize filtered books
            
            // Render sách
            this.applySorting(); // Use sorting method instead
            
            // Cập nhật tiêu đề trang
            this.updatePageTitle(genre);
            
        } catch (error) {
            console.error('❌ Lỗi khi tải sách:', error);
            this.showError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
        }
    }

    async loadAllBooks() {
        try {
            console.log(`📚 Đang tải tất cả sách...`);
            
            // Hiển thị loading
            this.showLoading();
            
            // Call API để lấy tất cả sách
            const response = await fetch('/api/books');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.books = data.latestBooks || [];
            this.filteredBooks = [...this.books]; // Initialize filtered books
            
            // Render sách
            this.applySorting(); // Use sorting method instead
            
            // Cập nhật tiêu đề trang
            this.updatePageTitle('Tất cả sách');
            
        } catch (error) {
            console.error('❌ Lỗi khi tải tất cả sách:', error);
            this.showError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
        }
    }

    showLoading() {
        const container = this.getOrCreateBooksContainer();
        container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
                <span class="ms-3">Đang tải sách...</span>
            </div>
        `;
    }

    showError(message) {
        const container = this.getOrCreateBooksContainer();
        container.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    }

    renderBooks() {
        const container = this.getOrCreateBooksContainer();
        
        if (!this.books || this.books.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3 class="empty-title">Không tìm thấy sách</h3>
                    <p class="empty-description">Không có sách nào trong thể loại này.</p>
                </div>
            `;
            return;
        }

        // Sử dụng chính xác class book-more như TrangChu.css
        const booksHTML = this.books.map(book => this.createBookCard(book)).join('');
        
        container.innerHTML = `
            <div class="book-more">
                ${booksHTML}
            </div>
        `;
        
        
        console.log('📚 Rendered', this.books.length, 'books after sorting');
    }
    
    createBookCard(book) {
        const discountPrice = book.discount > 0 ? 
            (book.price * (1 - book.discount / 100)).toFixed(0) : book.price;
            const imgPath = book.image.replace(/^(\.\.\/)+/, '/public/');

        return `
            <div class="book-item">
                <div class="book-image">
                <img src="${imgPath}" 
                     alt="${book.title}"
                     onerror="this.style.display='none'; this.onerror=null;">
                    <div class="overlay-info">
                        <a href="/sanpham/${book.bookId}" class="info-btn">Thông tin sách</a>
                    </div>
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-price">
                        ${book.discount > 0 ? 
                            `
                            <div>
                                <span class="original-price">${book.price.toLocaleString()}đ</span>
                                <span class="discount">-${book.discount}%</span>
                            </div>
                            <span class="price">${parseInt(discountPrice).toLocaleString()}đ</span>` :
                            `
                            <span class="price">${book.price.toLocaleString()}đ</span>
                            `
                        }
                    </div>
                    <div class="book-actions">
                        <button 
                            class="add-to-cart-btn" 
                            type="button"
                            data-action="add-to-cart" 
                            data-product-id="${book.bookId}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                        <a href="/sanpham/${book.bookId}" class="buy-btn" style="text-decoration:none;">MUA</a>
                    </div>
                </div>
            </div>
        `;
    }

    getOrCreateBooksContainer() {
        let container = document.getElementById('books-container');
        if (!container) {
            // Tạo container nếu chưa có (fallback)
            container = document.createElement('div');
            container.id = 'books-container';
            container.className = 'container my-4';
            
            // Thêm vào sau nav-menu
            const navMenu = document.getElementById('nav-menu');
            if (navMenu && navMenu.parentNode) {
                navMenu.parentNode.insertBefore(container, navMenu.nextSibling);
            } else {
                document.body.appendChild(container);
            }
        }
        return container;
    }

    updatePageTitle(genre) {
        // Cập nhật title của trang
        document.title = `T-Store - ${genre}`;
        
        // Cập nhật breadcrumb và header
        const genreBreadcrumb = document.getElementById('genre-breadcrumb');
        const genreTitle = document.getElementById('genre-title');
        const genreDescription = document.getElementById('genre-description');
        const booksCount = document.getElementById('books-count');
        
        if (genreBreadcrumb) {
            genreBreadcrumb.textContent = genre;
        }
        
        if (genreTitle) {
            const icon = this.getGenreIcon(genre);
            genreTitle.innerHTML = `<i class="${icon} me-3"></i>${genre}`;
        }
        
        if (genreDescription) {
            genreDescription.textContent = `Khám phá ${this.books.length} cuốn sách ${genre.toLowerCase()} chất lượng cao`;
        }
        
        if (booksCount) {
            booksCount.textContent = `${this.books.length} sản phẩm`;
        }
        
        // Hiển thị filter container
        const filterContainer = document.getElementById('filter-container');
        if (filterContainer && this.books.length > 0) {
            filterContainer.style.display = 'block';
        }
    }
    
    getGenreIcon(genre) {
        const iconMap = {
            'Tiểu thuyết': 'fas fa-scroll',
            'Văn học': 'fas fa-book-open',
            'Truyện tranh': 'fas fa-palette',
            'Sách kinh tế': 'fas fa-chart-line',
            'Tâm lý-Kỹ năng sống': 'fas fa-brain'
        };
        return iconMap[genre] || 'fas fa-book';
    }
}

// Khởi tạo trang khi file được load
const theLoaiPage = new TheLoaiPage();

// Export để có thể sử dụng từ bên ngoài
window.TheLoaiPage = TheLoaiPage;