// Trình xử lý trang tài khoản
class AccountPage {
    constructor() {
        this.currentUser = null;
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
        console.log('👤 Khởi tạo trang Tài khoản...');
        
        // Kiểm tra nếu người dùng đã đăng nhập
        this.currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
        
        if (!this.currentUser) {
            // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
            window.location.href = '/login';
            return;
        }
        
        // Tải thông tin người dùng lên giao diện
        this.loadUserProfile();
        
        // Khởi tạo các sự kiện cho trang
        this.initEventListeners();
        
        // Khởi tạo công tắc hiển thị mật khẩu
        this.initPasswordToggles();
    }

    loadUserProfile() {
        // Hiển thị thông tin người dùng ở phần sidebar
        document.getElementById('userNameDisplay').textContent = this.currentUser.username;
        document.getElementById('userEmailDisplay').textContent = this.currentUser.email;
        
        if (this.currentUser.avatar) {
            document.getElementById('userAvatarDisplay').src = this.currentUser.avatar;
        }
        
        // Điền giá trị vào form hồ sơ
        document.getElementById('profileUsername').value = this.currentUser.username || '';
        document.getElementById('profileEmail').value = this.currentUser.email || '';
        document.getElementById('profileFullName').value = this.currentUser.fullName || '';
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        
        if (this.currentUser.address) {
            document.getElementById('profileStreet').value = this.currentUser.address.street || '';
            document.getElementById('profileCity').value = this.currentUser.address.city || '';
            document.getElementById('profileDistrict').value = this.currentUser.address.district || '';
            document.getElementById('profileWard').value = this.currentUser.address.ward || '';
        }
    }

    initEventListeners() {
        // Xử lý gửi form hồ sơ
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault(); // Ngăn chặn gửi form mặc định
                this.handleProfileUpdate();
            });
        }
        
        // Xử lý gửi form đổi mật khẩu
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordChange();
            });
        }

        // Nút xác nhận xóa tài khoản
        const confirmDeleteButton = document.getElementById('confirmDeleteButton');
        if (confirmDeleteButton) {
            confirmDeleteButton.addEventListener('click', () => {
                this.handleDeleteAccount();
            });
        }
    }

    initPasswordToggles() {
        const toggleButtons = [
            { btn: 'toggleCurrentPassword', input: 'currentPassword' },
            { btn: 'toggleNewPassword', input: 'newPassword' },
            { btn: 'toggleConfirmNewPassword', input: 'confirmNewPassword' },
            { btn: 'toggleDeletePassword', input: 'deleteAccountPassword' }
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

    async handleProfileUpdate() {
        const updatedProfile = {
            email: document.getElementById('profileEmail').value.trim(),
            fullName: document.getElementById('profileFullName').value.trim(),
            phone: document.getElementById('profilePhone').value.trim(),
            address: {
                street: document.getElementById('profileStreet').value.trim(),
                city: document.getElementById('profileCity').value.trim(),
                district: document.getElementById('profileDistrict').value.trim(),
                ward: document.getElementById('profileWard').value.trim()
            }
        };

        // Hiện tại chỉ cập nhật localStorage (có thể thêm gọi API sau)
        try {
            // Cập nhật đối tượng người dùng hiện tại
            Object.assign(this.currentUser, updatedProfile);
            
            // Lưu vào localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(this.currentUser));
            
            this.showAlert('profileAlert', 'Cập nhật thông tin thành công!', 'success');
            
            // Cập nhật hiển thị email
            document.getElementById('userEmailDisplay').textContent = this.currentUser.email;
            
        } catch (error) {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            this.showAlert('profileAlert', 'Có lỗi xảy ra khi cập nhật thông tin!', 'danger');
        }
    }

    async handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();

        // Xóa các lỗi trước đó
        this.clearFieldError('currentPassword');
        this.clearFieldError('newPassword');
        this.clearFieldError('confirmNewPassword');

        let isValid = true;

        // Kiểm tra hợp lệ dữ liệu
        if (!currentPassword) {
            this.showFieldError('currentPassword', 'errCurrentPassword', 'Vui lòng nhập mật khẩu hiện tại!');
            isValid = false;
        }

        if (!newPassword) {
            this.showFieldError('newPassword', 'errNewPassword', 'Vui lòng nhập mật khẩu mới!');
            isValid = false;
        } else if (!this.validatePassword(newPassword)) {
            this.showFieldError('newPassword', 'errNewPassword', 'Mật khẩu phải có 6-20 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt!');
            isValid = false;
        }

        if (!confirmNewPassword) {
            this.showFieldError('confirmNewPassword', 'errConfirmNewPassword', 'Vui lòng xác nhận mật khẩu mới!');
            isValid = false;
        } else if (newPassword !== confirmNewPassword) {
            this.showFieldError('confirmNewPassword', 'errConfirmNewPassword', 'Mật khẩu xác nhận không khớp!');
            isValid = false;
        }

        if (!isValid) return;

        // Hiện tại so sánh với password lưu trong localStorage (trong thực tế nên gọi API để xác thực)
        try {
            if (this.currentUser.password === currentPassword) {
                // Cập nhật mật khẩu
                this.currentUser.password = newPassword;
                localStorage.setItem('loggedInUser', JSON.stringify(this.currentUser));
                
                this.showAlert('passwordAlert', 'Đổi mật khẩu thành công!', 'success');
                
                // Xóa form
                document.getElementById('passwordForm').reset();
            } else {
                this.showAlert('passwordAlert', 'Mật khẩu hiện tại không đúng!', 'danger');
            }
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            this.showAlert('passwordAlert', 'Có lỗi xảy ra khi đổi mật khẩu!', 'danger');
        }
    }

    validatePassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/;
        return regex.test(password);
    }

    showAlert(elementId, message, type) {
        const alert = document.getElementById(elementId);
        if (!alert) return;

        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        
        setTimeout(() => {
            alert.className = 'alert d-none';
        }, 5000);
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
        
        const errorElement = field?.nextElementSibling;
        if (errorElement && errorElement.classList.contains('invalid-feedback')) {
            errorElement.textContent = '';
        }
    }

    async handleDeleteAccount() {
        const password = document.getElementById('deleteAccountPassword').value.trim();
        const confirmCheckbox = document.getElementById('confirmDeleteCheckbox');
        const confirmButton = document.getElementById('confirmDeleteButton');
        const alertElement = document.getElementById('deleteAccountAlert');

        // Xóa lỗi cũ
        this.clearFieldError('deleteAccountPassword');
        alertElement.className = 'alert d-none';

        // Kiểm tra đầu vào
        if (!password) {
            this.showFieldError('deleteAccountPassword', 'errDeletePassword', 'Vui lòng nhập mật khẩu để xác nhận!');
            return;
        }

        if (!confirmCheckbox.checked) {
            alertElement.className = 'alert alert-warning';
            alertElement.textContent = 'Vui lòng đánh dấu vào ô xác nhận!';
            return;
        }

        // Vô hiệu hóa nút và hiển thị loading
        confirmButton.disabled = true;
        confirmButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xóa...';

        try {
            // Lấy token - Login.js lưu token dưới khóa 'token'
            const authToken = localStorage.getItem('token');
            
            if (!authToken) {
                alertElement.className = 'alert alert-danger';
                alertElement.textContent = 'Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại!';
                confirmButton.disabled = false;
                confirmButton.innerHTML = '<i class="fas fa-trash-alt me-2"></i>Xóa tài khoản';
                
                // Chuyển hướng tới trang đăng nhập sau 2s
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }
            
            console.log('🔑 Đang xóa tài khoản, token (rút gọn):', authToken.substring(0, 20) + '...');
            
            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                // Hiển thị thông báo thành công
                alertElement.className = 'alert alert-success';
                alertElement.textContent = 'Tài khoản đã được xóa thành công. Đang chuyển hướng...';

                // Xóa dữ liệu sau 2 giây
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/login';
                }, 2000);

            } else {
                // Hiển thị thông báo lỗi
                alertElement.className = 'alert alert-danger';
                alertElement.textContent = data.message || 'Xóa tài khoản thất bại!';
                
                confirmButton.disabled = false;
                confirmButton.innerHTML = '<i class="fas fa-trash-alt me-2"></i>Xóa tài khoản';
            }

        } catch (error) {
            console.error('Lỗi khi xóa tài khoản:', error);
            alertElement.className = 'alert alert-danger';
            alertElement.textContent = 'Lỗi kết nối đến server!';
            
            confirmButton.disabled = false;
            confirmButton.innerHTML = '<i class="fas fa-trash-alt me-2"></i>Xóa tài khoản';
        }
    }
}

// Khởi tạo trang tài khoản khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    window.accountPage = new AccountPage();
});

// Xuất class ra window để sử dụng bên ngoài nếu cần
window.AccountPage = AccountPage;
