#include "DHT.h"
#include <WiFi.h>
#include <WebSocketsServer.h>

// ---------- Pin Definitions ----------
#define DHTPIN      21        // DHT11 data pin
#define DHTTYPE     DHT11
#define SOLAR_PIN   36        // ADC1_CH0 (VP pin)

// ---------- WiFi Credentials ----------
const char* ssid = "vivo T3x 5G";
const char* password = "12345678";

DHT dht(DHTPIN, DHTTYPE);
WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      }
      break;
    case WStype_TEXT:
      Serial.printf("[%u] Received: %s\n", num, payload);
      break;
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  // ---------- Connect to WiFi ----------
  Serial.println("\nConnecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // ---------- Start WebSocket Server ----------
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started on port 81");
}

void loop() {
  webSocket.loop();

  // ---------- Read DHT11 ----------
  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();

  // Check if DHT read failed
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error reading DHT11!");
    delay(1500);
    return;
  }

  // ---------- Read Solar Sensor ----------
  int adcValue = analogRead(SOLAR_PIN);             // Raw ADC (0–4095)
  float adcVoltage = adcValue * (3.3 / 4095.0);     // Convert to voltage
  float lightVoltage = 3.3 - adcVoltage;            // Inverted reading
  int lightPercent = map(adcValue, 4095, 0, 0, 100); // 0–100%

  // ---------- Print Output ----------
  Serial.println("===== SENSOR READINGS =====");

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" °C   |   Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.print("Solar ADC Raw: ");
  Serial.print(adcValue);

  Serial.print("   |   ADC Voltage: ");
  Serial.print(adcVoltage);
  Serial.print(" V");

  Serial.print("   |   Light Voltage: ");
  Serial.print(lightVoltage);
  Serial.print(" V");

  Serial.print("   |   Light Level: ");
  Serial.print(lightPercent);
  Serial.println(" %");

  Serial.println("============================\n");

  // ---------- Send Data via WebSocket ----------
  String jsonData = "{";
  jsonData += "\"temperature\":" + String(temperature) + ",";
  jsonData += "\"humidity\":" + String(humidity) + ",";
  jsonData += "\"adcValue\":" + String(adcValue) + ",";
  jsonData += "\"adcVoltage\":" + String(adcVoltage) + ",";
  jsonData += "\"lightVoltage\":" + String(lightVoltage) + ",";
  jsonData += "\"lightPercent\":" + String(lightPercent);
  jsonData += "}";
  
  webSocket.broadcastTXT(jsonData);

  delay(1500); // 1.5 sec delay
}