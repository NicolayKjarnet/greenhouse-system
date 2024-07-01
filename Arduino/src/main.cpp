#include <cmath>
#include <Arduino.h>
#include <Wire.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include "Adafruit_SHT31.h"
#include "ThingSpeak.h"
#include <SPI.h>
#include <Adafruit_DotStar.h>
#include "Adafruit_LTR329_LTR303.h"
#include <ArduinoJson.h>
#include <Pushsafer.h>

#define NUMPIXELS  1
#define DATAPIN    33
#define CLOCKPIN   21
#define HALL_SENSOR_PIN 1
#define PushsaferKey ""

Adafruit_SHT31 sht31 = Adafruit_SHT31();
Adafruit_DotStar strip(NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_RGB);
Adafruit_LTR329 ltr = Adafruit_LTR329();

WiFiClient client;
WiFiMulti wiFiMulti;
Pushsafer pushsafer(PushsaferKey, client);
WeatherMapAPIKey = ""; // Add your own API key here

// -------------------------------- GLOBAL VARIABLES --------------------------------

// WiFi network name and password:
const char* ssid = "";
const char* password = "";

// Internet address to send POST data to
const char * hostDomain = ""; // Write 'ipconfig getifaddr en0' in CLI to find correct ip
const int hostPort = 3000;

unsigned long lastTime = 0;
unsigned long timerDelay = 15000;

bool magnetNearSensor = false;
bool doorAlertSent = false;
bool enableHeater = false;
bool lightOn = false;
unsigned long lightStartTime = 0;
uint8_t loopCnt = 0;

// -------------------------------- GLOBAL VARIABLES END --------------------------------

// -------------------------------- SETUP --------------------------------

void setup()
{
  Serial.begin(115200);

  strip.begin();
  strip.setBrightness(20);
  strip.show();

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(HALL_SENSOR_PIN, INPUT);

  while (!Serial)
    delay(10);

  Serial.println("SHT31 test");
  if (! sht31.begin(0x44))
  {
    Serial.println("Couldn't find SHT31");
    while (1) delay(1);
  }

  Serial.println("Adafruit LTR-329 advanced test");
  if (!ltr.begin())
  {
    Serial.println("Couldn't find LTR sensor!");
    while (1) delay(10);
  }

  Serial.println("Found LTR sensor!");
  ltr.setGain(LTR3XX_GAIN_2);
  Serial.print("Gain: ");
  Serial.println(ltr.getGain());
  ltr.setIntegrationTime(LTR3XX_INTEGTIME_100);
  Serial.print("Integration Time (ms): ");
  Serial.println(ltr.getIntegrationTime());
  ltr.setMeasurementRate(LTR3XX_MEASRATE_200);
  Serial.print("Measurement Rate (ms): ");
  Serial.println(ltr.getMeasurementRate());

  WiFi.mode(WIFI_STA);   

  wiFiMulti.addAP(ssid, password);

  ThingSpeak.begin(client);
}

// -------------------------------- SETUP END --------------------------------

// -------------------------------- HELPER FUNCTIONS --------------------------------

/**
 * @brief Helper function for converting CH0 and CH1 values into a lux value.
 * @param CH0 Reference to uint16_t where visible+IR data will be stored
 * @param CH1 Reference to uint16_t where IR-only data will be stored
 * @return The lux value calculated from the CH0 and CH1 values
*/
unsigned int getLux(double CH0, double CH1)
{
	  unsigned int lux = 0;
		byte integrationTime = 0x01;
		byte gain = 0x00;
		double ratio;
		uint ALS_GAIN[8] = {1, 2, 4, 8, 1, 1, 48, 96};
		float ALS_INT[8] = {1.0, 0.5, 2.0, 4.0, 1.5, 2.5, 3.0, 3.5};

		// Determine lux per datasheet equations:
		if (ratio < 0.45)
		{
			lux = ((1.7743 * CH0) + (1.1059 * CH1)) / ALS_GAIN[gain] / ALS_INT[integrationTime];
		}

		else if (ratio < 0.64)
		{
			lux = ((4.2785 * CH0) - (1.9548 * CH1)) / ALS_GAIN[gain] / ALS_INT[integrationTime];
		}

		else if (ratio < 0.85)
		{
			lux = ((0.5926 * CH0) + (0.1185 * CH1)) / ALS_GAIN[gain] / ALS_INT[integrationTime];
		}

		else
			lux = 0;

    return lux;
}

/**
* @brief Helper function that checks if the temperature 'temp' is within a safe range for crops
* and prints an alert message accordingly.
* @param temp The temperature value to be checked
*/
void checkIfTemperatureIsOk(float temp)
{
  String alertMessage = "Temperature Alert: ";
  if (temp <= 19)
  {
    alertMessage += "The temperature is too low. Please take corrective action.";
  } else if (temp <= 20)
  {
    alertMessage += "The temperature is almost too low for your crops.";
  } else if (temp >= 33)
  {
    alertMessage += "The temperature is too high. Please take corrective action.";
  } else if (temp >= 32)
  {
    alertMessage += "The temperature is almost too high for your crops.";
  }
  Serial.println(alertMessage);
}

/**
* @brief Helper function that checks if the humidity 'humidity' is within a safe range for crops
* and prints an alert message accordingly.
* @param humidity The humidity value to be checked
*/
void checkIfHumidityIsOk(float humidity)
{
  String alertMessage = "Humidity Alert: ";
  if (humidity <= 60)
  {
    alertMessage += "The humidity is too low. Please take corrective action.";
  } else if (humidity <= 62)
  {
    alertMessage += "The humidity is almost too low for your crops.";
  } else if (humidity >= 85)
  {
    alertMessage += "The humidity is too high. Please take corrective action.";
  } else if (humidity >= 83)
  {
    alertMessage += "The humidity is almost too high for your crops.";
  }
  Serial.println(alertMessage);
}

// --------------------------------------------------------------------------------------------------------
//! Info about crops and what to look out for
// Cayenne Pineapples: direct sunlight for 6-8 hours
// Goldfinger Bananas: indirect sunlight for 8 to 10 hours
// 1. Checking if light is on
// 2. Checking if light is bright enough or too dim
// 3. Checking if direct sunlight has been on for 8 hours --> notifying user to dim the light for two hours
// 4. Checking if the light is too bright or too dimmed after dimming
// 5. Checking if light has been turned off completely after 10 hours
// --------------------------------------------------------------------------------------------------------

/**
* @brief Helper function for checking if the pineapple light is at an appropriate level.
* @param CH0 Reference to int where visible+IR data will be stored
* @param CH1 Reference to int where IR-only data will be stored
*/
void checkIfPineappleLightIsOk(uint16_t CH0, uint16_t CH1)
{
  String alertMessage = "Pineapple Light Alert: ";
  double lux = getLux(CH0, CH1);

  if (lux > 10) // Light is present (with some margin), indicating that a new day has begun: timer should start
  {
    lightStartTime = millis();
    lightOn = true;
    if (lux <= 32000)
    {
      alertMessage += "The light is too dim for your Cayenne Pineapples. Please take corrective action.";
    } else if (lux >= 100000)
    {
      alertMessage += "The light is too bright for your Cayenne Pineapples. Please take corrective action.";
    }
  } else
  {
    if (lightOn && (millis() - lightStartTime >= 36000000)) // 10 hours in milliseconds
    {
      alertMessage += "The light has been on for 10 hours and should now be turned off for the day.";
    } else if (lightOn && (millis() - lightStartTime >= 28800000)) // 8 hours in milliseconds
    {
      alertMessage += "Direct sunlight has been on for 8 hours and should be dimmed for two hours before they're turned off for the day. Note that direct sunlight for more than 8 hours a day may damage your crops.";
      if(lux >= 25000)
      {
        alertMessage += "The light is too bright for your crops. Please take corrective action.";
      } else if (lux <= 10000)
      {
        alertMessage += "The light is too dim for your crops. Please take corrective action.";
      }
    }
  }
  Serial.println(alertMessage);
}

/**
* @brief Helper function for checking if the banana light is at an appropriate level.
* @param CH0 Reference to int where visible+IR data will be stored
* @param CH1 Reference to int where IR-only data will be stored
*/
void checkIfBananaLightIsOk(uint16_t CH0, uint16_t CH1)
{
  String alertMessage = "Banana Light Alert: ";
  double lux = getLux(CH0, CH1);

  if (lux > 10) // Light is present (with some margin), indicating that a new day has begun: timer should start
  {
    lightStartTime = millis();
    lightOn = true;
    if (lux <= 10000)
    {
      alertMessage += "The light is too dim for your Goldfinger Bananas. Please take corrective action.";
    } else if (lux >= 25000)
    {
      alertMessage += "The light is too bright for your Goldfinger Bananas. Please take corrective action.";
    } 
  } else
  {
    if (lightOn && (millis() - lightStartTime >= 36000000)) // 10 hours in milliseconds
    {
      alertMessage += "The light has been on for 10 hours and should now be turned off for the day.";
      lightOn = false;
    } else if (lightOn && (millis() - lightStartTime >= 28800000)) // 8 hours in milliseconds
    {
      alertMessage += "Direct sunlight has been on for 8 hours and should be dimmed for two hours before they're turned off for the day. Note that direct sunlight for more than 8 hours a day may damage your crops.";
      if(lux >= 1000)
      { 
        alertMessage += "The light is too bright for your crops. Please take corrective action.";
      } else if (lux <= 400)
      {
        alertMessage += "The light is too dim for your crops. Please take corrective action.";
      }
    }
  }
  Serial.println(alertMessage);
}



//!----------------------- UNDER CONSTRUCTION -----------------------

/**
 * @brief Sends temperature, humidity and lux data to a specified host and port via HTTP POST request.
 * @param host Host name or IP address to connect to
 * @param port Port number to connect to
 * @param temp The temperature value
 * @param hum The humidity value
 * @param lux The light value
*/
void sendGreenhouseData(const char * host, int port, float temp, float hum, float lux)
{
  Serial.println("Connecting to domain: " + String(host));

  // Use WiFiClient class to create TCP connections
  WiFiClient client;

  if (!client.connect(host, port))
  {
    Serial.println("connection failed");
    return;
  }

  //TODO Needs to be updated to objects.
  //TODO 1. One object contains temp, hum and lux
  //TODO 2. Important that the object in the dataToSend variable reflects the model
  //TODO 3. Add the :id to the url path so that objects can be sent to the right greenhouse,this way the solution can be scaled up (to at least three)

  Serial.println("Connected!\n");
  String dataToSend = "{\"temperature\":" + String(temp) + ",\"humidity\":" + String(hum) + ",\"light\":" + String(lux) + ",\"id\":\"" + id + "\"}";
  int dataStringLength = dataToSend.length();

  client.print((String)"POST /greenhouse HTTP/1.1\r\n" + //TODO 3. add the id of greenhouse
               "Host: " + String(host) + "\r\n" +
               "Content-Type: application/x-www-form-urlencoded\r\n" +
               "Content-Length: "+dataStringLength+"\r\n"+
               "Connection: close\r\n\r\n"+
               dataToSend);

  // If something goes wrong, we need a timeout
  unsigned long timeout = millis();
  while (client.available() == 0)
  {
    if (millis() - timeout > 5000) 
    {
      Serial.println(">>> Client Timeout !");
      client.stop();
      return;
    }
  }

  // Read all the lines of the reply from server and print them to Serial
  while (client.available()) 
  {
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }

  // When we are finished, we close the connection
  Serial.println("closing connection");
  client.stop();
}

//!----------------------- UNDER CONSTRUCTION -----------------------


/**
 * @brief Helper function that sends a push notification to a mobile device if the door has been open for 2 minutes,
 * including weather information obtained from the OpenWeatherMap API.
*/
void postAlert()
{
  if (!doorAlertSent )
  {
    if ((wiFiMulti.run() == WL_CONNECTED))
    {
      HTTPClient http;
 
      http.begin(WeatherMapAPIKey);
      int httpCode = http.GET();
 
      if (httpCode > 0)
      {
        if(httpCode == HTTP_CODE_OK)
        {
          String payload = http.getString();
          const size_t capacity = payload.length() * 2;
          DynamicJsonDocument doc(capacity);
          DeserializationError error = deserializeJson(doc, payload); 
          if(error)
          {
            Serial.println(F("deserializeJson() failed with code "));
            Serial.print(error.f_str());
          } else
          {
            String weatherMain = doc["weather"] [0] ["main"];
            String weatherDetail = doc["weather"] [0] ["description"];
            float mainTemp = doc["main"]["temp"];
            int mainHum = doc["main"]["humidity"];

            delay(10000);

            struct PushSaferInput input;
            input.message = "The door has been open for 2 minutes. Current temperature outside is: " + String(mainTemp - 273.15) + "°C" + ". Humidity: " + String(mainHum) + "%";
            input.title = "Door Alert";
            input.sound = "8";
            input.vibration = "1";
            input.icon = "1";
            input.iconcolor = "#00FF00";
            input.priority = "1";
            input.device = "62724";
            pushsafer.sendEvent(input);
            doorAlertSent = true;
          }
        }
      } else
      {
        Serial.printf("Error on HTTP GET: %s\n", http.errorToString(httpCode).c_str());
      }
        http.end();
    }
  }
}

// -------------------------------- HELPER FUNCTIONS END --------------------------------


// -------------------------------- MAIN FUNCTIONS --------------------------------

/**
 * @brief A struct with two float member variables for temperature and humidity values.
 * It can be used to group temperature and humidity data the same way a return statement would work.
*/
struct TempAndHumidity {
  float temperature;
  float humidity;
};

/**
* @brief Function that reads temperature and humidity data from the SHT31 sensor, 
* checks if they are within safe ranges for crops, and prints corresponding alert messages.
* It then returns a TempAndHumidity struct containing the temperature and humidity values.
* The struct has two float variables: temperature and humidity.
* @return A TempAndHumidity struct containing the temperature and humidity values
*/
TempAndHumidity readTemperatureAndHumidity() {
  float t = sht31.readTemperature();
  float h = sht31.readHumidity();
  TempAndHumidity values;
  values.temperature = t;
  values.humidity = h;

  if (!isnan(t)) {
    Serial.println("");
    Serial.println("Temp *C = " + String(t) + "\t\t");
    Serial.println("------------");
    checkIfTemperatureIsOk(t);
    Serial.println("------------");
    Serial.println("");
  } else { 
    Serial.println("Failed to read temperature");
  }

  if (!isnan(h)) {
    Serial.println("");
    Serial.println("Hum. % = " + String(h) + "\t\t");
    Serial.println("------------");
    checkIfHumidityIsOk(h);
    Serial.println("------------");
    Serial.println("");
  } else { 
    Serial.println("Failed to read humidity");
  }

  return values;
}

/**
 * @brief Function that reads data from a light sensor and calculates the light intensity in lux using the "getLux()" function.
 * If new data is available, it reads both the visible and infrared channels from the sensor and checks if the light levels are okay for pineapple and banana plants using "checkIfPineappleLightIsOk()" and "checkIfBananaLightIsOk()" functions respectively.
 * Finally, it prints the lux value and results of the checks to the serial monitor.
*/
double readLight()
{
  uint16_t visible_plus_ir, infrared;
  double lux = getLux(visible_plus_ir, infrared);

  if (ltr.newDataAvailable())
  {
    bool valid = ltr.readBothChannels(visible_plus_ir, infrared);
    if (valid)
    {
      Serial.println("Lux: " + String(lux));
      Serial.println("------------");
      checkIfPineappleLightIsOk(visible_plus_ir, infrared);
      checkIfBananaLightIsOk(visible_plus_ir, infrared);
      Serial.println("------------");
      Serial.println("");
    }
  }
  return lux;
}

/**
 * @brief Function that reads the state of a magnetic door sensor,
 * and if the door has been open for longer than a set time, sends an alert.
*/
void readMagnet()
{
  int doorTimer = millis();
  magnetNearSensor = digitalRead(HALL_SENSOR_PIN);
  digitalWrite(LED_BUILTIN, magnetNearSensor);

  if(magnetNearSensor && doorTimer >= 120000){ 
    Serial.println("No magnet near sensor for 2 minutes. Sending alert.");
    postAlert();
    // Resetting the door timer
    doorTimer = 0;
  } else {
    Serial.println("Magnet near sensor. Nothing to worry about.");
  }
}

// -------------------------------- MAIN FUNCTIONS END --------------------------------


// -------------------------------- LOOP --------------------------------

void loop()
{

// Checking internet connection
if ((millis() - lastTime) > timerDelay)
  {
    if(WiFi.status() != WL_CONNECTED)
    {
      Serial.print("Attempting to connect");
      while(WiFi.status() != WL_CONNECTED)
      {
        WiFi.begin(ssid, password); 
        delay(5000);
      } 
      Serial.println("\nConnected.");
    }

    // Reading temperature, humidity, light and magnet sensor
    readTemperatureAndHumidity();
    readLight();
    readMagnet();

    if (loopCnt >= 30)
    {
      enableHeater = !enableHeater;
      sht31.heater(enableHeater);
      Serial.print("Heater Enabled State: ");
      if (sht31.isHeaterEnabled())
      {
        Serial.println("ENABLED");
      } else
      {
        Serial.println("DISABLED");
      }
      loopCnt = 0;
    }
    loopCnt++;

    // Getting temp and humidity values
    TempAndHumidity values = readTemperatureAndHumidity();
    float temperature = values.temperature;
    float humidity = values.humidity;
    double lux = readLight();
    int luxToInt = round(lux);

    // Passing values to fields in ThingSpeak
    ThingSpeak.setField(1, temperature);
    ThingSpeak.setField(2, humidity);
    ThingSpeak.setField(3, luxToInt);

    // Writing fields to channel with api key
    int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

    if(x == 200)
    {
      Serial.println("Channel update successful.");
    }
    else
    {
      Serial.println("Problem updating channel. HTTP error code " + String(x));
    }
    lastTime = millis();
  }
}

// -------------------------------- LOOP END --------------------------------