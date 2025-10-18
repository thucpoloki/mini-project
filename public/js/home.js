// Tải sách khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM sẵn sàng, đang tải sách...");
  
  loadBooks();
  loadFeaturedBooks();
  initFeaturedCarousel();
  
});

// Tải sách nổi bật cho carousel
async function loadFeaturedBooks() {
  try {
    console.log("🔥 Đang tải sách nổi bật cho carousel...");
    const response = await fetch("/api/noibat", { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const featuredBooks = await response.json();
    console.log("Sách nổi bật đã tải:", featuredBooks.length);
    
    // Render vào featured carousel
    if (featuredBooks.length > 0) {
      renderFeaturedBooks(featuredBooks);
      console.log("✅ Sách nổi bật đã được render vào carousel");
    }
    
  } catch (error) {
    console.error("❌ Lỗi khi tải sách nổi bật:", error);
    
    // Fallback: sử dụng dữ liệu mẫu cho carousel
    if (window.bookCarousel) {
      console.log("🔄 Đang sử dụng dữ liệu fallback cho carousel");
      // Carousel will use its default sample data
    }
  }
}

// Lấy dữ liệu sách từ API và hiển thị
// Sử dụng hàm fetch với tùy chọn cache: 'no-store' để tránh cache
function loadBooks() {
  fetch("/api/books", { cache: "no-store" })
    .then((res) => {
      console.log("Trạng thái phản hồi fetch:", res.status);
      if (!res.ok) throw new Error(`Lỗi fetch: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("📚 Phản hồi API /api/books:", data);
      console.log("📚 Kiểu dữ liệu:", typeof data, "Là mảng:", Array.isArray(data));
      
      if (data.latestBooks && data.discountBooks) {
        console.log("✅ Đã tìm thấy dữ liệu có cấu trúc với các danh mục");
        renderBooks(data.latestBooks, "moinhap-list");
        renderBooks(data.discountBooks, "khuyenmai-list", true);
        console.log("📚 Sách mới nhất:", data.latestBooks.length);
        console.log("🏷️ Sách giảm giá:", data.discountBooks.length);
      } else if (Array.isArray(data)) {
        console.log("📖 Đã tìm thấy dữ liệu dạng mảng, độ dài:", data.length);
        console.log("📖 Đang hiển thị tất cả sách vào moinhap-list và khuyenmai-list");
        renderBooks(data, "moinhap-list");
        renderBooks(data, "khuyenmai-list", true);
      } else {
        console.log("❌ Định dạng dữ liệu không mong đợi:", data);
      }
    })
    .catch((err) => console.error("Lỗi fetch:", err));
}

function renderBooks(books, containerId, forceDiscount = false) {
  console.log(`🎨 Đang hiển thị ${books.length} sách vào phần tử với ID: ${containerId}`);
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.log(`❌ Không tìm thấy phần tử với ID: ${containerId}`);
    return;
  }
  
  container.innerHTML = "";
  books.forEach((book) => {
    container.appendChild(createBookItem(book, forceDiscount, containerId));
  });
  
  console.log(`✅ Đã hiển thị ${books.length} sách trong ${containerId}`);
}

function createBookItem(book, forceDiscount = false, containerId = "") {
  const div = document.createElement("div");
  div.className = "book-item";

  let discountHtml = "";
  // Nếu có giảm giá và forceDiscount = true, hoặc sách có discount > 0
  const rawPrice = book.price;
  let priceNumber = 0;

  if (typeof rawPrice === "number") {
    // Làm tròn về số nguyên nếu là float
    priceNumber = Math.round(rawPrice);
  } else if (typeof rawPrice === "string") {
    // Loại bỏ tất cả ký tự không phải số (vd: "120.000 đ" -> "120000")
    const digits = rawPrice.replace(/[^\d]/g, "");
    priceNumber = digits ? parseInt(digits, 10) : 0;
    // Trường hợp chuỗi có thể biểu diễn dạng float (hiếm), vẫn làm tròn
    if (!Number.isNaN(priceNumber)) {
      priceNumber = Math.round(priceNumber);
    }
  }

  const discountPercent = Number(book.discount) || 0;
  const originalDisplay =
    typeof rawPrice === "string"
      ? rawPrice
      : priceNumber
      ? `${priceNumber.toLocaleString("vi-VN")} đ`
      : "0 đ";

  // ✨ Hiển thị giá giảm nếu forceDiscount = true HOẶC sách có discount > 0
  const shouldShowDiscount = forceDiscount || (discountPercent > 0);
  
  if (shouldShowDiscount && discountPercent > 0 && priceNumber > 0) {
    let final = priceNumber * (1 - discountPercent / 100);
    final = Math.round(final); // Làm tròn giá sau giảm
    
    // Tất cả phần tử giá trên cùng một cấp để căn chỉnh
    discountHtml = `
      <span class="original-price">${originalDisplay}</span>
      <span class="discount">-${discountPercent}%</span>
      <span class="price">${final.toLocaleString("vi-VN")} đ</span>
    `;
  } else {
    discountHtml = `<span class="price">${originalDisplay}</span>`;
  }

  if (containerId === "featured-books") {
    // Lồng bên ngoài các book-item 1 row col-12 col-md-4 col-lg-3
    div.classList.add("book-item");
  }
  
  // Xử lí đường dẫn ảnh replace thêm /public
  const imgPath = book.image.replace(/^(\.\.\/)+/, '/public/');
  // Biểu thức chính quy /^(\.\.\/)+/:
  // ^ - bắt đầu chuỗi
  // (\.\.\/)+ - một hoặc nhiều lần xuất hiện của ../
  // / - thay thế bằng dấu /
  // Ví dụ: ../../images/book.jpg -> /public/images/book.jpg

  div.innerHTML = `
    <div class="book-image">
      <img src="${imgPath}" alt="${book.title}">
      <div class="overlay-info">
        <a href="/sanpham/${book.bookId}" class="info-btn">Thông tin sách</a>
      </div>
    </div>
    <div class="book-info">
      <h3 class="book-title">${book.title}</h3>
      <div class="book-price">${discountHtml}</div>
      <div class="book-actions">
        <button 
          class="add-to-cart-btn" 
          type="button"
          data-action="add-to-cart" 
          data-product-id="${book.bookId}"
          title="Thêm vào giỏ hàng" 
          aria-label="Thêm vào giỏ hàng">
          <i class="fas fa-cart-plus"></i>
        </button>
        <a href="#" class="buy-btn" style="text-decoration:none;">MUA</a>
      </div>
    </div>
  `;
  return div;
}

// ===== CHỨC NĂNG CAROUSEL NỔI BẬT =====
let currentIndex = 0;
let bookWidth = 0;
let track = null;
let featuredBooks = [];
const NUM_VISIBLE = 6; // Hiển thị 6 sách trên 1 hàng
let autoPlayInterval = null;

function initFeaturedCarousel() {
  console.log("🎠 Khởi tạo carousel nổi bật...");
  
  track = document.getElementById('featured-books');
  const prevBtn = document.querySelector('.book-carousel .prev');
  const nextBtn = document.querySelector('.book-carousel .next');
  
  if (!track) {
    console.log("❌ Không tìm thấy track nổi bật");
    return;
  }
  
  // Event listeners cho nút điều khiển
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  // Hỗ trợ touch/swipe
  setupTouchEvents();
  
  // Tự động phát
  startAutoPlay();
  
  console.log("✅ Carousel nổi bật đã được khởi tạo");
}

function calculateBookWidth() {
  const wrapper = document.querySelector('.featured-wrapper');
  if (wrapper) {
    const wrapperWidth = wrapper.clientWidth;
    bookWidth = wrapperWidth / NUM_VISIBLE; // Mỗi bước trượt = 1 sách
    console.log(`📏 Chiều rộng sách đã tính: ${bookWidth.toFixed(2)}px (wrapper: ${wrapperWidth}px)`);
  }
}

function updateCarousel(withTransition = true) {
  if (!track || bookWidth === 0) return;
  
  if (!withTransition) track.style.transition = 'none';
  
  const translateX = -currentIndex * bookWidth;
  track.style.transform = `translateX(${translateX}px)`;
  
  if (!withTransition) {
    // Force reflow rồi bật lại transition
    void track.offsetWidth;
    track.style.transition = 'transform 0.5s ease-in-out';
  }
  
  // console.log(`🎠 Carousel updated: index ${currentIndex}, translateX: ${translateX}px, transition: ${withTransition}`);
}

function nextSlide() {
  if (featuredBooks.length <= NUM_VISIBLE) return; // Không cần cuộn
  
  currentIndex++;
  updateCarousel(true);

  // Nếu đã tới clone-after → lắng nghe transitionend để reset mượt
  if (currentIndex === featuredBooks.length + NUM_VISIBLE) {
    track.addEventListener('transitionend', handleNextReset, { once: true });
  }
}

function handleNextReset() {
  currentIndex = NUM_VISIBLE; // Reset về sách thật đầu tiên
  updateCarousel(false);      // Không transition
  console.log('🔄 Reset next hoàn thành: quay lại chỉ số', currentIndex);
}

function prevSlide() {
  if (featuredBooks.length <= NUM_VISIBLE) return; // Không cần cuộn
  
  currentIndex--;
  updateCarousel(true);

  // Nếu đã tới clone-before → lắng nghe transitionend để reset mượt
  if (currentIndex === 0) {
    track.addEventListener('transitionend', handlePrevReset, { once: true });
  }
}

function handlePrevReset() {
  currentIndex = featuredBooks.length; // Reset về sách thật cuối cùng
  updateCarousel(false);               // Không transition
  console.log('🔄 Reset prev hoàn thành: quay lại chỉ số', currentIndex);
}



function setupTouchEvents() {
  if (!track) return;
  
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAutoPlay(); // Tạm dừng auto-play khi user tương tác
  });
  
  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  });
  
  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) { // Khoảng cách swipe tối thiểu
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    startAutoPlay(); // Tiếp tục auto-play
  });
}

function startAutoPlay() {
  stopAutoPlay(); // Xóa interval hiện tại
  autoPlayInterval = setInterval(() => {
    nextSlide();
  }, 2000); // 2 giây
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function renderFeaturedBooks(books) {
  if (!track || books.length === 0) return;

  featuredBooks = books;
  track.innerHTML = '';

  // Clone cuối gắn vào đầu (để prev slide mượt)
  const clonesBefore = books.slice(-NUM_VISIBLE);
  clonesBefore.forEach(b => {
    const bookElement = createBookItem(b, false, 'featured-books'); // auto-detect discount
    bookElement.classList.add('clone-before');
    track.appendChild(bookElement);
  });

  // Render sách chính
  books.forEach(b => {
    const bookElement = createBookItem(b, false, 'featured-books'); // auto-detect discount
    track.appendChild(bookElement);
  });

  // Clone đầu gắn vào cuối (để next slide mượt)
  const clonesAfter = books.slice(0, NUM_VISIBLE);
  clonesAfter.forEach(b => {
    const bookElement = createBookItem(b, false, 'featured-books'); // auto-detect discount
    bookElement.classList.add('clone-after');
    track.appendChild(bookElement);
  });

  // Tính width và setup
  setTimeout(() => {
    calculateBookWidth();
    // Bắt đầu từ sách thật đầu tiên (bỏ qua clones-before)
    currentIndex = NUM_VISIBLE;
    updateCarousel(false); // Không transition lần đầu
    track.style.transition = 'transform 0.5s ease-in-out';
    console.log(`🎠 Carousel vô hạn: ${clonesBefore.length} + ${books.length} + ${clonesAfter.length} items, chỉ số bắt đầu: ${currentIndex}`);
  }, 100);
}

// Pause auto-play khi hover
document.addEventListener('DOMContentLoaded', function() {
  const carouselSection = document.querySelector('.book-carousel-section');
  if (carouselSection) {
    carouselSection.addEventListener('mouseenter', stopAutoPlay);
    carouselSection.addEventListener('mouseleave', startAutoPlay);
  }
});

// Xử lý thay đổi kích thước cửa sổ
window.addEventListener('resize', () => {
  setTimeout(() => {
    calculateBookWidth();
    updateCarousel();
  }, 100);
});

// Inject thẻ script src hiddenDino.js
const dinoScript = document.createElement('script');
dinoScript.src = '../../public/js/hiddenDino.js';
dinoScript.defer = true;
document.head.appendChild(dinoScript);
