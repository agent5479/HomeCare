// BeeMarshall - Weather Widget Module
// Fetches weather data based on average site GPS coordinates

// OpenWeatherMap API configuration
const WEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // User needs to add their key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Cache for weather data (5 minutes)
let weatherCache = {
    data: null,
    timestamp: null,
    maxAge: 5 * 60 * 1000 // 5 minutes
};

/**
 * Calculate average GPS coordinates from all sites
 */
function calculateAverageSiteCoordinates() {
    if (!sites || sites.length === 0) {
        return null;
    }
    
    let totalLat = 0;
    let totalLon = 0;
    let validCoords = 0;
    
    sites.forEach(site => {
        if (site.latitude && site.longitude) {
            totalLat += parseFloat(site.latitude);
            totalLon += parseFloat(site.longitude);
            validCoords++;
        }
    });
    
    if (validCoords === 0) {
        return null;
    }
    
    return {
        lat: totalLat / validCoords,
        lon: totalLon / validCoords
    };
}

/**
 * Fetch weather data from OpenWeatherMap API
 */
async function fetchWeatherData(coords) {
    try {
        // Check cache first
        if (weatherCache.data && weatherCache.timestamp) {
            const age = Date.now() - weatherCache.timestamp;
            if (age < weatherCache.maxAge) {
                Logger.log('📊 Using cached weather data');
                return weatherCache.data;
            }
        }
        
        // If no API key, show placeholder
        if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
            Logger.log('⚠️ Weather API key not configured');
            return null;
        }
        
        const url = `${WEATHER_API_URL}?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`;
        
        Logger.log('🌤️ Fetching weather data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the data
        weatherCache.data = data;
        weatherCache.timestamp = Date.now();
        
        Logger.log('✅ Weather data fetched successfully');
        return data;
        
    } catch (error) {
        Logger.error('❌ Error fetching weather data:', error);
        return null;
    }
}

/**
 * Format temperature for display
 */
function formatTemperature(temp) {
    return `${Math.round(temp)}°C`;
}

/**
 * Get weather icon class based on condition code
 */
function getWeatherIconClass(conditionCode) {
    const iconMap = {
        200: 'bi-cloud-lightning-rain', // Thunderstorm
        300: 'bi-cloud-drizzle', // Drizzle
        500: 'bi-cloud-rain', // Rain
        600: 'bi-cloud-snow', // Snow
        700: 'bi-cloud-fog', // Atmosphere
        800: 'bi-sun', // Clear
        801: 'bi-cloud-sun', // Few clouds
        802: 'bi-cloud', // Scattered clouds
        803: 'bi-clouds', // Broken clouds
        804: 'bi-clouds' // Overcast clouds
    };
    
    const code = parseInt(conditionCode / 100) * 100;
    return iconMap[code] || 'bi-cloud';
}

/**
 * Update weather widget on dashboard
 */
async function updateWeatherWidget() {
    try {
        const widget = document.getElementById('weatherWidget');
        if (!widget) {
            Logger.log('⚠️ Weather widget element not found');
            return;
        }
        
        // Calculate average coordinates
        const coords = calculateAverageSiteCoordinates();
        
        if (!coords) {
            widget.innerHTML = `
                <div class="weather-placeholder">
                    <i class="bi bi-cloud-slash text-muted"></i>
                    <p class="text-muted small mt-2">No site locations available</p>
                </div>
            `;
            return;
        }
        
        // Fetch weather data
        const weatherData = await fetchWeatherData(coords);
        
        if (!weatherData) {
            widget.innerHTML = `
                <div class="weather-placeholder">
                    <i class="bi bi-cloud-slash text-muted"></i>
                    <p class="text-muted small mt-2">Weather data unavailable</p>
                    <p class="text-muted small">Configure API key in weather.js</p>
                </div>
            `;
            return;
        }
        
        // Extract current and tomorrow's weather
        const currentWeather = weatherData.list[0];
        const tomorrowWeather = weatherData.list.find(item => {
            const itemDate = new Date(item.dt * 1000);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return itemDate.getDate() === tomorrow.getDate() && itemDate.getHours() === 12;
        }) || weatherData.list[8]; // Fallback to 24 hours ahead
        
        // Render weather widget
        widget.innerHTML = `
            <div class="weather-content">
                <div class="weather-header mb-3">
                    <h6 class="mb-0">
                        <i class="bi bi-geo-alt-fill text-primary"></i>
                        ${weatherData.city.name}, ${weatherData.city.country}
                    </h6>
                </div>
                
                <div class="weather-days">
                    <!-- Today -->
                    <div class="weather-day">
                        <div class="weather-day-header">
                            <strong>Today</strong>
                            <span class="text-muted small">${new Date(currentWeather.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div class="weather-day-content">
                            <div class="weather-icon">
                                <i class="bi ${getWeatherIconClass(currentWeather.weather[0].id)} text-warning" style="font-size: 2rem;"></i>
                            </div>
                            <div class="weather-details">
                                <div class="weather-temp">
                                    ${formatTemperature(currentWeather.main.temp)}
                                </div>
                                <div class="weather-desc small text-muted">
                                    ${currentWeather.weather[0].description}
                                </div>
                                <div class="weather-extra small mt-1">
                                    <span><i class="bi bi-droplet-half"></i> ${currentWeather.main.humidity}%</span>
                                    <span class="ms-2"><i class="bi bi-wind"></i> ${Math.round(currentWeather.wind.speed * 3.6)} km/h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tomorrow -->
                    <div class="weather-day">
                        <div class="weather-day-header">
                            <strong>Tomorrow</strong>
                            <span class="text-muted small">${new Date(tomorrowWeather.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div class="weather-day-content">
                            <div class="weather-icon">
                                <i class="bi ${getWeatherIconClass(tomorrowWeather.weather[0].id)} text-warning" style="font-size: 2rem;"></i>
                            </div>
                            <div class="weather-details">
                                <div class="weather-temp">
                                    ${formatTemperature(tomorrowWeather.main.temp)}
                                </div>
                                <div class="weather-desc small text-muted">
                                    ${tomorrowWeather.weather[0].description}
                                </div>
                                <div class="weather-extra small mt-1">
                                    <span><i class="bi bi-droplet-half"></i> ${tomorrowWeather.main.humidity}%</span>
                                    <span class="ms-2"><i class="bi bi-wind"></i> ${Math.round(tomorrowWeather.wind.speed * 3.6)} km/h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="weather-update-time text-center mt-3">
                    <small class="text-muted">
                        <i class="bi bi-clock"></i> Updated ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </small>
                </div>
            </div>
        `;
        
        Logger.log('✅ Weather widget updated');
        
    } catch (error) {
        Logger.error('❌ Error updating weather widget:', error);
        
        const widget = document.getElementById('weatherWidget');
        if (widget) {
            widget.innerHTML = `
                <div class="weather-placeholder">
                    <i class="bi bi-exclamation-triangle text-warning"></i>
                    <p class="text-muted small mt-2">Unable to load weather data</p>
                </div>
            `;
        }
    }
}

// Expose updateWeatherWidget globally
window.updateWeatherWidget = updateWeatherWidget;
