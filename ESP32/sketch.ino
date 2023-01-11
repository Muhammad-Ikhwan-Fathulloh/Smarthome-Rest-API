#include <WiFi.h>
#include <DHTesp.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

DHTesp dhtSensor;

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const String url = "https://63b733ad4d97e82aa3b7143b.mockapi.io/api/v1/";
String response_success = "success";
String response_error = "error";

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  dhtSensor.setup(15, DHTesp::DHT22);
  
  WiFi.begin(ssid, password, 6);
  Serial.println("Menunggu koneksi Wifi");
  while(WiFi.status() != WL_CONNECTED){
    delay(100);
    Serial.print(".");
  }

  Serial.print("Koneksi Wifi IP ");
  Serial.println(WiFi.localIP());
}

void loop() {
  control();
  monitoring();
}

void control(){
  HTTPClient http;
  http.begin(url + "control");
  int httpRespCode = http.GET();
  if(httpRespCode > 0){
    Serial.println(httpRespCode);
    String payload = http.getString();
    Serial.println(response_success);
    // Serial.println(payload);
    JSONVar control_object = JSON.parse(payload);
    for(int i = 0; i < control_object.length(); i++){
      JSONVar control_name = control_object[i]["control_name"];
      JSONVar control_pin = control_object[i]["control_pin"];
      JSONVar control_value = control_object[i]["control_value"];
      Serial.println(control_name);
      Serial.println(control_pin);
      Serial.println(control_value);
      pinMode(control_pin, OUTPUT);
      digitalWrite(control_pin, control_value);
    }
  }else{
    Serial.println(response_error);
  }
  http.end();
}

void monitoring(){
  HTTPClient http;

  TempAndHumidity data = dhtSensor.getTempAndHumidity();
  Serial.println("Temp " + String(data.temperature));
  Serial.println("Humd " + String(data.humidity));

  String temp_value = String(data.temperature);
  String humd_value = String(data.humidity);

  JSONVar valueTemp;
  valueTemp["monitoring_value"] = temp_value;

  JSONVar valueHumd;
  valueHumd["monitoring_value"] = humd_value;

  String monitoringTemp = JSON.stringify(valueTemp);
  String monitoringHumd = JSON.stringify(valueHumd);

  Serial.println("Temp " + monitoringTemp);
  Serial.println("Humd " + monitoringHumd);

  http.begin(url + "monitoring/1");
  http.addHeader("Content-Type", "application/json");
  int httpRespCode1 = http.PUT(monitoringTemp);
  if(httpRespCode1 > 0){
    Serial.println(httpRespCode1);
    Serial.println(response_success);
  }else{
    Serial.println(response_error);
  }
  http.end();

  http.begin(url + "monitoring/2");
  http.addHeader("Content-Type", "application/json");
  int httpRespCode2 = http.PUT(monitoringHumd);
  if(httpRespCode2 > 0){
    Serial.println(httpRespCode2);
    Serial.println(response_success);
  }else{
    Serial.println(response_error);
  }
  http.end();
  
}
