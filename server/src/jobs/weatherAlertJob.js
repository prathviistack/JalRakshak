const cron = require("node-cron");
const WeatherAlert = require("../models/WeatherAlert");
const { getCurrentConditions, isFloodRisk } = require("../services/WeatherService");

// District centroids to poll. In production this would come from the District
// collection/model rather than being hardcoded - kept simple here since the
// project doesn't yet have a standalone District model.
const WATCHED_DISTRICTS = [
  { name: "Kamrup", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Dibrugarh", state: "Assam", lat: 27.4728, lng: 94.912 },
  { name: "Cachar", state: "Assam", lat: 24.8333, lng: 92.7789 },
  { name: "Barpeta", state: "Assam", lat: 26.3223, lng: 91.0058 },
  { name: "Nagaon", state: "Assam", lat: 26.3486, lng: 92.6839 },
];

/**
 * Checks each watched district's current weather and creates a WeatherAlert
 * (+ emits a `weatherAlert` socket event) when the flood-risk heuristic trips.
 * No-ops silently if WEATHER_API_KEY isn't configured.
 */
const runWeatherCheck = async (io) => {
  for (const district of WATCHED_DISTRICTS) {
    const conditions = await getCurrentConditions(district.lat, district.lng);
    if (!conditions) continue; // no API key configured, or the request failed

    if (isFloodRisk(conditions)) {
      const alert = await WeatherAlert.create({
        state: district.state,
        district: district.name,
        severity: "warning",
        headline: `Heavy rainfall detected in ${district.name}`,
        description: `Recent rainfall in ${district.name} has crossed the flood-risk threshold. Residents nearby should stay alert.`,
        source: "auto",
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      });
      if (io) io.emit("weatherAlert", alert);
      console.log(`[weatherAlertJob] Created alert for ${district.name}`);
    }
  }
};

/**
 * Schedules the weather check every 30 minutes. Call once from server.js
 * after Socket.io is initialized: startWeatherAlertJob(io)
 */
const startWeatherAlertJob = (io) => {
  cron.schedule("*/30 * * * *", () => {
    runWeatherCheck(io).catch((err) => console.error("[weatherAlertJob] failed:", err.message));
  });
  console.log("[weatherAlertJob] Scheduled (every 30 min). No-ops until WEATHER_API_KEY is set.");
};

module.exports = { startWeatherAlertJob, runWeatherCheck };
