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
        
        // Cập nhật biểu đồ khi có dữ liệu mới
        const selectedDays = parseInt(document.getElementById('timeRange').value);
        updateChartData(selectedDays);
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
// 📊 BIỂU ĐỒ CẢNH BÁO
// =========================
let alertChart = null;

function initializeChart() {
    const ctx = document.getElementById('alertChart').getContext('2d');
    
    alertChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Số cảnh báo',
                data: [],
                borderColor: '#1f3c88',
                backgroundColor: 'rgba(31, 60, 136, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1f3c88',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#eaeaea' : '#333',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? '#333' : '#f0f0f0'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#eaeaea' : '#666',
                        font: { size: 11 }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? '#333' : '#f0f0f0'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#eaeaea' : '#666',
                        font: { size: 11 },
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateChartData(days = 7) {
    const historyRef = db.ref("history");
    historyRef.once("value").then((snapshot) => {
        const alertsByDate = {};
        const today = new Date();
        
        // Khởi tạo dữ liệu cho X ngày gần nhất
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateString = date.toLocaleDateString('vi-VN');
            alertsByDate[dateString] = 0;
        }
        
        // Đếm cảnh báo theo ngày
        snapshot.forEach((child) => {
            const data = child.val();
            const message = data.message || "";
            const time = data.time || "";
            
            if (message.toLowerCase().includes("buồn ngủ") && time) {
                const datePart = time.split(' ')[0];
                const dateObj = new Date(datePart.split('-').reverse().join('-'));
                const dateString = dateObj.toLocaleDateString('vi-VN');
                
                if (alertsByDate.hasOwnProperty(dateString)) {
                    alertsByDate[dateString]++;
                }
            }
        });
        
        // Cập nhật biểu đồ
        const labels = Object.keys(alertsByDate);
        const data = Object.values(alertsByDate);
        
        alertChart.data.labels = labels;
        alertChart.data.datasets[0].data = data;
        alertChart.update();
    });
}

// =========================
// 🎛️ XỬ LÝ THAY ĐỔI TÙY CHỌN BIỂU ĐỒ
// =========================
document.getElementById('timeRange').addEventListener('change', function() {
    updateChartData(parseInt(this.value));
});

document.getElementById('chartType').addEventListener('change', function() {
    alertChart.config.type = this.value;
    alertChart.update();
});

// =========================
// 🌙 DARK MODE & CẬP NHẬT MÀU BIỂU ĐỒ
// =========================
const toggleButton = document.getElementById("dark-mode-toggle");

function updateChartColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#eaeaea' : '#666';
    const gridColor = isDarkMode ? '#333' : '#f0f0f0';
    
    if (alertChart) {
        alertChart.options.plugins.legend.labels.color = textColor;
        alertChart.options.scales.x.ticks.color = textColor;
        alertChart.options.scales.x.grid.color = gridColor;
        alertChart.options.scales.y.ticks.color = textColor;
        alertChart.options.scales.y.grid.color = gridColor;
        alertChart.update();
    }
}

toggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    toggleButton.textContent = document.body.classList.contains("dark-mode")
        ? "Light Mode"
        : "Dark Mode";
    updateChartColors();
});

// =========================
// 🚀 KHỞI CHẠY ỨNG DỤNG
// =========================
window.onload = function() {
    loadHistory();
    initializeChart();
    updateChartData(7);
};

document.getElementById("clearBtn").addEventListener("click", clearHistory);