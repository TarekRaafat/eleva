# Weather Dashboard

A weather app that fetches data from an API with search history and unit conversion.

## Features

- Search for any city
- Display current weather conditions
- Temperature unit toggle (Celsius/Fahrenheit)
- Recent search history with localStorage
- Loading and error states
- Responsive gradient UI

---

## Complete Code

```javascript
import Eleva from "eleva";

const app = new Eleva("WeatherApp");

app.component("WeatherDashboard", {
  setup({ signal }) {
    const city = signal("London");
    const weather = signal(null);
    const forecast = signal([]);
    const loading = signal(false);
    const error = signal(null);
    const unit = signal("C"); // C or F
    const recentSearches = signal(
      JSON.parse(localStorage.getItem("recent-cities") || "[]")
    );

    async function fetchWeather(cityName) {
      loading.value = true;
      error.value = null;

      try {
        // Using a free weather API (replace with your API key)
        const API_KEY = "your-api-key";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) throw new Error("City not found");

        const data = await response.json();
        weather.value = {
          city: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        };

        // Add to recent searches
        const searches = [cityName, ...recentSearches.value.filter(c => c !== cityName)].slice(0, 5);
        recentSearches.value = searches;
        localStorage.setItem("recent-cities", JSON.stringify(searches));

      } catch (err) {
        error.value = err.message;
        weather.value = null;
      } finally {
        loading.value = false;
      }
    }

    function handleSearch(e) {
      e.preventDefault();
      if (city.value.trim()) {
        fetchWeather(city.value.trim());
      }
    }

    function selectCity(cityName) {
      city.value = cityName;
      fetchWeather(cityName);
    }

    function toggleUnit() {
      unit.value = unit.value === "C" ? "F" : "C";
    }

    function convertTemp(celsius) {
      return unit.value === "C" ? celsius : (celsius * 9/5) + 32;
    }

    function formatTemp(celsius) {
      const temp = convertTemp(celsius);
      return `${Math.round(temp)}°${unit.value}`;
    }

    return {
      city, weather, loading, error, unit, recentSearches,
      handleSearch, selectCity, toggleUnit, formatTemp,
      onMount: () => fetchWeather(city.value)
    };
  },
  template: (ctx) => `
    <div class="weather-dashboard">
      <header>
        <h1>Weather Dashboard</h1>
        <button class="unit-toggle" @click="toggleUnit">
          °${ctx.unit.value === 'C' ? 'F' : 'C'}
        </button>
      </header>

      <form class="search-form" @submit="handleSearch">
        <input
          type="text"
          placeholder="Enter city name..."
          value="${ctx.city.value}"
          @input="(e) => city.value = e.target.value"
        />
        <button type="submit">Search</button>
      </form>

      ${ctx.recentSearches.value.length > 0 ? `
        <div class="recent-searches">
          ${ctx.recentSearches.value.map((c, index) => `
            <button key="${index}" @click="() => selectCity('${c}')">${c}</button>
          `).join('')}
        </div>
      ` : ''}

      ${ctx.loading.value ? `
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      ` : ctx.error.value ? `
        <div class="error-message">
          <p>${ctx.error.value}</p>
          <button @click="() => fetchWeather(city.value)">Try Again</button>
        </div>
      ` : ctx.weather.value ? `
        <div class="weather-card">
          <div class="weather-main">
            <img src="https://openweathermap.org/img/wn/${ctx.weather.value.icon}@2x.png" alt="Weather icon" />
            <div class="temp-display">
              <span class="temp">${ctx.formatTemp(ctx.weather.value.temp)}</span>
              <span class="feels-like">Feels like ${ctx.formatTemp(ctx.weather.value.feels_like)}</span>
            </div>
          </div>

          <h2>${ctx.weather.value.city}, ${ctx.weather.value.country}</h2>
          <p class="description">${ctx.weather.value.description}</p>

          <div class="weather-details">
            <div class="detail">
              <span class="label">Humidity</span>
              <span class="value">${ctx.weather.value.humidity}%</span>
            </div>
            <div class="detail">
              <span class="label">Wind</span>
              <span class="value">${ctx.weather.value.wind} m/s</span>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `,
  style: `
    .weather-dashboard { max-width: 500px; margin: 0 auto; padding: 20px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    header h1 { margin: 0; }
    .unit-toggle { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .search-form { display: flex; gap: 10px; margin-bottom: 15px; }
    .search-form input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 4px; }
    .search-form button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .recent-searches { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .recent-searches button { padding: 6px 12px; background: #f0f0f0; border: none; border-radius: 15px; cursor: pointer; font-size: 14px; }
    .loading { text-align: center; padding: 40px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f0f0f0; border-top-color: #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-message { text-align: center; padding: 30px; background: #f8d7da; border-radius: 8px; color: #721c24; }
    .weather-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 16px; text-align: center; }
    .weather-main { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; }
    .weather-main img { width: 100px; height: 100px; }
    .temp-display { text-align: left; }
    .temp { font-size: 3rem; font-weight: bold; display: block; }
    .feels-like { font-size: 0.9rem; opacity: 0.8; }
    .weather-card h2 { margin: 0 0 10px 0; }
    .description { text-transform: capitalize; margin-bottom: 20px; opacity: 0.9; }
    .weather-details { display: flex; justify-content: center; gap: 40px; }
    .detail { text-align: center; }
    .detail .label { display: block; font-size: 0.8rem; opacity: 0.8; }
    .detail .value { font-size: 1.2rem; font-weight: bold; }
  `
});

app.mount(document.getElementById("app"), "WeatherDashboard");
```

---

## Setup Instructions

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Replace `"your-api-key"` with your actual API key
3. Mount the component to your app container

---

## Features Demonstrated

- **Async data fetching** - API calls with fetch
- **Loading states** - Spinner during fetch
- **Error handling** - Display errors gracefully
- **LocalStorage** - Persist recent searches
- **Unit conversion** - Toggle between C/F
- **Form handling** - Search with submit
- **Conditional rendering** - Multiple UI states

---

[← Back to Apps](./index.md) | [Previous: Task Manager](./task-manager.md) | [Next: Simple Blog →](./blog.md)
