/**
 * Uses the global fetch available in Node 18+ (no extra HTTP client dependency).
 * If WEATHER_API_KEY isn't set, calls resolve to null so the job can skip
 * gracefully instead of throwing.
 */
const getCurrentConditions = async (lat, lng) => {
  const apiKey = process.env.WEATHER_API_KEY;
  const baseUrl = process.env.WEATHER_API_BASE_URL;
  if (!apiKey || !baseUrl) return null;

  const url = `${baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("[WeatherService] fetch failed:", err.message);
    return null;
  }
};

/**
 * Very simple heuristic: heavy rainfall in the last hour crosses a threshold
 * -> treat as a flood risk signal worth surfacing as a WeatherAlert.
 * Replace with a real flood-forecast API for production use.
 */
const isFloodRisk = (conditions) => {
  const rainLastHour = conditions?.rain?.["1h"] || 0;
  return rainLastHour >= 20; // mm/hour
};

module.exports = { getCurrentConditions, isFloodRisk };
