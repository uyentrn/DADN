# Water Quality Sensor Firmware

This firmware runs on an ESP32 microcontroller to read water quality sensors and send data to your Flask backend.

## Hardware Requirements

- ESP32 development board (e.g., ESP32 DevKit V1)
- **6 analog/digital sensors for the following physical parameters:**
  - Temperature (DS18B20 - 1-Wire digital)
  - Turbidity (analog)
  - Dissolved Oxygen (DO) (analog)
  - pH (analog)
  - Ammonia (NH3) (analog)
  - H2S (analog)

**Note:** The AI model expects 14 total parameters. The remaining 8 are **simulated in software** based on correlations with the 6 real sensors:
- BOD (Biochemical Oxygen Demand)
- CO2
- Alkalinity
- Hardness
- Calcium
- Nitrite
- Phosphorus
- Plankton

## Wiring

### Temperature Sensor (DS18B20) - Digital (1-Wire)
Connect the DS18B20 temperature sensor to **GPIO 4** (Pin D4 on many ESP32 boards):
- VCC → 3.3V or 5V (check your DS18B20 variant)
- GND → GND
- DATA → GPIO 4 (with 4.7kΩ pull-up resistor to VCC)

### Analog Sensors (5 sensors)
Connect the **5 analog sensors** (Turbidity, DO, pH, Ammonia, H2S) to ADC1 pins on the ESP32:

| Sensor           | ESP32 Pin | ADC Channel |
|------------------|-----------|-------------|
| Turbidity        | GPIO 36   | ADC1 CH0    |
| Dissolved Oxygen | GPIO 35   | ADC1 CH1    |
| pH               | GPIO 34   | ADC1 CH6    |
| Ammonia (NH3)    | GPIO 33   | ADC1 CH7    |
| H2S              | GPIO 32   | ADC1 CH4    |

**Important:**
- Use ADC1 pins (GPIO32-39) for analog readings on ESP32
- Ensure sensor output voltage is 0-3.3V (ESP32 ADC max is 3.3V). Use voltage dividers if needed.
- Power sensors appropriately (some may require 5V or excitation voltage).
- The 8 simulated parameters (BOD, CO2, Alkalinity, Hardness, Calcium, Nitrite, Phosphorus, Plankton) are **software-generated** and require no hardware connection.

## Configuration

Before uploading, edit the configuration section in `water_quality.ino`:

1. `WIFI_SSID` / `WIFI_PASSWORD` - Your WiFi network
2. `BACKEND_URL` - Your Flask backend URL (format: `http://IP_ADDRESS:5000/prediction/predict`)
3. (Optional) `SAMPLING_INTERVAL` - How often to send data (default: 60000ms = 1 minute)
4. (Optional) `NUM_SAMPLES` - Number of analog samples to average (default: 10)

## Sensor Calibration

### Physical Sensors (6)

You **must** calibrate these functions with your actual sensor datasheets:

- `getTemperature()` → Temperature (°C) - DS18B20 provides calibrated Celsius
- `getTurbidity()` → Turbidity (NTU) - Convert voltage to NTU using: `voltage * 1000.0`
- `getDissolvedOxygen()` → DO (mg/L) - Convert voltage to mg/L using: `voltage * 10.0`
- `getPH()` → pH (0-14) - Convert voltage to pH using: `voltage * (14.0 / 3.3)`
- `getAmmonia()` → Ammonia/NH3 (mg/L) - Convert voltage to mg/L using: `voltage * 10.0`
- `getH2S()` → H2S (mg/L) - Convert voltage to mg/L using: `voltage * 10.0`

Typical approaches:
- Linear conversion: `value = voltage * slope + intercept`
- Lookup tables
- Polynomial equations

Example from the code:
```cpp
float getTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}
```

### Simulated Sensors (8)

These are **software-generated** based on correlations with real sensors. The current formulas are rough estimates. You can adjust `getBOD()`, `getCO2()`, `getAlkalinity()`, `getHardness()`, `getCalcium()`, `getNitrite()`, `getPhosphorus()`, and `getPlankton()` to match your domain knowledge or historical data patterns.

## Installation

### Prerequisites

1. Install Arduino IDE or PlatformIO (VS Code extension)
2. Add ESP32 board support:
   - In Arduino IDE: File → Preferences → Additional Boards Manager URLs → `https://dl.espressif.com/dl/package_esp32_index.json`
   - Then install "ESP32" via Boards Manager
3. Install required libraries (Arduino IDE Library Manager):
   - **ArduinoJson** (by Benoit Blanchon) - for JSON serialization
   - **OneWire** - for DS18B20 temperature sensor
   - **DallasTemperature** - for DS18B20 temperature sensor
   - HTTPClient (usually included with ESP32 core)

### Library Installation (Arduino IDE)
- Search for "ArduinoJson" and install
- Search for "OneWire" and install
- Search for "DallasTemperature" and install

### Upload

1. Select your ESP32 board (e.g., "ESP32 Dev Module")
2. Select the correct COM port
3. Click Upload

## Testing

1. Open Serial Monitor at 115200 baud
2. Watch for WiFi connection and data being sent every 60 seconds
3. You should see JSON output like:
```json
{"Temp":24.5,"Turbidity":3.2,"DO":7.8,"BOD":1.24,"CO2":7.84,"pH":6.98,"Alkalinity":40.32,"Hardness":114.95,"Calcium":52.1,"Ammonia":0.02,"Nitrite":0.001,"Phosphorus":0.99,"H2S":0.0197,"Plankton":3092.0}
```
4. Check your Flask backend to see if data arrives and predictions are returned

## Backend Notes

- The firmware POSTs JSON to `/prediction/predict` with all 14 parameters
- Backend returns quality prediction and solution: `{"quality_label":2,"quality_name":"Good","solution":"Monitor regularly."}`
- The firmware prints the response to Serial (you could add an OLED display, LEDs, etc. for visual feedback)
- Backend automatically stores all predictions in SQLite database

## API Endpoint Format

**Endpoint:** `POST http://your-backend-ip:5000/prediction/predict`

**Request Body (JSON):**
```json
{
    "Temp": 67.45,
    "Turbidity": 10.13,
    "DO": 0.208,
    "BOD": 7.474,
    "CO2": 10.181,
    "pH": 4.752,
    "Alkalinity": 218.365,
    "Hardness": 300.125,
    "Calcium": 337.178,
    "Ammonia": 0.286,
    "Nitrite": 4.355,
    "Phosphorus": 0.006,
    "H2S": 0.067,
    "Plankton": 6070
}
```

**Response (JSON):**
```json
{
    "quality_label": 2,
    "quality_name": "Good",
    "solution": "Monitor regularly."
}
```

## Troubleshooting

- **ADC readings unstable?** Try increasing `NUM_SAMPLES` or add capacitors to sensor outputs.
- **Temperature sensor not detected?** Check DS18B20 wiring (data pin to GPIO 4) and 4.7kΩ pull-up resistor.
- **WiFi drops?** The code attempts reconnection with exponential backoff.
- **400 Bad Request from backend?** Check JSON formatting and parameter names match exactly.
- **No data in backend?** Verify ESP32 and backend are on the same network, and port 5000 is accessible. Check firewall settings.
- **Library errors?** Ensure all required libraries (ArduinoJson, OneWire, DallasTemperature) are installed.

## Customization Ideas

- Store readings locally if WiFi is down (use SPIFFS or SD card)
- Add MQTT instead of HTTP for IoT integration
- Include device_id in the JSON for multi-device tracking
- Display results on an OLED screen (SSD1306)
- Add LEDs or buzzer for status indication/alert
- Add buttons to trigger manual reads or configuration
- Power from battery with deep sleep modes to save energy
- Implement configurable backend URL via WiFi captive portal or serial commands