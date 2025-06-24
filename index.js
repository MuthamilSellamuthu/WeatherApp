let apiKey = "0046de211638f00a23c43fce4a313ede";
let apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
let searchInput = document.getElementById("search_input");
let searchButton = document.getElementById("search_btn");
let darkMode = document.getElementById("darkMode_btn");
let lightMode = document.getElementById("lightMode_btn");

// Mode toggle
darkMode.addEventListener("click", () => {
  document.body.classList.add("dark-mode");
  darkMode.style.display = "none";
  lightMode.style.display = "inline-block";
});
lightMode.addEventListener("click", () => {
  document.body.classList.remove("dark-mode");
  lightMode.style.display = "none";
  darkMode.style.display = "inline-block";
});
lightMode.style.display = "none";

// Forecast
let weatherData = async (lat, lon) => {
  let forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  try {
    let response = await fetch(forecastApiUrl);
    if (!response.ok) throw new Error("Forecast data not available");
    let data = await response.json();

    let forecastContainer = document.getElementById("Future_data").querySelector(".row");
    forecastContainer.innerHTML = "";

    let dailyData = [];
    let datesAdded = new Set();
    let today = new Date().toLocaleDateString();

    for (let item of data.list) {
      let date = new Date(item.dt * 1000).toLocaleDateString();
      if (date !== today && !datesAdded.has(date)) {
        datesAdded.add(date);
        dailyData.push(item);
        if (dailyData.length === 5) break;
      }
    }

    dailyData.forEach((dayData) => {
      let temp = Math.round(dayData.main.temp);
      let description = dayData.weather[0].description.toLowerCase();
      let iconCode = dayData.weather[0].icon;
      let date = new Date(dayData.dt * 1000);
      let dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      let dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let tempDesc = "";
      if (description.includes("rain")) tempDesc = "It's raining ☔";
      else if (description.includes("thunder")) tempDesc = "Thunderstorm ⚡";
      else if (temp <= 0) tempDesc = "Freezing ❄️";
      else if (temp > 0 && temp <= 10) tempDesc = "Cold 🧥";
      else if (temp > 10 && temp <= 25) tempDesc = "Cool 🌤️";
      else if (temp > 25 && temp <= 30) tempDesc = "Warm 🌞";
      else if (temp > 30) tempDesc = "Hot 🔥";

      forecastContainer.innerHTML += `
        <div class="col-12 col-sm-6 col-md-4 col-lg-2 mb-4">
          <div class="card future-weather-card mx-auto forecast-card h-100" data-weather="${description}">
            <div class="card-body text-center">
              <h5 class="card-title">${dayName}</h5>
              <small class="text-muted">${dateStr}</small>
              <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon" class="weather-icon mb-2">
              <p class="card-text">${temp}°C</p>
              <p class="card-text">${description} (${tempDesc})</p>
            </div>
          </div>
        </div>`;
    });

    document.querySelectorAll('.forecast-card').forEach(card => {
      card.addEventListener('click', () => {
        const weather = card.dataset.weather.toLowerCase();
        changeVideoBackground(weather);
      });
    });

  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
};

// Main weather + AQI + Extra stats
async function check(city) {
  try {
    let response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) throw new Error("City not found");
    let data = await response.json();

    document.getElementById("weather_content").style.display = "block";

    document.querySelector('.card-title').innerHTML = data.name;
    let temperature_value = Math.round(data.main.temp);
    document.querySelector('.temp_display').innerHTML = `${temperature_value}°C`;

    let currentDesc = data.weather[0].description.toLowerCase();
    let tempDesc = "";
    if (currentDesc.includes("rain")) tempDesc = "rain";
    else if (currentDesc.includes("thunder")) tempDesc = "thunder";
    else if (temperature_value <= 0) tempDesc = "snow";
    else if (temperature_value > 0 && temperature_value <= 24) tempDesc = "cool";
    else if (temperature_value > 24 && temperature_value <= 30) tempDesc = "warm";
    else if (temperature_value > 30 && temperature_value <= 35) tempDesc = "hot";
    else if (temperature_value > 30) tempDesc = "sunny";
    else tempDesc = "Weather info";

    document.getElementById("weather_desc").textContent = `${currentDesc} (${tempDesc})`;

    let weatherImg = document.getElementById("weatherImg");
    let iconCode = data.weather[0].icon;
    weatherImg.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherImg.alt = data.weather[0].main;

    let degree_celsius = document.getElementById("degree_celsius");
    let fahrenheit = document.getElementById("fahreinheit");

    degree_celsius.onclick = () => {
      document.querySelector('.temp_display').innerHTML = `${temperature_value}°C`;
      degree_celsius.classList.add("active");
      fahrenheit.classList.remove("active");
    };

    fahrenheit.onclick = () => {
      let fahrenheitValue = (temperature_value * 9 / 5) + 32;
      document.querySelector('.temp_display').innerHTML = `${fahrenheitValue.toFixed(1)}°F`;
      fahrenheit.classList.add("active");
      degree_celsius.classList.remove("active");
    };

    degree_celsius.classList.add("active");
    fahrenheit.classList.remove("active");

    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("sunrise").textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    document.getElementById("sunset").textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    const airRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`);
    const airData = await airRes.json();
    const aqi = airData.list[0].main.aqi;
    const quality = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
    document.getElementById("air_quality").textContent = quality[aqi];

    changeVideoBackground(tempDesc); // ✅ Use tempDesc here
    changeBackground(temperature_value, currentDesc);

    await weatherData(data.coord.lat, data.coord.lon);

    document.getElementById("weather_content").style.display = "block";
    document.getElementById("show_forecast_link").style.display = "block";
    document.getElementById("forecast_section").style.display = "none";
    document.getElementById("toggleForecast").textContent = "🔗 Show 5-Day Forecast";

  } catch (error) {
    alert("Please enter a valid city name");
    console.error("Error:", error);
  }
}

// ✅ Background video function (corrected)
function changeVideoBackground(description) {
  const video = document.getElementById("bg-video");
  const source = video.querySelector("source");

  let videoSrc = "clear.mp4"; // default

  if (description.includes("rain")) videoSrc = "rain.mp4";
  else if (description.includes("thunder")) videoSrc = "thunder.mp4";
  else if (description.includes("warm")) videoSrc = "warm.mp4";
  else if (description.includes("snow") || description.includes("cool")) videoSrc = "cool.mp4";
  else if (description.includes("fog") || description.includes("mist")) videoSrc = "mist.mp4";
  else if (description.includes("hot") || description.includes("sunny")) videoSrc = "sunny.mp4";
  else if (description.includes("clear") || description.includes("warm")) videoSrc = "warm.mp4";

  source.src = videoSrc;
  video.load();
  video.play();
}

// Background color class logic
function changeBackground(temp, description) {
  const body = document.body;
  body.className = "";

  if (description.includes("rain") || description.includes("thunderstorm")) {
    body.classList.add("rainy");
  } else if (temp <= 10) {
    body.classList.add("cold");
  } else if (temp > 10 && temp <= 20) {
    body.classList.add("cool");
  } else if (temp > 20 && temp <= 25) {
    body.classList.add("warm");
  } else if (temp > 25) {
    body.classList.add("hot");
  } else {
    body.classList.add("default");
  }
}

// Search triggers
searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (city) check(city);
  else alert("Please enter a city name");
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchButton.click();
  }
});

// Forecast toggle link handler
document.getElementById("toggleForecast").addEventListener("click", function (e) {
  e.preventDefault();
  const forecast = document.getElementById("forecast_section");
  forecast.style.display = forecast.style.display === "none" ? "block" : "none";
  this.textContent = forecast.style.display === "block" ? "🔽 Hide 5-Day Forecast" : "🔗 Show 5-Day Forecast";
});
