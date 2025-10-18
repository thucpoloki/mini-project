// Xử lý trang đăng nhập
class LoginPage {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 5;
        this.slideInterval = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializePage());
        } else {
            this.initializePage();
        }
    }

    initializePage() {
        console.log('🔐 Khởi tạo trang đăng nhập...');
        
        // Kiểm tra xem người dùng đã đăng nhập chưa
        this.checkLoginStatus();
        
        // Khởi tạo slideshow
        this.initSlideshow();
        
        // Khởi tạo các handler cho form
        this.initFormHandlers();
        
        // Khởi tạo điều hướng (navigation)
        this.initNavigation();
        
        // Kiểm tra tham số URL để xác định loại form hiển thị (login/register)
        this.checkFormType();
    }

    checkLoginStatus() {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            window.location.href = "/trangchu";
            return;
        }
    }

    checkFormType() {
        const urlParams = new URLSearchParams(window.location.search);
        const formType = urlParams.get('form');
        if (formType === 'register') {
            this.showRegisterForm();
        } else {
            this.showLoginForm();
        }
    }

    // ========== PHẦN SLIDESHOW ==========
    initSlideshow() {
        this.preloadImages();
        this.startSlideshow();
        this.initSlideshowNavigation();
    }

    preloadImages() {
        const images = [
            '/public/img/Logon/background.webp',
            '/public/img/Logon/sky.jpg',
            '/public/img/Logon/dan huou.jpg',
            '/public/img/Logon/City.jpg',
            '/public/img/Logon/streets.jpg'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    startSlideshow() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 4000);
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlideshow();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlideshow();
        this.resetSlideshow();
    }

    updateSlideshow() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.nav-dot');
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    resetSlideshow() {
        clearInterval(this.slideInterval);
        this.startSlideshow();
    }

    initSlideshowNavigation() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }

    // ========== PHẦN FORM ==========
    initFormHandlers() {
        this.initLoginForm();
        this.initRegisterForm();
        this.initToggleHandlers();
        this.initPasswordVisibility();
    }

    initLoginForm() {
        const loginBtn = document.getElementById('login-btn');
        const loginForm = document.getElementById('login-form');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        // Xử lý phím Enter
        if (loginForm) {
            loginForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleLogin();
                }
            });
        }
    }

    initRegisterForm() {
        const registerBtn = document.getElementById('register-btn');
        const registerForm = document.getElementById('register-form');
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.handleRegister());
        }
        
        // Xử lý phím Enter
        if (registerForm) {
            registerForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleRegister();
                }
            });
        }
    }

    initToggleHandlers() {
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');
        
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }
    }

    initPasswordVisibility() {
        const toggleButtons = [
            { btn: 'togglePassword', input: 'password' },
            { btn: 'toggleRegPassword', input: 'reg-password' },
            { btn: 'toggleConfirmPassword', input: 'reg-confirm-password' }
        ];

        toggleButtons.forEach(({ btn, input }) => {
            const button = document.getElementById(btn);
            const inputField = document.getElementById(input);
            
            if (button && inputField) {
                button.addEventListener('click', () => {
                    const icon = button.querySelector('i');
                    if (inputField.type === 'password') {
                        inputField.type = 'text';
                        icon.classList.replace('fa-eye', 'fa-eye-slash');
                    } else {
                        inputField.type = 'password';
                        icon.classList.replace('fa-eye-slash', 'fa-eye');
                    }
                });
            }
        });
    }

    // ========== HIỂN THỊ FORM ==========
    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm && registerForm) {
            loginForm.classList.remove('d-none');
            registerForm.classList.add('d-none');
            this.clearForms();
        }
    }

    showRegisterForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm && registerForm) {
            loginForm.classList.add('d-none');
            registerForm.classList.remove('d-none');
            this.clearForms();
        }
    }

    clearForms() {
        // Xóa dữ liệu và trạng thái lỗi trên các trường form
        const loginInputs = ['username', 'password'];
        loginInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
                input.classList.remove('is-invalid');
            }
        });

        // Xóa dữ liệu trên form đăng ký
        const registerInputs = ['reg-username', 'reg-email', 'reg-password', 'reg-confirm-password'];
        registerInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
                input.classList.remove('is-invalid');
            }
        });

        // Xóa thông báo lỗi
        const errorIds = ['login-err-username', 'login-err-password', 'errtendangnhap', 'erremail', 'errmatkhau', 'errmatkhauconfirm'];
        errorIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '';
        });

        // Ẩn thông báo
        this.hideNotification('login-notification');
        this.hideNotification('register-notification');
    }

    // ========== VALIDATION (XÁC THỰC) ==========
    validateUsername(username) {
        const regex = /^[a-z][a-z0-9]{1,19}$/;
        return regex.test(username);
    }

    validateEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
        return regex.test(email);
    }

    validatePassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/;
        return regex.test(password);
    }

    // ========== XỬ LÝ ĐĂNG NHẬP ==========
    // Hàm xử lý đăng nhập
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Xóa lỗi trước đó
        this.clearFieldError('username');
        this.clearFieldError('password');
        
        let isValid = true;

        // Xác thực dữ liệu
        if (!username) {
            this.showFieldError('username', 'login-err-username', 'Vui lòng nhập tên đăng nhập!');
            isValid = false;
        }
        
        if (!password) {
            this.showFieldError('password', 'login-err-password', 'Vui lòng nhập mật khẩu!');
            isValid = false;
        }

        if (!isValid) return;

        // Vô hiệu hóa nút trong khi đang xử lý đăng nhập
        const loginBtn = document.getElementById('login-btn');
        this.setButtonLoading(loginBtn, true);

        try {
            // Gọi API để đăng nhập (POST /api/auth/login)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success && data.user) {
                // Lưu token và thông tin người dùng vào localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                
                this.showNotification('login-notification', 'Đăng nhập thành công!', 'success');
                
                setTimeout(() => {
                    window.location.href = "/trangchu";
                }, 1000);
            } else {
                this.showNotification('login-notification', data.message || 'Đăng nhập thất bại!', 'danger');
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            this.showNotification('login-notification', 'Có lỗi xảy ra! Vui lòng thử lại.', 'danger');
        } finally {
            this.setButtonLoading(loginBtn, false);
        }
    }

    // ========== XỬ LÝ ĐĂNG KÝ ==========
    async handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const confirmPassword = document.getElementById('reg-confirm-password').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Xóa lỗi trước đó
        this.clearFieldError('reg-username');
        this.clearFieldError('reg-email');
        this.clearFieldError('reg-password');
        this.clearFieldError('reg-confirm-password');

        let isValid = true;

        // Xác thực dữ liệu
        if (!username) {
            this.showFieldError('reg-username', 'errtendangnhap', 'Vui lòng nhập tên đăng nhập!');
            isValid = false;
        } else if (!this.validateUsername(username)) {
            this.showFieldError('reg-username', 'errtendangnhap', 'username cần được viết thường, không dấu, không khoảng trắng, bắt đầu bằng chữ cái!');
            isValid = false;
        }

        if (!email) {
            this.showFieldError('reg-email', 'erremail', 'Vui lòng nhập email!');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showFieldError('reg-email', 'erremail', 'Email phải có định dạng @gmail.com!');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('reg-password', 'errmatkhau', 'Vui lòng nhập mật khẩu!');
            isValid = false;
        } else if (!this.validatePassword(password)) {
            this.showFieldError('reg-password', 'errmatkhau', 'Cần 6-20 ký tự, viết hoa chữ cái đầu, có số và ký tự đặc biệt!');
            isValid = false;
        }

        if (!confirmPassword) {
            this.showFieldError('reg-confirm-password', 'errmatkhauconfirm', 'Vui lòng xác nhận mật khẩu!');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showFieldError('reg-confirm-password', 'errmatkhauconfirm', 'Mật khẩu không khớp!');
            isValid = false;
        }

        if (!agreeTerms) {
            this.showNotification('register-notification', 'Vui lòng đồng ý với điều khoản sử dụng!', 'danger');
            isValid = false;
        }

        if (!isValid) return;

        // Vô hiệu hóa nút trong khi xử lý đăng ký
        const registerBtn = document.getElementById('register-btn');
        this.setButtonLoading(registerBtn, true);

        try {
            // Gọi API để đăng ký (POST /api/auth/register)
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success && data.user) {
                this.showNotification('register-notification', 'Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                
                setTimeout(() => {
                    this.showLoginForm();
                }, 1500);
            } else {
                this.showNotification('register-notification', data.message || 'Đăng ký thất bại!', 'danger');
            }

        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            this.showNotification('register-notification', 'Có lỗi xảy ra! Vui lòng thử lại.', 'danger');
        } finally {
            this.setButtonLoading(registerBtn, false);
        }
    }

    // ========== PHƯƠNG THỨC HỖ TRỢ ==========
    showNotification(elementId, message, type) {
        const notification = document.getElementById(elementId);
        if (!notification) return;

        notification.textContent = message;
        notification.className = `alert alert-${type}`;
        
        setTimeout(() => {
            this.hideNotification(elementId);
        }, 5000);
    }

    hideNotification(elementId) {
        const notification = document.getElementById(elementId);
        if (notification) {
            notification.className = 'alert d-none';
            notification.textContent = '';
        }
    }

    showFieldError(fieldId, errorId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(errorId);
        
        if (field) field.classList.add('is-invalid');
        if (errorElement) errorElement.textContent = message;
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) field.classList.remove('is-invalid');
    }

    setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            const originalText = button.innerHTML;
            button.dataset.originalText = originalText;
            button.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xử lý...
            `;
        } else {
            button.disabled = false;
            const originalText = button.dataset.originalText;
            if (originalText) {
                button.innerHTML = originalText;
            }
        }
    }

    initNavigation() {
        // Khởi tạo các phần điều hướng bổ sung nếu cần
        console.log('✅ Đã khởi tạo điều hướng');
    }

    // Phương thức dọn dẹp khi rời trang
    destroy() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }
}

// Khởi tạo trang đăng nhập khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    window.loginPage = new LoginPage();
});

// Dọn dẹp khi thoát trang
window.addEventListener('beforeunload', () => {
    if (window.loginPage) {
        window.loginPage.destroy();
    }
});

// Xuất class ra window để sử dụng bên ngoài nếu cần
window.LoginPage = LoginPage;