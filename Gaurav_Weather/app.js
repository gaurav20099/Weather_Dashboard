// ====================================================
//  Weather Dashboard — Vanilla JS + Open-Meteo API
//  No API key required. Free & open source.
// ====================================================

// ---------- State ----------
let unit = 'C';
let selectedCity = null;
let debounceTimer = null;

// ---------- DOM refs ----------
const searchInput     = document.getElementById('search-input');
const searchClear     = document.getElementById('search-clear');
const searchResults   = document.getElementById('search-results');
const errorBanner     = document.getElementById('error-banner');
const errorText       = document.getElementById('error-text');
const loadingEl       = document.getElementById('loading');
const weatherContent  = document.getElementById('weather-content');
const btnC            = document.getElementById('btn-c');
const btnF            = document.getElementById('btn-f');

// ---------- Weather code mapping ----------
// Returns { label, iconClass, svgPath }
const WEATHER_CODES = {
  0:   { label: 'Clear Sky',            iconClass: 'icon-clear',  svg: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>' },
  1:   { label: 'Mainly Clear',          iconClass: 'icon-clear',  svg: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M16 17a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/>' },
  2:   { label: 'Partly Cloudy',         iconClass: 'icon-cloud',  svg: '<path d="M16 17a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><circle cx="8" cy="8" r="3"/>' },
  3:   { label: 'Overcast',              iconClass: 'icon-cloud',  svg: '<path d="M16 17a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/>' },
  45:  { label: 'Fog',                  iconClass: 'icon-fog',    svg: '<path d="M3 10h18M3 14h18M3 18h18"/>' },
  48:  { label: 'Rime Fog',              iconClass: 'icon-fog',    svg: '<path d="M3 10h18M3 14h18M3 18h18"/>' },
  51:  { label: 'Light Drizzle',        iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  53:  { label: 'Drizzle',              iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  55:  { label: 'Heavy Drizzle',        iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  56:  { label: 'Freezing Drizzle',      iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  57:  { label: 'Freezing Drizzle',      iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  61:  { label: 'Light Rain',           iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  63:  { label: 'Rain',                 iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  65:  { label: 'Heavy Rain',            iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  66:  { label: 'Freezing Rain',         iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  67:  { label: 'Freezing Rain',        iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  71:  { label: 'Light Snow',           iconClass: 'icon-snow',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18v3M8.5 19.5l-1 1M7.5 19.5l1 1M12 18v3M12.5 19.5l-1 1M11.5 19.5l1 1M16 18v3M16.5 19.5l-1 1M15.5 19.5l1 1"/>' },
  73:  { label: 'Snow',                 iconClass: 'icon-snow',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18v3M8.5 19.5l-1 1M7.5 19.5l1 1M12 18v3M12.5 19.5l-1 1M11.5 19.5l1 1M16 18v3M16.5 19.5l-1 1M15.5 19.5l1 1"/>' },
  75:  { label: 'Heavy Snow',            iconClass: 'icon-snow',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18v3M8.5 19.5l-1 1M7.5 19.5l1 1M12 18v3M12.5 19.5l-1 1M11.5 19.5l1 1M16 18v3M16.5 19.5l-1 1M15.5 19.5l1 1"/>' },
  77:  { label: 'Snow Grains',          iconClass: 'icon-snow',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18v3M8.5 19.5l-1 1M7.5 19.5l1 1M12 18v3M12.5 19.5l-1 1M11.5 19.5l1 1M16 18v3M16.5 19.5l-1 1M15.5 19.5l1 1"/>' },
  80:  { label: 'Rain Showers',         iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  81:  { label: 'Rain Showers',         iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  82:  { label: 'Heavy Rain Showers',   iconClass: 'icon-rain',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>' },
  85:  { label: 'Snow Showers',         iconClass: 'icon-snow',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18v3M12 18v3M16 18v3"/>' },
  86:  { label: 'Snow Showers',         iconClass: 'icon-snow',   svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M8 18v3M12 18v3M16 18v3"/>' },
  95:  { label: 'Thunderstorm',         iconClass: 'icon-storm',  svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M13 14l-3 5h4l-3 5"/>' },
  96:  { label: 'Thunderstorm w/ Hail', iconClass: 'icon-storm',  svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M13 14l-3 5h4l-3 5"/>' },
  99:  { label: 'Thunderstorm w/ Hail', iconClass: 'icon-storm',  svg: '<path d="M16 14a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/><path d="M13 14l-3 5h4l-3 5"/>' },
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { label: 'Unknown', iconClass: 'icon-cloud', svg: '<path d="M16 17a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5"/>' };
}

function makeIcon(code, sizeClass) {
  const info = getWeatherInfo(code);
  return `<svg class="${sizeClass} ${info.iconClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${info.svg}</svg>`;
}

// ---------- API ----------
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function geocodeCity(query) {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to search city');
  const data = await res.json();
  return data.results || [];
}

async function fetchWeather(lat, lon, tempUnit) {
  const tempU = tempUnit === 'F' ? 'fahrenheit' : 'celsius';
  const windU = tempUnit === 'F' ? 'mph' : 'ms';

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,pressure_msl,visibility,is_day',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: tempU,
    wind_speed_unit: windU,
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  return res.json();
}

// ---------- Formatting ----------
function formatHour(iso, tz) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true, timeZone: tz }).format(new Date(iso));
}

function formatTime(iso, tz) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date(iso));
}

function formatDayLabel(dateStr, tz, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: tz }).format(new Date(dateStr));
}

// ---------- Rendering ----------
function renderWeather(data, city, tempUnit) {
  const tz = data.timezone || 'UTC';
  const cur = data.current;
  const info = getWeatherInfo(cur.weather_code);
  const windU = tempUnit === 'F' ? 'mph' : 'm/s';

  // Build hourly (next 7 hours from current time)
  const nowIdx = data.hourly.time.findIndex(t => t >= cur.time);
  const startIdx = nowIdx === -1 ? 0 : nowIdx;
  const hourlyItems = [];
  for (let i = startIdx; i < Math.min(startIdx + 7, data.hourly.time.length); i++) {
    const hInfo = getWeatherInfo(data.hourly.weather_code[i]);
    hourlyItems.push(`
      <div class="hourly-item">
        <p class="hourly-time">${formatHour(data.hourly.time[i], tz)}</p>
        ${makeIcon(data.hourly.weather_code[i], 'hourly-icon')}
        <p class="hourly-temp">${Math.round(data.hourly.temperature_2m[i])}°</p>
        <p class="hourly-precip">${data.hourly.precipitation_probability[i] ?? 0}%</p>
      </div>
    `);
  }

  // Build 5-day forecast
  const forecastRows = data.daily.time.map((date, i) => {
    const dInfo = getWeatherInfo(data.daily.weather_code[i]);
    return `
      <div class="forecast-row">
        <div class="forecast-info">
          <p class="forecast-day">${formatDayLabel(date, tz, i)}</p>
          <p class="forecast-cond">${dInfo.label}</p>
        </div>
        ${makeIcon(data.daily.weather_code[i], 'forecast-icon')}
        <div class="forecast-temps">
          <span class="forecast-high">${Math.round(data.daily.temperature_2m_max[i])}°</span>
          <span class="forecast-low">${Math.round(data.daily.temperature_2m_min[i])}°</span>
        </div>
      </div>
    `;
  }).join('');

  const isDay = cur.is_day === 1;
  const glowClass = isDay ? 'sun-glow' : '';

  weatherContent.innerHTML = `
    <!-- Main grid -->
    <div class="main-grid">
      <!-- Current weather -->
      <div class="card current-card">
        <div class="glow"></div>
        <div class="current-top">
          <div>
            <p class="current-label">Current Weather</p>
            <h2 class="current-city">${city.name}, ${city.country}</h2>
            <p class="current-condition">${info.label}</p>
          </div>
          <div class="${glowClass}">${makeIcon(cur.weather_code, 'current-icon')}</div>
        </div>
        <div class="current-temp">
          <span class="temp-value">${Math.round(cur.temperature_2m)}</span>
          <span class="temp-unit">°${tempUnit}</span>
        </div>
        <p class="current-feels">
          Feels like <span class="hl">${Math.round(cur.apparent_temperature)}°</span> &nbsp;&nbsp;
          H: <span class="hl">${Math.round(data.daily.temperature_2m_max[0])}°</span> &nbsp;&nbsp;
          L: <span class="hl">${Math.round(data.daily.temperature_2m_min[0])}°</span>
        </p>
      </div>

      <!-- 5-Day Forecast -->
      <div class="card forecast-card">
        <h3 class="forecast-title">5-Day Forecast</h3>
        <div class="forecast-list">${forecastRows}</div>
      </div>
    </div>

    <!-- Hourly Forecast -->
    <div class="card hourly-card">
      <h3 class="forecast-title">Hourly Forecast</h3>
      <div class="hourly-grid">${hourlyItems.join('')}</div>
    </div>

    <!-- Weather Details -->
    <div>
      <h3 class="details-title">Weather Details</h3>
      <div class="details-grid">
        <div class="detail-card">
          <div class="detail-header">
            <svg class="icon-rain" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            <span>Humidity</span>
          </div>
          <p class="detail-value">${Math.round(cur.relative_humidity_2m)}<span class="detail-unit">%</span></p>
        </div>
        <div class="detail-card">
          <div class="detail-header">
            <svg style="color:#2dd4bf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
            <span>Wind Speed</span>
          </div>
          <p class="detail-value">${Math.round(cur.wind_speed_10m)} <span class="detail-unit">${windU}</span></p>
        </div>
        <div class="detail-card">
          <div class="detail-header">
            <svg style="color:#fb923c" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8M12 18v4M4.93 4.93l5.66 5.66M13.41 13.41l5.66 5.66M2 12h8M18 12h4M4.93 19.07l5.66-5.66M13.41 10.59l5.66-5.66"/></svg>
            <span>Pressure</span>
          </div>
          <p class="detail-value">${Math.round(cur.pressure_msl)} <span class="detail-unit">hPa</span></p>
        </div>
        <div class="detail-card">
          <div class="detail-header">
            <svg style="color:#c084fc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Visibility</span>
          </div>
          <p class="detail-value">${(cur.visibility / 1000).toFixed(1)} <span class="detail-unit">km</span></p>
        </div>
        <div class="detail-card">
          <div class="detail-header">
            <svg style="color:#fbbf24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4-4 4 4"/></svg>
            <span>Sunrise</span>
          </div>
          <p class="detail-value">${formatTime(data.daily.sunrise[0], tz)}</p>
        </div>
        <div class="detail-card">
          <div class="detail-header">
            <svg style="color:#f87171" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4 4 4-4"/></svg>
            <span>Sunset</span>
          </div>
          <p class="detail-value">${formatTime(data.daily.sunset[0], tz)}</p>
        </div>
      </div>
    </div>
  `;
}

// ---------- Actions ----------
async function selectCity(city) {
  selectedCity = city;
  searchInput.value = '';
  searchClear.style.display = 'none';
  searchResults.classList.remove('show');
  searchResults.innerHTML = '';

  loadingEl.classList.remove('hidden');
  weatherContent.innerHTML = '';
  errorBanner.classList.add('hidden');

  try {
    const data = await fetchWeather(city.latitude, city.longitude, unit);
    loadingEl.classList.add('hidden');
    renderWeather(data, city, unit);
  } catch (err) {
    loadingEl.classList.add('hidden');
    errorText.textContent = 'Failed to load weather data. Please try again.';
    errorBanner.classList.remove('hidden');
  }
}

async function refetchUnit() {
  if (!selectedCity) return;
  loadingEl.classList.remove('hidden');
  weatherContent.innerHTML = '';
  try {
    const data = await fetchWeather(selectedCity.latitude, selectedCity.longitude, unit);
    loadingEl.classList.add('hidden');
    renderWeather(data, selectedCity, unit);
  } catch {
    loadingEl.classList.add('hidden');
  }
}

// ---------- Event listeners ----------

// Search input with debounce
searchInput.addEventListener('input', (e) => {
  const val = e.target.value.trim();
  searchClear.style.display = val ? 'flex' : 'none';

  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val) {
    searchResults.classList.remove('show');
    searchResults.innerHTML = '';
    return;
  }
  debounceTimer = setTimeout(async () => {
    try {
      const results = await geocodeCity(val);
      if (results.length === 0) {
        searchResults.classList.remove('show');
        searchResults.innerHTML = '';
        return;
      }
      searchResults.innerHTML = results.map((r) => `
        <button class="search-result-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}" data-country="${r.country || ''}" data-tz="${r.timezone || ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          <div>
            <p class="city-name">${r.name}</p>
            <p class="city-region">${[r.admin1, r.country].filter(Boolean).join(', ')}</p>
          </div>
        </button>
      `).join('');
      searchResults.classList.add('show');

      // Attach click handlers
      searchResults.querySelectorAll('.search-result-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectCity({
            name: btn.dataset.name,
            country: btn.dataset.country,
            latitude: parseFloat(btn.dataset.lat),
            longitude: parseFloat(btn.dataset.lon),
            timezone: btn.dataset.tz,
          });
        });
      });
    } catch {
      searchResults.classList.remove('show');
    }
  }, 400);
});

// Clear search
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.style.display = 'none';
  searchResults.classList.remove('show');
  searchResults.innerHTML = '';
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) {
    searchResults.classList.remove('show');
  }
});

// Unit toggle
btnC.addEventListener('click', () => {
  if (unit === 'C') return;
  unit = 'C';
  btnC.classList.add('active');
  btnF.classList.remove('active');
  refetchUnit();
});

btnF.addEventListener('click', () => {
  if (unit === 'F') return;
  unit = 'F';
  btnF.classList.add('active');
  btnC.classList.remove('active');
  refetchUnit();
});

// ---------- Init: load Paris by default ----------
selectCity({
  name: 'Paris',
  country: 'France',
  latitude: 48.8534,
  longitude: 2.3488,
  timezone: 'Europe/Paris',
});
