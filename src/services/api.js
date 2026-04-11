// ═══════════════════════════════════════════════════════
//  MomCare AI — Frontend API Service
//  All backend calls in one place
// ═══════════════════════════════════════════════════════

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("momcare_token");

// Fetch wrapper with auth header
async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };
  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }
  const res  = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

// ── AUTH ──────────────────────────────────
export const authAPI = {
  register: (userData) => request("/auth/register", { method: "POST", body: userData }),
  login:    (creds)    => request("/auth/login",    { method: "POST", body: creds }),
  getMe:    ()         => request("/auth/me"),
  update:   (data)     => request("/auth/update",   { method: "PUT",  body: data }),
  changePassword: (d)  => request("/auth/changepassword", { method: "PUT", body: d }),
};

// ── WATER ─────────────────────────────────
export const waterAPI = {
  getToday:  (date)      => request(`/water?date=${date}`),
  getHistory:()          => request("/water/history"),
  save:      (data)      => request("/water", { method: "POST", body: data }),
};

// ── EXERCISE ──────────────────────────────
export const exerciseAPI = {
  getToday:  (date)      => request(`/exercise?date=${date}`),
  getHistory:()          => request("/exercise/history"),
  logExercise:(data)     => request("/exercise/log", { method: "POST", body: data }),
};

// ── APPOINTMENTS ──────────────────────────
export const appointmentsAPI = {
  getAll:    ()          => request("/appointments"),
  create:    (data)      => request("/appointments",     { method: "POST",   body: data }),
  update:    (id, data)  => request(`/appointments/${id}`, { method: "PUT",  body: data }),
  delete:    (id)        => request(`/appointments/${id}`, { method: "DELETE" }),
};

// ── EMBRYO ────────────────────────────────
export const embryoAPI = {
  getMonth:  (month)     => request(`/embryo/month/${month}`),
  getAll:    ()          => request("/embryo/all"),
};

// ── PREDICTOR ─────────────────────────────
export const predictAPI = {
  predict:   (data)      => request("/predict",          { method: "POST",  body: data }),
  getHistory:()          => request("/predict/history"),
};

// ── EMERGENCY ─────────────────────────────
export const emergencyAPI = {
  trigger:   (location)  => request("/emergency/trigger", { method: "POST", body: location }),
  resolve:   (id)        => request(`/emergency/resolve/${id}`, { method: "POST" }),
  getHistory:()          => request("/emergency/history"),
};

// ── DASHBOARD ─────────────────────────────
export const dashboardAPI = {
  getStats:  ()          => request("/dashboard"),
};
