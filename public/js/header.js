
function injectHeaderCSS(href) {
  // Kiểm tra nếu link chưa tồn tại thì mới thêm
  if (!document.querySelector(`link[href="${href}"]`)) { 
    // Đặt nhiều link css vào
    const cssFiles = [
      '../../lib/bootstrap-5.3.8-dist/css/bootstrap.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
      '../../public/css/cart.css',
      '../../public/css/header.css',
      '../../public/css/Trangchu.css',
    ];
    cssFiles.forEach(file => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = file;
      document.head.appendChild(link);
    });
  }
}

// Gọi hàm này trước khi renderNavbar
injectHeaderCSS('../../public/css/header.css');

// Chờ DOM tải xong rồi mới chạy renderNavbar

// Tự động chạy khi DOM ready (backup)
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded đã được kích hoạt, tự động chạy renderNavbar...");
  if (renderNavbar && typeof renderNavbar === "function") {
    renderNavbar();
  }
});

function renderNavbar() {
  // Kiểm tra nếu navbar đã tồn tại để tránh trùng lặp
  if (document.querySelector("#navbarContainer")) {
    console.log("Navbar đã tồn tại, bỏ qua việc render.");
    return;
  }

  console.log("🔧 Đang render navbar...");
  const navbarHTML = `
    <header id="navbarContainer" class="sticky-top">
      <nav class="navbar navbar-expand-lg navbar-dark bg-black">
        <div class="container-fluid">
          <a href="/trangchu" class="navbar-brand pb-2">
            <div class="d-flex align-items-center gap-2 ps-2">
              <img src="../../public/t-logo.png" alt="T-Store Logo" id="logo">
              <img src="../../public/t-store-tx.png" alt="T-Store Text Logo" id="logo-text">
            </div>
          </a>
          <!-- Search bar -->
          <div class="d-flex mx-auto position-relative" role="search" id="navbarSearch">
            <input class="form-control shadow-sm bg-light custom-input-radius" type="search" placeholder="Tìm kiếm sách, tác giả, thể loại..." aria-label="Search" id="navbarSearchInput">
            <button class="btn btn-outline-light px-4 custom-button-radius" type="submit" id="navbarSearchButton">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
            <!-- ✨ Dropdown kết quả tìm kiếm -->
            <div id="searchResults" class="search-results" style="display:none;"></div>
          </div>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-end" id="navbarResponsive">
            <ul class="navbar-nav mb-2 mb-lg-0">
                            <li class="nav-item dropdown user-menu">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img id="userAvatar" src="/public/img/Avarvtar/avaatr2.jpg" alt="Avatar" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 5px;">
                  <span id="usernameDisplay" style="display: none; color: white;"></span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><a href="/login" class="dropdown-item login-link" id="loginOption">Đăng nhập</a></li>
                  <li><a href="/login?form=register" class="dropdown-item register-link" id="registerOption">Đăng ký</a></li>
                  <li><hr class="dropdown-divider" id="accountDivider" style="display: none;"></li>
                  <li><a href="/account" class="dropdown-item" id="accountInfo" style="display: none;"><i class="fas fa-user-circle me-2"></i>Thông tin tài khoản</a></li>
                  <li><a href="#" class="dropdown-item text-danger" id="logoutOption" style="display: none;"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                </ul>
              </li>
              <li class="nav-item">
                <div class="cart-icon nav-link" style="cursor: pointer; color: aliceblue; position: relative;">
                  <i class="fa-solid fa-shopping-cart"></i>
                  <span class="cart-count" style="display: none;">0</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Enhanced Navigation Menu with Icons -->
      <div class="category-nav bg-dark">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <ul class="category-menu d-flex justify-content-start align-items-center py-2 mb-0">
                <li class="category-item">
                  <a href="/Vanhoc" class="category-link">
                    <i class="fas fa-book-open me-2"></i>
                    <span>Văn học</span>
                  </a>
                </li>
                <li class="category-item">
                  <a href="/Tamly-Kynangsong" class="category-link">
                    <i class="fas fa-brain me-2"></i>
                    <span>Tâm lý-Kỹ năng sống</span>
                  </a>
                </li>
                <li class="category-item">
                  <a href="/Tieuthuyet" class="category-link">
                    <i class="fas fa-scroll me-2"></i>
                    <span>Tiểu thuyết</span>
                  </a>
                </li>
                <li class="category-item">
                  <a href="/Truyentranh" class="category-link">
                    <i class="fas fa-palette me-2"></i>
                    <span>Truyện tranh</span>
                  </a>
                </li>
                <li class="category-item">
                  <a href="/Sachkinhte" class="category-link">
                    <i class="fas fa-chart-line me-2"></i>
                    <span>Sách kinh tế</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  const navMenuElement = document.getElementById("nav-menu");
  if (navMenuElement) {
    navMenuElement.innerHTML = navbarHTML;
    console.log("✅ Navbar rendered successfully.");

    // Khởi tạo phiên người dùng sau khi navbar được hiển thị
    initializeUserSession();
    
    // ✨ Khởi tạo chức năng tìm kiếm
    initializeSearch();
    
    // ✨ Cập nhật biểu tượng giỏ hàng sau khi header được render
    if (typeof ShoppingCart !== 'undefined' && ShoppingCart.updateCartIcon) {
      setTimeout(() => {
        ShoppingCart.updateCartIcon();
        console.log("🛒 Biểu tượng giỏ hàng đã được cập nhật sau khi render header");
      }, 50);
    }
    
    // Thêm sự kiện đăng xuất
    const logoutBtn = document.getElementById('logoutOption');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    console.error("❌ Không tìm thấy phần tử có id 'nav-menu'");
  }
}

// ========== QUẢN LÝ PHIÊN NGƯỜI DÙNG ==========

function initializeUserSession() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const usernameDisplay = document.getElementById('usernameDisplay');
  const userAvatar = document.getElementById('userAvatar');
  const loginOption = document.getElementById('loginOption');
  const registerOption = document.getElementById('registerOption');
  const accountInfo = document.getElementById('accountInfo');
  const logoutOption = document.getElementById('logoutOption');
  const accountDivider = document.getElementById('accountDivider');

  if (loggedInUser) {
    // Người dùng đã đăng nhập
    console.log('✅ Người dùng đã đăng nhập:', loggedInUser.username);
    
    if (usernameDisplay) {
      usernameDisplay.textContent = loggedInUser.username;
      usernameDisplay.style.display = 'inline';
    }
    
    if (userAvatar && loggedInUser.avatar) {
      userAvatar.src = loggedInUser.avatar;
    }
    
    // Hide login/register, show account/logout
    if (loginOption) loginOption.style.display = 'none';
    if (registerOption) registerOption.style.display = 'none';
    if (accountDivider) accountDivider.style.display = 'block';
    if (accountInfo) accountInfo.style.display = 'block';
    if (logoutOption) logoutOption.style.display = 'block';
  } else {
    // Người dùng chưa đăng nhập
    console.log('ℹ️ Không có người dùng nào đăng nhập');
    
    if (usernameDisplay) usernameDisplay.style.display = 'none';
    
    // Show login/register, hide account/logout
    if (loginOption) loginOption.style.display = 'block';
    if (registerOption) registerOption.style.display = 'block';
    if (accountDivider) accountDivider.style.display = 'none';
    if (accountInfo) accountInfo.style.display = 'none';
    if (logoutOption) logoutOption.style.display = 'none';
  }
}

function logout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    // Lấy thông tin người dùng đã đăng nhập trước khi xóa
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    // Xóa giỏ hàng riêng của người dùng
    if (loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);
        const cartKey = `shopping_cart_${user.username || user.email}`;
        localStorage.removeItem(cartKey);
        console.log('🛒 Đã xóa giỏ hàng cho người dùng:', user.username || user.email);
      } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
      }
    }
    
    // Xóa phiên người dùng
    localStorage.removeItem('loggedInUser');
    console.log('👋 Người dùng đã đăng xuất');
    
    window.location.href = '/trangchu';
  }
}

// Cập nhật phiên khi localStorage thay đổi (đồng bộ đa tab)
window.addEventListener('storage', (e) => {
  if (e.key === 'loggedInUser') {
    initializeUserSession();
  }
});

// ============================================
// CHỨC NĂNG TÌM KIẾM
// ============================================

function initializeSearch() {
  console.log("🔍 Đang khởi tạo chức năng tìm kiếm...");
  
  const searchInput = document.getElementById("navbarSearchInput");
  const searchButton = document.getElementById("navbarSearchButton");
  const searchResults = document.getElementById("searchResults");

  if (!searchInput || !searchButton || !searchResults) {
    console.error("❌ Không tìm thấy các phần tử tìm kiếm");
    return;
  }

  let books = [];
  let isLoading = false;

  // Fetch all books for search
  async function fetchBooks() {
    if (isLoading) return;
    isLoading = true;
    
    try {
      console.log("📚 Đang tải sách cho tìm kiếm...");
      
      // Thử endpoint fullbook trước (chứa tất cả sách), sau đó fallback về books endpoint
      let response = await fetch("/api/fullbook", { cache: "no-store" });
      
      if (!response.ok) {
        console.log("📚 Endpoint fullbook không khả dụng, thử /api/books...");
        response = await fetch("/api/books", { cache: "no-store" });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different data structures
      if (Array.isArray(data)) {
        // Direct array of books
        books = data;
      } else if (data.latestBooks && data.discountBooks) {
        // Combined books from different categories
        books = [...data.latestBooks, ...data.discountBooks];
      } else if (data.books && Array.isArray(data.books)) {
        // Books in a nested structure
        books = data.books;
      } else {
        console.warn("⚠️ Cấu trúc dữ liệu không mong muốn:", data);
        books = [];
      }
      
      // Remove duplicates based on bookId or id
      books = books.filter((book, index, self) => {
        const id = book.bookId;
        return index === self.findIndex(b => (b.bookId) === id);
      });
      
      console.log(`✅ Đã tải ${books.length} sách cho tìm kiếm từ API`);
      console.log("📋 Cấu trúc sách mẫu:", books[0]);
      
    } catch (error) {
      console.error("❌ Lỗi khi tải sách:", error);
      books = []; // Đảm bảo books luôn là mảng
    } finally {
      isLoading = false;
    }
  }

  // Chức năng tìm kiếm nâng cao với thuật toán cải tiến
  function performSearch(query) {
    if (!query.trim() || books.length === 0) {
      searchResults.style.display = 'none';
      return;
    }

    const searchTerms = query.toLowerCase().trim()
      .split(/\s+/) // Tách theo khoảng trắng
      .filter(term => term.length > 0); // Loại bỏ chuỗi rỗng
    
    const filteredBooks = books.filter(book => {
      const bookData = {
        title: (book.title || '').toLowerCase(),
        author: (book.author || '').toLowerCase(),
        genre: (book.genre || '').toLowerCase()
      };
      
      // Hệ thống khớp dựa trên điểm số
      let matchScore = 0;
      const allText = `${bookData.title} ${bookData.author} ${bookData.genre}`;
      
      for (const term of searchTerms) {
        // Khớp chính xác trong tiêu đề (ưu tiên cao nhất)
        if (bookData.title.includes(term)) {
          matchScore += 10;
        }
        // Khớp từ một phần trong tiêu đề
        if (bookData.title.split(/\s+/).some(word => word.startsWith(term))) {
          matchScore += 8;
        }
        // Khớp chính xác trong tác giả
        if (bookData.author.includes(term)) {
          matchScore += 6;
        }
        // Khớp chính xác trong thể loại
        if (bookData.genre.includes(term)) {
          matchScore += 4;
        }
        // Khớp mờ ở bất kỳ đâu
        if (allText.includes(term)) {
          matchScore += 2;
        }
        // Từ bắt đầu bằng từ khóa tìm kiếm
        if (allText.split(/\s+/).some(word => word.startsWith(term))) {
          matchScore += 3;
        }
      }
      
      // Trả về sách có bất kỳ khớp nào
      return matchScore > 0;
    })
    .sort((a, b) => {
      // Sắp xếp theo điểm liên quan (tính lại để sắp xếp)
      const scoreA = calculateRelevanceScore(a, searchTerms);
      const scoreB = calculateRelevanceScore(b, searchTerms);
      return scoreB - scoreA;
    })
    .slice(0, 8); // Giới hạn 8 kết quả

    displaySearchResults(filteredBooks);
  }
  
  // Tính điểm liên quan để sắp xếp
  function calculateRelevanceScore(book, searchTerms) {
    const bookData = {
      title: (book.title || '').toLowerCase(),
      author: (book.author || '').toLowerCase(),
      genre: (book.genre || '').toLowerCase()
    };
    
    let score = 0;
    const allText = `${bookData.title} ${bookData.author} ${bookData.genre}`;
    
    for (const term of searchTerms) {
      // Điểm cao hơn cho khớp tiêu đề
      if (bookData.title.includes(term)) score += 10;
      if (bookData.title.split(/\s+/).some(word => word.startsWith(term))) score += 8;
      if (bookData.author.includes(term)) score += 6;
      if (bookData.genre.includes(term)) score += 4;
      if (allText.includes(term)) score += 2;
      if (allText.split(/\s+/).some(word => word.startsWith(term))) score += 3;
    }
    
    return score;
  }

  // Hiển thị kết quả tìm kiếm
  function displaySearchResults(filteredBooks) {
    if (filteredBooks.length === 0) {
      searchResults.innerHTML = `
        <div class="no-results" style="padding: 20px; text-align: center; color: #666;">
          <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px;"></i>
          <p>Không tìm thấy kết quả phù hợp</p>
        </div>
      `;
      searchResults.style.display = 'block';
      return;
    }

    const resultsHTML = filteredBooks.map(book => {
      const imagePath = book.image?.replace("../img/", "../../public/img/") || "/public/img/placeholder-book.jpg";
      const bookTitle = book.title || "Không có tên";
      const bookAuthor = book.author || "Không rõ tác giả";
      const bookPrice = book.price || 0;
      
      return `
        <div class="search-book-item" data-book-id="${book.bookId}" style="cursor: pointer;">
          <img src="${imagePath}" alt="${bookTitle}" style="width: 60px; height: 80px; object-fit: cover;">
          <div>
            <p style="margin: 0 0 4px 0; font-weight: bold; color: black; font-size: 14px;">${bookTitle}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Tác giả: ${bookAuthor}</p>
            <p style="margin: 0; font-size: 13px; color: #e74c3c; font-weight: bold;">
              ${typeof bookPrice === 'number' ? bookPrice.toLocaleString('vi-VN') + ' đ' : bookPrice}
            </p>
          </div>
        </div>
      `;
    }).join('');

    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = 'block';

    // Thêm sự kiện click cho kết quả tìm kiếm
    searchResults.querySelectorAll('.search-book-item').forEach(item => {
      item.addEventListener('click', () => {
        const bookId = item.dataset.bookId;
        window.location.href = `/sanpham/${bookId}`;
      });
    });
  }

  // Các trình xử lý sự kiện
  searchInput.addEventListener('input', function() {
    const query = this.value;
    if (query.length >= 2) {
      performSearch(query);
    } else {
      searchResults.style.display = 'none';
    }
  });

  // Click bên ngoài để đóng
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

  // Click nút tìm kiếm
  searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      // Chuyển hướng đến trang kết quả tìm kiếm hoặc thực hiện tìm kiếm
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  });

  // Tìm kiếm bằng phím Enter
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = this.value.trim();
      if (query) {
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
    }
  });

  // Khởi tạo bằng cách tải sách
  fetchBooks();
  
  console.log("✅ Chức năng tìm kiếm đã được khởi tạo");
}
