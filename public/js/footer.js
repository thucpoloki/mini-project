const footerHTML = `<div class="container-fluid footer-bg-dark">
        <div class="row g-4">
            <div class="col-12 col-lg-4 mb-4 mb-lg-0">
                <div class="company-info">
                    <h3>T-Store</h3>
                    <p class="mb-0"> T-Store nhận đặt hàng trực tuyến và giao hàng tận nơi. KHÔNG hỗ trợ đặt mua và nhận
                        hàng trực tiếp tại văn phòng cũng như tất cả Hệ Thống T-Store trên toàn quốc.</p>
                </div>

                <div class="follow-us-section mt-4">
                    <h3>Theo dõi chúng tôi</h3>
                    <div class="d-flex align-items-center justify-content-center justify-content-lg-start gap-3 mb-4">
                        <a href="https://www.facebook.com/" class="social-link facebook-link" target="_blank">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://www.youtube.com/" class="social-link youtube-link" target="_blank">
                            <i class="fab fa-youtube"></i>
                        </a>
                        <a href="https://www.tiktok.com/" class="social-link tiktok-link" target="_blank">
                            <i class="fab fa-tiktok"></i>
                        </a>
                        <a href="https://discord.com/" class="social-link discord-link" target="_blank">
                            <i class="fab fa-discord"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-8">
                <div class="row g-4">
                    <div class="col-12 col-md-4 footer-section">
                        <h4>Dịch vụ</h4>
                        <nav class="mb-3">
                            <ul class="footer-nav list-unstyled">
                                <li><a href="#" class="text-white text-decoration-none">Điều khoản sử dụng</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Chính sách bảo mật thông tin cá nhân</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Chính sách bảo mật thanh toán</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Giới thiệu T-Store</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Hệ thống trung tâm - nhà sách</a></li>
                            </ul>
                        </nav>
                    </div>
                    <div class="col-12 col-md-4 footer-section">
                        <h4>Hỗ trợ</h4>
                        <nav class="mb-3">
                            <ul class="footer-nav list-unstyled">
                                <li><a href="#" class="text-white text-decoration-none">Chính sách đổi - trả - hoàn tiền</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Chính sách bảo hành</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Chính sách vận chuyển</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Chính sách khách sỉ</a></li>
                            </ul>
                        </nav>
                    </div>
                    <div class="col-12 col-md-4 footer-section">
                        <h4>Tài khoản cá nhân</h4>
                        <nav class="mb-3">
                            <ul class="footer-nav list-unstyled">
                                <li><a href="#" class="text-white text-decoration-none">Đăng nhập/Tạo mới tài khoản</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Thay đổi địa chỉ khách hàng</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Chi tiết tài khoản</a></li>
                                <li><a href="#" class="text-white text-decoration-none">Lịch sử mua hàng</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-12 footer-section">
                        <h4>Hỗ trợ thanh toán</h4>
                        <div class="payment-methods d-flex flex-wrap justify-content-center justify-content-lg-start gap-2">
                            <img src="../../public/img/e-wallet_logo/vnpay.png" alt="VNPay" class="img-fluid">
                            <img src="../../public/img/bank_logo/bidv.png" alt="BIDV" class="img-fluid">
                            <img src="../../public/img/bank_logo/mbbank.png" alt="MB Bank" class="img-fluid">
                            <img src="../../public/img/e-wallet_logo/momo.png" alt="Momo" class="img-fluid">
                            <img src="../../public/img/bank_logo/vietcombank.png" alt="Vietcombank" class="img-fluid">
                            <img src="../../public/img/e-wallet_logo/zalopay.png" alt="ZaloPay" class="img-fluid">
                            <img src="../../public/img/bank_logo/techcombank.png" alt="Techcombank" class="img-fluid">
                            <img src="../../public/img/bank_logo/agribank.png" alt="Agribank" class="img-fluid">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© Copyright by T-Store, trang web bán sách uy tín chất lượng</p>
        </div>
    </div>`;

// Function to render footer
function renderFooter() {
    console.log("Rendering footer...");

    // Load CSS
    const cssFooter = document.createElement("link");
    cssFooter.rel = "stylesheet";
    cssFooter.href = "../../public/css/footer.css";
    document.head.appendChild(cssFooter);

    // Render footer into <footer> tag
    const footerElement = document.querySelector("footer");
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
        console.log("Footer rendered successfully");
    } else {
        console.warn("Footer element not found, creating one at the end of body");
        // Create footer element if it doesn't exist
        const footerEl = document.createElement("footer");
        footerEl.innerHTML = footerHTML;
        document.body.appendChild(footerEl);
    }
}

// Auto-render when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM Content Loaded - Auto rendering footer");
    renderFooter();
});

// Make renderFooter available globally
window.renderFooter = renderFooter;
