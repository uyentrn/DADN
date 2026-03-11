# Water Quality AI System

Tai lieu nay huong dan chay va test local cho he thong:

- `backend`: Flask API, auth, SQLite, sensor pipeline
- `ai_service`: Flask API du doan `NORMAL` hoac `WARNING`
- `iot_simulator`: chua can dung de test, co the goi API bang `curl`

He thong dang chay theo luong:

1. IoT gui du lieu den `backend`
2. `backend` goi `ai_service`
3. `ai_service` tra ve `NORMAL` hoac `WARNING`
4. `backend` xu ly:
   - `NORMAL`: luu database
   - `WARNING`: gui email canh bao

## 1. Cau truc lien quan

```text
water-quality-ai-system/
├── ai_service/
│   ├── app/
│   ├── requirements.txt
│   └── run.py
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── run.py
├── iot_simulator/
└── docs/
```

## 2. Yeu cau moi truong

- Python 3.10+
- `pip`

Kiem tra:

```bash
python3 --version
pip3 --version
```

## 3. Chay AI service local

Mo terminal thu 1:

```bash
cd ai_service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 run.py
```

AI service mac dinh chay tai:

```text
http://127.0.0.1:8000
```

Test nhanh:

```bash
curl http://127.0.0.1:8000/health
```

Test API du doan:

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "x": 7
  }'
```

Ket qua mong doi:

```json
{
  "status": "WARNING",
  "value": 7
}
```

Thu them case `NORMAL`:

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "x": 3
  }'
```

## 4. Chay backend local

Mo terminal thu 2:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Cau hinh email canh bao

Backend dung Gmail SMTP. Ban nen dung Gmail App Password, khong dung mat khau Gmail thuong.

Export bien moi truong truoc khi chay:

```bash
export EMAIL="your_email@gmail.com"
export PASSWORD="your_gmail_app_password"
export ALERT_EMAIL_TO="receiver_email@gmail.com"
export AI_SERVICE_URL="http://127.0.0.1:8000/predict"
```

Neu muon doi SMTP host/port:

```bash
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
```

Chay backend:

```bash
python3 run.py
```

Backend mac dinh chay tai:

```text
http://127.0.0.1:5000
```

Test nhanh:

```bash
curl http://127.0.0.1:5000/health
```

## 5. Database local

Backend dang dung `SQLite`.

File database duoc tao tu dong khi backend khoi dong:

```text
backend/water_quality.db
```

Bang hien tai:

- `users`
- `sensor_data`

## 6. Test auth local

### Dang ky

```bash
curl -X POST http://127.0.0.1:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "123456"
  }'
```

### Dang nhap

```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }'
```

Hoac dang nhap bang email:

```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456"
  }'
```

### Dang xuat

Thay `your-jwt-token` bang token nhan duoc tu login:

```bash
curl -X POST http://127.0.0.1:5000/auth/logout \
  -H "Authorization: Bearer your-jwt-token"
```

## 7. Test pipeline IoT -> AI -> Alert

Dieu kien truoc khi test:

- AI service dang chay o port `8000`
- Backend dang chay o port `5000`
- Gmail App Password da duoc cau hinh neu muon test email

### Case 1: Gia tri NORMAL

Gui du lieu cam bien:

```bash
curl -X POST http://127.0.0.1:5000/sensor/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "sensor_01",
    "x": 3
  }'
```

Ket qua mong doi:

- Backend goi AI service
- AI service tra ve `NORMAL`
- Backend luu du lieu vao bang `sensor_data`
- API tra ve `201`

Vi du response:

```json
{
  "data": {
    "created_at": "2026-03-10T10:00:00",
    "device_id": "sensor_01",
    "id": 1,
    "status": "NORMAL",
    "value": 3
  },
  "message": "Sensor data saved successfully"
}
```

### Case 2: Gia tri WARNING

Gui du lieu cam bien:

```bash
curl -X POST http://127.0.0.1:5000/sensor/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "sensor_01",
    "x": 7
  }'
```

Ket qua mong doi:

- Backend goi AI service
- AI service tra ve `WARNING`
- Backend khong luu DB
- Backend gui email canh bao
- API tra ve `200`

Vi du response:

```json
{
  "data": {
    "alert_sent": true,
    "device_id": "sensor_01",
    "status": "WARNING",
    "value": 7
  },
  "message": "Warning detected. Alert email sent successfully"
}
```

## 8. Kiem tra du lieu trong SQLite

Neu may co `sqlite3`, co the kiem tra du lieu da luu:

```bash
cd backend
sqlite3 water_quality.db
```

Trong man hinh `sqlite3`:

```sql
.tables
SELECT * FROM users;
SELECT * FROM sensor_data;
```

Luu y:

- Chi case `NORMAL` moi duoc luu vao `sensor_data`
- Case `WARNING` chi gui email theo dung yeu cau hien tai

## 9. Test nhanh end-to-end

Neu muon test nhanh toan bo luong, lam theo thu tu:

1. Chay `ai_service`
2. Chay `backend`
3. Test `GET /health` cho ca hai service
4. Test `POST /predict` truc tiep tren AI service
5. Test `POST /auth/register`
6. Test `POST /auth/login`
7. Test `POST /sensor/data` voi `x = 3`
8. Test `POST /sensor/data` voi `x = 7`
9. Kiem tra email nhan duoc
10. Kiem tra bang `sensor_data`

## 10. Loi thuong gap

### Loi `Failed to connect to AI service`

Nguyen nhan:

- AI service chua chay
- Sai `AI_SERVICE_URL`
- AI service khong chay o port `8000`

Khac phuc:

```bash
export AI_SERVICE_URL="http://127.0.0.1:8000/predict"
```

Va dam bao terminal AI service dang chay.

### Loi `Email credentials are not configured`

Nguyen nhan:

- Chua export `EMAIL`
- Chua export `PASSWORD`
- Van dang dung gia tri mac dinh trong config

Khac phuc:

```bash
export EMAIL="your_email@gmail.com"
export PASSWORD="your_gmail_app_password"
export ALERT_EMAIL_TO="receiver_email@gmail.com"
```

### Loi `Failed to send alert email`

Kiem tra:

- Gmail App Password co dung khong
- Tai khoan Gmail co bat 2FA chua
- Mang co chan SMTP khong

### Loi `x must be a number`

Body JSON phai dung:

```json
{
  "device_id": "sensor_01",
  "x": 7
}
```

### Loi `ModuleNotFoundError`

Can kich hoat dung virtual environment va cai dependencies:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## 11. Ghi chu

- `ai_service` khong truy cap database
- `ai_service` khong gui email
- Route chi xu ly HTTP request, business logic nam trong service
- `logout` hien tai theo kieu JWT stateless
