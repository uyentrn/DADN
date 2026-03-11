
# 🌊 Water Quality Monitoring Dashboard (AI-Powered)

Đây là giao diện Dashboard thông minh thuộc hệ thống **Dự đoán Chất lượng Nước & Cảnh báo Ô nhiễm dựa trên AI**. Hệ thống được thiết kế chuyên dụng cho việc giám sát môi trường nuôi trồng thủy hải sản thời gian thực.

🚀 **Link Demo:** [https://water-quality-monitoring-dashboard.vercel.app](https://www.google.com/search?q=https://water-quality-monitoring-dashboard.vercel.app)

## ✨ tính năng nổi bật

* **Giám sát thời gian thực:** Hiển thị 6 chỉ số sinh hóa quan trọng: pH, Nhiệt độ, Độ dẫn điện (EC), Độ đục, Oxy hòa tan (DO) và Độ cứng của nước.
* **Dự báo bằng AI:** Tích hợp mô hình Random Forest/LSTM để dự đoán chỉ số chất lượng nước (WQI) và nguy cơ ô nhiễm trong 24h tới.
* **Hệ thống cảnh báo:** Tự động phát hiện và hiển thị các cảnh báo mức độ Critical/Warning dựa trên ngưỡng an toàn của từng chỉ số.
* **Phân tích xu hướng:** Biểu đồ trực quan hóa sự biến thiên của các chỉ số theo thời gian.
* **Thiết kế Responsive:** Giao diện tối ưu hóa hoàn toàn cho cả máy tính và thiết bị di động (Mobile-first).

## 🛠 Công nghệ sử dụng

* **Frontend:** ReactJS, TypeScript.
* **Styling:** Tailwind CSS (Modern & Responsive UI).
* **Charts:** Recharts (Biểu đồ dữ liệu động).
* **Icons:** Lucide React.
* **Build Tool:** Vite.
* **Deployment:** Vercel.

## 🏗 Kiến trúc hệ thống

Hệ thống hoạt động theo luồng:
`IoT Sensors` ➔ `Microcontroller (NodeMCU/RPi)` ➔ `Cloud (Firebase)` ➔ `AI Model Processing` ➔ `Dashboard UI`.

## 🚀 Hướng dẫn cài đặt (Local)

1. **Cài đặt thư viện:**
```bash
npm install

```


2. **Chạy môi trường phát triển:**
```bash
npm run dev

```


3. **Đóng gói dự án (Production):**
```bash
npm run build

```



## 📂 Cấu trúc thư mục chính

* `src/components`: Các khối giao diện Dashboard (SensorCard, TrendCharts...).
* `src/components/ui`: Các thành phần giao diện dùng chung (Button, Card, Skeleton...).
* `src/styles`: Cấu hình màu sắc và theme toàn cục.

