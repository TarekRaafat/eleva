---
title: Weather Dashboard App
description: Build a weather dashboard with Eleva.js. Fetch from weather APIs, search cities, toggle C°/F°, and save search history. Complete source code included.
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/examples/apps/weather-dashboard.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/examples/apps/weather-dashboard.html">
<meta property="og:title" content="Weather Dashboard App - Eleva.js">
<meta property="og:description" content="Build a weather dashboard with Eleva.js. Fetch from weather APIs, search cities, toggle C°/F°, and save search history. Complete source code included.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/examples/apps/weather-dashboard.html">
<meta name="twitter:title" content="Weather Dashboard App - Eleva.js">
<meta name="twitter:description" content="Build a weather dashboard with Eleva.js. Fetch from weather APIs, search cities, toggle C°/F°, and save search history. Complete source code included.">
<meta name="twitter:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Examples", "item": "https://elevajs.com/examples/" },
    { "@type": "ListItem", "position": 3, "name": "Apps", "item": "https://elevajs.com/examples/apps/" },
    { "@type": "ListItem", "position": 4, "name": "Weather Dashboard", "item": "https://elevajs.com/examples/apps/weather-dashboard.html" }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Eleva.js Weather Dashboard - API Integration Example",
  "description": "Weather application demonstrating real-time API data fetching, loading/error states, search functionality with history, unit conversion (Celsius/Fahrenheit), and localStorage persistence.",
  "programmingLanguage": {
    "@type": "ComputerLanguage",
    "name": "JavaScript"
  },
  "runtimePlatform": "Browser (ES6+)",
  "codeSampleType": "full solution",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat"
  },
  "isPartOf": {
    "@type": "SoftwareApplication",
    "name": "Eleva.js",
    "url": "https://elevajs.com"
  },
  "license": "https://opensource.org/licenses/MIT",
  "learningResourceType": "Complete Application",
  "teaches": ["API integration", "Async data fetching", "Loading states", "Error handling", "Search history", "localStorage"]
}
</script>

# Weather Dashboard

> **Example App** | Weather app with API fetching, search history, and unit conversion.

---

## Prerequisites

This example combines multiple patterns. Before studying it, you should understand:

- [Getting Started](../../getting-started.md) — Basic Eleva setup
- [Components](../../components.md) — Component structure
- [Async Data Loading](../patterns/async-data/index.md) — API fetching and loading states
- [Conditional Rendering](../patterns/conditional-rendering.md) — Loading/error UI states
- [Local Storage](../patterns/storage.md) — Persisting search history

---

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

## See Also

- [Async Data Fetching](../patterns/async-data/index.md) — Loading, error states, and pagination
- [Caching & Optimization](../patterns/async-data/caching.md) — Cache API responses
- [Resilience Patterns](../patterns/async-data/resilience.md) — Retries and error handling
- [Local Storage Patterns](../patterns/storage.md) — Persist search history

---

[← Back to Apps](./index.md) | [Previous: Task Manager](./task-manager.md) | [Next: Simple Blog →](./blog.md)
