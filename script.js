// API Configuration
const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your actual API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const locationInput = document.getElementById("location-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.getElementById("city-name");
const currentDate = document.getElementById("current-date");
const currentTemp = document.getElementById("current-temp");
const weatherIcon = document.getElementById("weather-icon");
const weatherDesc = document.getElementById("weather-desc");
const windSpeed = document.getElementById("wind-speed");
const humidity = document.getElementById("humidity");
const precipitation = document.getElementById("precipitation");
const forecastContainer = document.getElementById("forecast-container");
const themeSwitch = document.getElementById("theme-switch");

// Default location
const defaultLocation = "Postojna";

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  themeSwitch.checked = savedTheme === "dark";

  // Load weather for default location
  getWeatherData(defaultLocation);

  // Set current date
  updateCurrentDate();
});

// Theme switcher
themeSwitch.addEventListener("change", (e) => {
  const theme = e.target.checked ? "dark" : "light";
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});

// Search functionality
searchBtn.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (location) {
    getWeatherData(location);
  }
});

locationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const location = locationInput.value.trim();
    if (location) {
      getWeatherData(location);
    }
  }
});

// Fetch weather data from API
async function getWeatherData(location) {
  try {
    // Show loading state
    forecastContainer.innerHTML = '<div class="loading"></div>';

    // Fetch current weather
    const currentWeatherUrl = `${BASE_URL}/weather?q=${location}&units=metric&appid=${API_KEY}`;
    const currentResponse = await fetch(currentWeatherUrl);

    if (!currentResponse.ok) {
      throw new Error("Location not found");
    }

    const currentData = await currentResponse.json();

    // Fetch forecast
    const forecastUrl = `${BASE_URL}/forecast?q=${location}&units=metric&appid=${API_KEY}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Update UI
    updateCurrentWeather(currentData);
    updateForecast(forecastData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    forecastContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
  }
}

// Update current weather UI
function updateCurrentWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  currentTemp.textContent = Math.round(data.main.temp);
  weatherDesc.textContent = data.weather[0].description;
  windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  humidity.textContent = `${data.main.humidity}%`;
  precipitation.textContent = `${data.clouds.all}%`;

  // Set weather icon
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // Use Font Awesome icons based on weather condition
  const weatherCondition = data.weather[0].main.toLowerCase();
  weatherIcon.innerHTML = getWeatherIcon(weatherCondition);
}

// Update forecast UI
function updateForecast(data) {
  // Group forecast by day
  const dailyForecast = {};

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });

    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        condition: item.weather[0].main.toLowerCase(),
        date: day,
      };
    } else {
      if (item.main.temp_min < dailyForecast[day].minTemp) {
        dailyForecast[day].minTemp = item.main.temp_min;
      }
      if (item.main.temp_max > dailyForecast[day].maxTemp) {
        dailyForecast[day].maxTemp = item.main.temp_max;
      }
    }
  });

  // Convert to array and limit to 5 days
  const forecastArray = Object.values(dailyForecast).slice(0, 5);

  // Update UI
  forecastContainer.innerHTML = "";

  forecastArray.forEach((day) => {
    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast-card";

    forecastCard.innerHTML = `
            <span class="forecast-day">${day.date}</span>
            <div class="forecast-icon">${getWeatherIcon(day.condition)}</div>
            <div class="forecast-temp">
                <span class="high">${Math.round(day.maxTemp)}°</span>
                <span class="low">${Math.round(day.minTemp)}°</span>
            </div>
        `;

    forecastContainer.appendChild(forecastCard);
  });
}

// Get appropriate weather icon
function getWeatherIcon(condition) {
  const icons = {
    clear: '<i class="fas fa-sun"></i>',
    clouds: '<i class="fas fa-cloud"></i>',
    rain: '<i class="fas fa-cloud-rain"></i>',
    drizzle: '<i class="fas fa-cloud-rain"></i>',
    thunderstorm: '<i class="fas fa-bolt"></i>',
    snow: '<i class="far fa-snowflake"></i>',
    mist: '<i class="fas fa-smog"></i>',
    smoke: '<i class="fas fa-smog"></i>',
    haze: '<i class="fas fa-smog"></i>',
    dust: '<i class="fas fa-smog"></i>',
    fog: '<i class="fas fa-smog"></i>',
    sand: '<i class="fas fa-smog"></i>',
    ash: '<i class="fas fa-smog"></i>',
    squall: '<i class="fas fa-wind"></i>',
    tornado: '<i class="fas fa-wind"></i>',
  };

  return icons[condition] || '<i class="fas fa-question"></i>';
}

// Update current date display
function updateCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  currentDate.textContent = now.toLocaleDateString("en-US", options);
}
