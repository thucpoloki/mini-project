const innerHTML = `
<iframe src="https://chromedino.com/" frameborder="0" scrolling="no" loading="lazy"></iframe>
`;

// Hàm Insert vào sau thẻ section có id="featured-carousel"
function insertDinoGame() {
  const targetSection = document.getElementById("featured-carousel");
  if (targetSection) {
    const dinoDiv = document.createElement("div");
    dinoDiv.id = "dino-game";
    dinoDiv.innerHTML = innerHTML;
    // afterend để chèn sau phần tử mục tiêu
    targetSection.insertAdjacentElement("afterend", dinoDiv);
    // Ẩn featured-carousel thêm class d-none
    targetSection.classList.add("d-none");
    // Thêm style bootstrap 5
    dinoDiv.classList.add(
      "d-flex",
      "justify-content-center",
      "align-items-center",
      "mt-3"
    );
    dinoDiv.querySelector("iframe").style.width = "100%";
    dinoDiv.querySelector("iframe").style.height = "100%";
    dinoDiv.querySelector("iframe").style.minHeight = "525px";
    dinoDiv.querySelector("iframe").style.borderRadius = "20px";
  } else {
    console.error('Không tìm thấy phần tử với id "featured-carousel"');
  }
}

/**
 * <div class="title mt-3 mb-3">
                    <span class="top-tab_title title_active">
                        <i class="fas fa-star"></i> Nổi bật
                    </span>
                </div>
 * Gọi event listener để khi người dùng nhấn 10 lần vào Nổi bật thì ẩn/hiện game
 */

const titleElement = document.querySelector(
  ".book-carousel-section .title .top-tab_title"
);
if (titleElement) {
  let clickCount = 0;
  titleElement.style.cursor = "pointer";
  titleElement.addEventListener("click", () => {
    clickCount++;
    if (clickCount === 10) {
      insertDinoGame();
      clickCount = 0; // Reset đếm sau khi chèn
    }
  });
} else {
  console.error("Không tìm thấy phần tử tiêu đề để thêm sự kiện click.");
}

// Lắng nghe sự kiện khi mà người dùng đang làm việc trong iframe thì ẩn/hiện thanh cuộn trang của trình duyệt
document.addEventListener("click", (event) => {
  const dinoGame = document.getElementById("dino-game");
  if (dinoGame && dinoGame.contains(event.target)) {
    // Nếu click vào iframe thì ẩn thanh cuộn
    document.body.style.overflow = "hidden !important";
  } else {
    // Nếu click ra ngoài thì hiện lại thanh cuộn
    document.body.style.overflow = "auto !important";
  }
});