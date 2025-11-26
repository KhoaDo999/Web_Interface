// =========================
//  CẤU HÌNH FIREBASE
// =========================
const firebaseConfig = {
    apiKey: "AIzaSyCQZiOf2hWfa9FmoHbo9pg20_IHyoniTQ0",
    authDomain: "camg-a1729.firebaseapp.com",
    databaseURL: "https://camg-a1729-default-rtdb.firebaseio.com",
    projectId: "camg-a1729",
    storageBucket: "camg-a1729.appspot.com",
    messagingSenderId: "875909622691",
    appId: "1:875909622691:web:6cc3ed99f21ad2df4b4816",
    measurementId: "G-6Y8JN9CFXC",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// =========================
// 🧠 LOAD DỮ LIỆU REALTIME
// =========================
const alertList = document.getElementById("alertList");
const todayCountEl = document.getElementById("today-count");
const weekCountEl = document.getElementById("week-count");
const lastWarningEl = document.getElementById("last-warning");

function loadHistory() {
    const historyRef = db.ref("history");
    historyRef.on("value", (snapshot) => {
        alertList.innerHTML = ""; // Xóa danh sách cũ

        let todayCount = 0;
        let weekCount = 0;
        let lastTime = "--";
        const now = new Date();

        snapshot.forEach((child) => {
            const data = child.val();
            const message = data.message || "";
            const time = data.time || "";

            if (message.toLowerCase().includes("buồn ngủ")) {
                // Tạo phần tử hiển thị
                const div = document.createElement("div");
                div.classList.add("alert-item");
                div.innerHTML = `<p><b>${message}</b></p><p class="time">${time}</p>`;
                alertList.prepend(div);

                // Xử lý thống kê
                const dateParts = time.split(" ")[0].split("-");
                const [day, month, year] = dateParts.map(Number);
                const logDate = new Date(year, month - 1, day);
                const diffDays = (now - logDate) / (1000 * 3600 * 24);

                if (diffDays < 1) todayCount++;
                if (diffDays < 7) weekCount++;
                lastTime = time;
            }
        });

        // Cập nhật thống kê
        todayCountEl.textContent = todayCount;
        weekCountEl.textContent = weekCount;
        lastWarningEl.textContent = lastTime;
    });
}

// =========================
// 🧹 XÓA LỊCH SỬ
// =========================
function clearHistory() {
    if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử buồn ngủ không?")) {
        db.ref("history").remove();
    }
}

// =========================
// 🌙 DARK MODE
// =========================
const toggleButton = document.getElementById("dark-mode-toggle");
toggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    toggleButton.textContent = document.body.classList.contains("dark-mode")
        ? " Light Mode"
        : " Dark Mode";
});

// =========================
// 🚀 KHỞI CHẠY
// =========================
window.onload = loadHistory;
document.getElementById("clearBtn").addEventListener("click", clearHistory);
