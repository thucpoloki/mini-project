
// nút Support 🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷
function SupportIcon() {
    const supportBtn = document.createElement('a');
    supportBtn.href = '';
    supportBtn.className = 'support-btn';
    supportBtn.innerHTML = `
    <i class="fas fa-heart"></i>
    <span>Hỗ trợ</span>
`;
    document.body.appendChild(supportBtn);
}
// 🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷
document.addEventListener('DOMContentLoaded', SupportIcon);
