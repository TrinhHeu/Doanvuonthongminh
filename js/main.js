let currentTemp = null; // Nhiệt độ mẫu
let currentUnit = "C";

const toggleBtn = document.getElementById("toggle-unit");
const unitMenu = document.getElementById("unit-menu");
const toCelsius = document.getElementById("to-celsius");
const toFahrenheit = document.getElementById("to-fahrenheit");
const temperatureElement = document.getElementById("temperature");

// Toggle menu dropdown
toggleBtn.addEventListener("click", (e) => {
  unitMenu.classList.toggle("show");
  e.stopPropagation(); // Ngăn việc click lan ra ngoài
});

// Chuyển đổi sang °C
toCelsius.addEventListener("click", () => {
  if (currentUnit !== "C" && currentTemp !== null) {
    currentTemp = ((currentTemp - 32) * 5) / 9;
    temperatureElement.innerText = `${currentTemp.toFixed(2)}°C`;
    currentUnit = "C";
  }
  unitMenu.classList.remove("show");
});

// Chuyển đổi sang °F
toFahrenheit.addEventListener("click", () => {
  if (currentUnit !== "F" && currentTemp !== null) {
    currentTemp = (currentTemp * 9) / 5 + 32;
    temperatureElement.innerText = `${currentTemp.toFixed(2)}°F`;
    currentUnit = "F";
  }
  unitMenu.classList.remove("show");
});

// Ẩn menu khi click ra ngoài
window.addEventListener("click", () => {
  unitMenu.classList.remove("show");
});

// Lấy dữ liệu mới nhất từ server
function fetchLatestData() {
  fetch(API_URL)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 204) {
        console.log("No new data.");
        return null;
      } else {
        throw new Error("Error fetching data.");
      }
    })
    .then(data => {
      if (data) {
        console.log("New data received:", data);
        // Cập nhật giao diện
        updateUI(data.data);
      }
    })
    .catch(error => console.error("Error:", error));
}

// Hàm cập nhật giao diện
function updateUI(data) {
  const [temperature, humidity, soilmoisture, precipitation, windSpeed] = data.map(value => value || 'NaN');
  if (!isNaN(temperature)) {
    currentTemp = parseFloat(temperature); // Cập nhật currentTemp với nhiệt độ mới
    if (currentUnit === "F") {
      currentTemp = (currentTemp * 9) / 5 + 32;
      temperatureElement.innerText = `${currentTemp.toFixed(2)}°F`;
    } else {
      temperatureElement.innerText = `${currentTemp.toFixed(2)}°C`;
    }
  } else {
    temperatureElement.innerText = 'NaN';
  }

}

// Gửi 1 request sau mỗi 60 giây
setInterval(fetchLatestData, 60000);

// ------------------------------------------------------------------------------------------------

// Hiển thị ngày giờ
function updateClockAndDate() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Cập nhật giờ
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;

  // Cập nhật ngày
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[now.getDay()];
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  document.getElementById('date').textContent = `${dayName}, ${day} Tháng ${month}, ${year}`;
}

// Cập nhật mỗi giây
setInterval(updateClockAndDate, 1000);
updateClockAndDate(); // Gọi ngay lần đầu khi load trang

// ------------------------------------------------------------------------------------------------

// Hiển thị lịch sử truy vấn
document.getElementById("history-button").addEventListener("click", function () {
  const historyModal = document.getElementById("history-modal");

  // Nếu modal đang hiển thị, ẩn nó khi click lần nữa
  if (historyModal.style.display === "flex") {
    historyModal.style.display = "none";
  } else {
    // Fetch dữ liệu lịch sử từ server
    fetch("https://project1-two-beta.vercel.app/get-history")
      .then(response => response.json())
      .then(data => {
        const historyData = data.history.slice(0, 20); // Lấy tối đa 20 truy vấn

        let html = "<h3>Tra cứu lịch sử</h3><table><tr><th>Ngày</th><th>Thời gian</th><th>Nhiệt độ (°C)</th><th>Độ ẩm (%)</th><th>Độ ẩm đất (%)</th><th>Lượng mưa (mm)</th>";

        historyData.forEach(item => {
          html += `<tr>
                      <td>${item.date || "NaN"}</td>
                      <td>${item.time || "NaN"}</td>
                      <td>${item.temperature || "NaN"}</td>
                      <td>${item.humidity || "NaN"}</td>
                      <td>${item.soilmoisture || "NaN"}</td>
                      <td>${item.precipitation || "NaN"}</td>
                  </tr>`;
        });

        html += "</table>";
        document.getElementById("history-data").innerHTML = html;
        historyModal.style.display = "flex"; // Hiển thị modal
      })
      .catch(error => console.log("Error fetching history: ", error));
  }
});

// Đóng modal khi click vào nút đóng
document.getElementById("close-history").addEventListener("click", function () {
  document.getElementById("history-modal").style.display = "none";
});

// Đóng modal khi click ngoài modal
window.addEventListener("click", function (event) {
  if (event.target == document.getElementById("history-modal")) {
    document.getElementById("history-modal").style.display = "none";
  }
});
