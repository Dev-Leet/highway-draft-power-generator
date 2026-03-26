#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>
#include "Arduino_LED_Matrix.h"
#include "wifi_credentials.h"
#include "led_patterns.h"

// ── Hardware configuration ────────────────────────────────────────────────────
static constexpr char     SERVER_HOST[]  = "172.25.242.240"; // LAN IP of your dev PC
static constexpr uint16_t SERVER_PORT    = 5000;
static constexpr char     INGEST_PATH[]  = "/api/hardware/ingest";
static constexpr char     DEVICE_ID[]    = "HDPG-UNO-R4-01";
static constexpr uint8_t  VOLTAGE_PIN    = A0;
static constexpr uint16_t SEND_INTERVAL  = 10000;           // ms — matches existing cadence
static constexpr float    ADC_MAX        = 4095.0f;         // 12-bit resolution
static constexpr float    ADC_REF_V      = 3.3f;
static constexpr float    TURBINE_MAX_W  = 200.0f;
static constexpr uint16_t HTTP_TIMEOUT   = 8000;            // ms

ArduinoLEDMatrix matrix;
WiFiClient       wifiClient;
HttpClient       http(wifiClient, SERVER_HOST, SERVER_PORT);

unsigned long lastSendMs = 0;

// ── Forward declarations ──────────────────────────────────────────────────────
void connectWiFi();
float readVoltageWatts();
void sendPayload(float voltageWatt);

// ─────────────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  matrix.begin();
  showPattern(matrix, PAT_CONNECTING);

  http.setHttpResponseTimeout(HTTP_TIMEOUT);
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    showPattern(matrix, PAT_CONNECTING);
    connectWiFi();
    return;
  }

  if (millis() - lastSendMs >= SEND_INTERVAL) {
    lastSendMs = millis();
    sendPayload(readVoltageWatts());
  }
}

// ── Wi-Fi ─────────────────────────────────────────────────────────────────────
void connectWiFi() {
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint8_t attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 24) {
    delay(500);
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    showPattern(matrix, PAT_CONNECTED);
    Serial.print("[WiFi] Connected — IP: ");
    Serial.println(WiFi.localIP());
  } else {
    showPattern(matrix, PAT_ERROR);
    Serial.println("[WiFi] Failed. Retrying in 10s.");
    delay(10000);
  }
}

// ── ADC → Watts ───────────────────────────────────────────────────────────────
float readVoltageWatts() {
  // 8-sample oversample to reduce ADC noise
  uint32_t sum = 0;
  for (uint8_t i = 0; i < 8; i++) {
    sum += analogRead(VOLTAGE_PIN);
    delayMicroseconds(120);
  }
  const float adcAvg = sum / 8.0f;
  const float volts  = (adcAvg / ADC_MAX) * ADC_REF_V;
  const float watts  = (volts / ADC_REF_V) * TURBINE_MAX_W;
  return constrain(watts, 0.0f, TURBINE_MAX_W);
}

// ── HTTP POST ─────────────────────────────────────────────────────────────────
void sendPayload(float voltageWatt) {
  showPattern(matrix, PAT_TRANSMITTING);

  JsonDocument doc;
  doc["device_id"]    = DEVICE_ID;
  doc["voltage_watt"] = round(voltageWatt * 100.0f) / 100.0f; // 2 decimal places
  doc["uptime_ms"]    = millis();

  char body[128];
  const size_t bodyLen = serializeJson(doc, body, sizeof(body));

  http.beginRequest();
  http.post(INGEST_PATH);
  http.sendHeader("Content-Type",  "application/json");
  http.sendHeader("Content-Length", bodyLen);
  http.sendHeader("X-API-Key",     HARDWARE_API_KEY);
  http.sendHeader("Connection",    "close");
  http.beginBody();
  http.print(body);
  http.endRequest();

  const int status = http.responseStatusCode();

  // Consume response body to free the TCP socket cleanly
  while (http.available()) { http.read(); }

  if (status == 201) {
    showPattern(matrix, PAT_CONNECTED);
    Serial.printf("[TX] %.2fW  →  HTTP %d\n", voltageWatt, status);
  } else {
    showPattern(matrix, PAT_ERROR);
    Serial.printf("[TX] HTTP %d — check server logs\n", status);
    delay(2000);
    showPattern(matrix, PAT_CONNECTED);
  }
}