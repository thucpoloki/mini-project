// JavaScript của trang kết quả tìm kiếm

class SearchResultsManager {
    constructor() {
        this.allBooks = [];
        this.filteredBooks = [];
        this.currentPage = 1;
        this.booksPerPage = 18; // 3 hàng x 6 sách
        this.searchQuery = '';
        this.currentCategory = '';
        this.currentSort = 'relevance';
    }

    async init() {
        // Lấy truy vấn tìm kiếm từ URL
        const urlParams = new URLSearchParams(window.location.search);
        this.searchQuery = urlParams.get('q') || '';
        
        // Cập nhật hiển thị truy vấn tìm kiếm
        document.getElementById('search-query').textContent = this.searchQuery;
        
        // Tải sách và thực hiện tìm kiếm
        await this.loadBooks();
        this.performSearch();
        this.setupEventListeners();
        
        // Cập nhật tiêu đề trang
        document.title = `Kết quả tìm kiếm "${this.searchQuery}" - T-Store`;
    }

    async loadBooks() {
        try {
            // Thử endpoint fullbook trước (chứa tất cả sách), sau đó thử endpoint books
            let response = await fetch('/api/fullbook');
            
            if (!response.ok) {
                console.log('📚 Endpoint fullbook không khả dụng, đang thử /api/books...');
                response = await fetch('/api/books');
            }
            
            if (!response.ok) {
                throw new Error('Không thể tải sách');
            }
            
            const data = await response.json();
            
            // Xử lý các cấu trúc dữ liệu khác nhau
            let allBooksArray = [];
            
            if (Array.isArray(data)) {
                // Mảng sách trực tiếp từ /api/fullbook
                allBooksArray = data;
            } else if (data.latestBooks && data.discountBooks) {
                // Kết hợp sách từ endpoint /api/books
                allBooksArray = [...(data.latestBooks || []), ...(data.discountBooks || [])];
            } else if (data.books && Array.isArray(data.books)) {
                // Sách trong cấu trúc lồng nhau
                allBooksArray = data.books;
            }
            
            // Chuẩn hóa và loại bỏ sách trùng lặp
            const allBooksMap = new Map();
            
            allBooksArray.forEach(book => {
                // Không được null hoặc undefined
                const bookId = book.bookId;
                if (bookId && !allBooksMap.has(bookId)) {
                    allBooksMap.set(bookId, {
                        bookId: bookId,
                        title: book.title || '',
                        author: book.author || '',
                        genre: book.genre || '',
                        price: book.price || 0,
                        image: book.image || '/public/img/avatar/uia.gif',
                        description: book.description || ''
                    });
                }
            });
            
            this.allBooks = Array.from(allBooksMap.values());
            console.log(`✅ Đã tải ${this.allBooks.length} sách cho kết quả tìm kiếm`);
            console.log('📋 Cấu trúc sách mẫu:', this.allBooks[0]);
            
        } catch (error) {
            console.error('Lỗi khi tải sách:', error);
            this.showError('Không thể tải dữ liệu sách. Vui lòng thử lại sau.');
        }
    }

    performSearch() {
        if (!this.searchQuery.trim()) {
            this.filteredBooks = this.allBooks;
        } else {
            // Chia truy vấn tìm kiếm thành các thuật ngữ riêng lẻ
            const searchTerms = this.searchQuery.toLowerCase().trim()
                .split(/\s+/) // Chia theo khoảng trắng
                .filter(term => term.length > 0); // Xóa các chuỗi rỗng
            
            this.filteredBooks = this.allBooks.filter(book => {
                const bookData = {
                    title: book.title.toLowerCase(),
                    author: book.author.toLowerCase(),
                    genre: book.genre.toLowerCase(),
                    description: (book.description || '').toLowerCase()
                };
                
                // Thuật toán đối sánh nâng cao
                let matchScore = 0;
                const allText = `${bookData.title} ${bookData.author} ${bookData.genre} ${bookData.description}`;
                
                for (const term of searchTerms) {
                    // Khớp chính xác trong tiêu đề (title) (ưu tiên cao nhất)
                    if (bookData.title.includes(term)) {
                        matchScore += 10;
                    }
                    // Từ bắt đầu bằng thuật ngữ tìm kiếm trong tiêu đề
                    if (bookData.title.split(/\s+/).some(word => word.startsWith(term))) {
                        matchScore += 8;
                    }
                    // Khớp chính xác trong tác giả
                    if (bookData.author.includes(term)) {
                        matchScore += 6;
                    }
                    // Từ bắt đầu bằng thuật ngữ tìm kiếm trong tác giả
                    if (bookData.author.split(/\s+/).some(word => word.startsWith(term))) {
                        matchScore += 5;
                    }
                    // Khớp chính xác trong thể loại
                    if (bookData.genre.includes(term)) {
                        matchScore += 4;
                    }
                    // Từ bắt đầu bằng thuật ngữ tìm kiếm trong thể loại
                    if (bookData.genre.split(/\s+/).some(word => word.startsWith(term))) {
                        matchScore += 3;
                    }
                    // Khớp mờ ở bất cứ đâu trong tất cả văn bản
                    if (allText.includes(term)) {
                        matchScore += 2;
                    }
                    // Khớp ranh giới từ
                    // Ví dụ: "the" khớp với "the Great" nhưng không khớp với "there"
                    if (allText.split(/\s+/).some(word => word.startsWith(term))) {
                        matchScore += 1;
                    }
                }
                
                // Trả về sách có bất kỳ điểm khớp dương nào
                // Điểm khớp dương (positive match score) cho thấy mức độ liên quan của sách với truy vấn tìm kiếm
                // Sách có điểm cao hơn sẽ được ưu tiên hiển thị trước
                // Ví dụ "the great gatsby" sẽ có điểm cao hơn "great expectations"
                book._searchScore = matchScore;
                return matchScore > 0;
            });
            
            // Sắp xếp theo điểm liên quan (cao nhất trước)
            this.filteredBooks.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0));
        }
        
        this.applyFilters();
        this.applySorting();
        this.updateResultsCount();
        this.renderResults();
        this.renderPagination();
    }

    applyFilters() {
        if (this.currentCategory) {
            this.filteredBooks = this.filteredBooks.filter(book => 
                book.genre === this.currentCategory
            );
        }
    }

    applySorting() {
        switch (this.currentSort) {
            case 'title':
                this.filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                this.filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'price-low':
                this.filteredBooks.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredBooks.sort((a, b) => b.price - a.price);
                break;
            case 'relevance':
            default:
                // Sắp xếp theo điểm liên quan tìm kiếm (nếu có) hoặc giữ nguyên thứ tự ban đầu
                if (this.searchQuery.trim()) {
                    this.filteredBooks.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0));
                }
                break;
        }
    }

    updateResultsCount() {
        const count = this.filteredBooks.length;
        document.getElementById('results-count').textContent = count;
    }

    renderResults() {
        const resultsGrid = document.getElementById('search-results-grid');
        const noResults = document.getElementById('no-results');
        
        if (this.filteredBooks.length === 0) {
            resultsGrid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        // Tính toán phân trang
        const startIndex = (this.currentPage - 1) * this.booksPerPage;
        const endIndex = startIndex + this.booksPerPage;
        const booksToShow = this.filteredBooks.slice(startIndex, endIndex);
        
        // Hiển thị sách
        resultsGrid.innerHTML = booksToShow.map(book => this.createBookCard(book)).join('');
        
        // Cuộn lên đầu kết quả
        document.querySelector('.search-results-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    createBookCard(book) {
        // Xử lí đường dẫn ảnh để bắt đầu từ /public
        const imgPath = book.image.replace(/^(\.\.\/)+/, '/public/');

        return `
            <div class="col-lg-2 col-md-3 col-sm-4 col-6 mb-4 mb-md-3">
                    <div class="book-item">
                        <div class="book-image">
                            <img src="${imgPath}" alt="${book.title}">
                            <div class="overlay-info">
                                <a href="/sanpham/${book.bookId}" class="info-btn">Thông tin sách</a>
                            </div>
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <div class="book-price">
                            <span class="price">${book.price.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div class="book-actions">
                            <button 
                                class="add-to-cart-btn" 
                                type="button"
                                data-action="add-to-cart" 
                                data-product-id="${book.bookId}"
                                title="Thêm vào giỏ hàng" 
                                aria-label="Thêm vào giỏ hàng"
                                onclick="SearchResultsManager.addToCart(${book.bookId}, '${book.title}', ${book.price}, '${book.image}')">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                            <a href="/sanpham/${book.bookId}" class="buy-btn" style="text-decoration:none;">MUA</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredBooks.length / this.booksPerPage);
        const pagination = document.getElementById('search-pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="searchResultsManager.goToPage(${this.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i> Trước
                    </a>
                </li>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="searchResultsManager.goToPage(1)">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="searchResultsManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="searchResultsManager.goToPage(${totalPages})">${totalPages}</a>
                </li>
            `;
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="searchResultsManager.goToPage(${this.currentPage + 1})">
                        Sau <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }
        
        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderResults();
        this.renderPagination();
    }

    setupEventListeners() {
        // Category filter
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
            this.applySorting();
            this.updateResultsCount();
            this.renderResults();
            this.renderPagination();
        });
        
        // Sort filter
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.currentPage = 1;
            this.applySorting();
            this.renderResults();
            this.renderPagination();
        });
    }

    static addToCart(bookId, title, price, image) {
        if (typeof ShoppingCart !== 'undefined') {
            // Sử dụng hàm addItem từ Shopping Cart V4.0
            ShoppingCart.addItem(bookId);
            
            // Show success notification
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Đã thêm "${title}" vào giỏ hàng
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }
    }

    showError(message) {
        const resultsGrid = document.getElementById('search-results-grid');
        resultsGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
            </div>
        `;
    }
}

// Global instance
let searchResultsManager;

// Initialize search results
function initializeSearchResults() {
    searchResultsManager = new SearchResultsManager();
    searchResultsManager.init();
}

// CSS for toast notification
const toastCSS = `
    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
    }
    
    .toast-notification.show {
        transform: translateX(0);
    }
    
    .toast-notification i {
        font-size: 1.2rem;
    }
`;

// Add toast CSS to document
const style = document.createElement('style');
style.textContent = toastCSS;
document.head.appendChild(style);