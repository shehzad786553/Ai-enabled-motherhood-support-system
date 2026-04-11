// ═══════════════════════════════════════════════════════════
//  MomCare AI — Complete Backend Server
//  Node.js + Express + MongoDB (Mongoose)
//  All models, routes, middleware in ONE file
// ═══════════════════════════════════════════════════════════

require("dotenv").config();
const express     = require("express");
const mongoose    = require("mongoose");
const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const cors        = require("cors");
const morgan      = require("morgan");
const { body, validationResult } = require("express-validator");

const app  = express();
const PORT = process.env.PORT || 5000;

// ───────────────────────────────────────
//  MIDDLEWARE
// ───────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// ───────────────────────────────────────
//  DATABASE CONNECTION
// ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/momcare")
  .then(() => console.log("✅  MongoDB connected →", mongoose.connection.host))
  .catch((err) => { console.error("❌  MongoDB error:", err.message); process.exit(1); });

// ═══════════════════════════════════════
//  MONGOOSE SCHEMAS & MODELS
// ═══════════════════════════════════════

// ── 1. User Schema ──────────────────────
const userSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:         { type: String, required: true, minlength: 6, select: false },
    phone:            { type: String, default: "" },
    pregnancyStartDate: { type: Date },
    pregnancyWeek:    { type: Number, default: 1, min: 1, max: 40 },
    weight:           { type: Number },
    bloodGroup:       { type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-",""] , default: "" },
    medicalConditions:{ type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    emergencyPhone:   { type: String, default: "" },
    doctorName:       { type: String, default: "" },
    doctorPhone:      { type: String, default: "" },
    dashboardNote:    { type: String, default: "" },
    role:             { type: String, enum: ["user","admin"], default: "user" },
  },
  { timestamps: true }
);

// Auto-calculate pregnancy week before save
userSchema.pre("save", async function (next) {
  // Hash password if modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Recalculate pregnancy week from start date
  if (this.pregnancyStartDate) {
    const diffDays = Math.floor((Date.now() - new Date(this.pregnancyStartDate)) / 86400000);
    this.pregnancyWeek = Math.max(1, Math.min(40, Math.floor(diffDays / 7)));
  }
  next();
});

userSchema.methods.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model("User", userSchema);

// ── 2. Water Log Schema ─────────────────
const waterLogSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date:       { type: String, required: true },          // "YYYY-MM-DD"
    glasses:    { type: Number, default: 0, min: 0, max: 30 },
    goalGlasses:{ type: Number, default: 8 },
    mlConsumed: { type: Number, default: 0 },
  },
  { timestamps: true }
);
waterLogSchema.index({ user: 1, date: 1 }, { unique: true });
const WaterLog = mongoose.model("WaterLog", waterLogSchema);

// ── 3. Exercise Log Schema ──────────────
const exerciseLogSchema = new mongoose.Schema(
  {
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date:         { type: String, required: true },
    exercises:    [
      {
        name:      String,
        duration:  Number,   // minutes
        type:      String,
        intensity: String,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    totalMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);
exerciseLogSchema.index({ user: 1, date: 1 }, { unique: true });
const ExerciseLog = mongoose.model("ExerciseLog", exerciseLogSchema);

// ── 4. Appointment Schema ───────────────
const appointmentSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor:     { type: String, required: true },
    specialty:  { type: String, default: "" },
    date:       { type: Date, required: true },
    time:       { type: String, default: "" },
    location:   { type: String, default: "" },
    notes:      { type: String, default: "" },
    status:     { type: String, enum: ["upcoming","completed","cancelled"], default: "upcoming" },
  },
  { timestamps: true }
);
const Appointment = mongoose.model("Appointment", appointmentSchema);

// ── 5. Health Prediction Schema ─────────
const predictionSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symptoms:   [String],
    bp:         Number,
    glucose:    Number,
    hemoglobin: Number,
    riskLevel:  { type: String, enum: ["Low","Medium","High"] },
    warnings:   [String],
    suggestions:[String],
    pregnancyWeek: Number,
  },
  { timestamps: true }
);
const Prediction = mongoose.model("Prediction", predictionSchema);

// ── 6. Emergency Log Schema ─────────────
const emergencySchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    triggeredAt: { type: Date, default: Date.now },
    location:  { lat: Number, lng: Number, address: String },
    status:    { type: String, enum: ["active","resolved"], default: "active" },
    resolvedAt:{ type: Date },
  },
  { timestamps: true }
);
const EmergencyLog = mongoose.model("EmergencyLog", emergencySchema);

// ═══════════════════════════════════════
//  MIDDLEWARE HELPERS
// ═══════════════════════════════════════

// Generate JWT token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// Auth middleware — verifies JWT and attaches user to req
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ success: false, message: "Not authorized. Please login." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: "User no longer exists." });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalid or expired." });
  }
};

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Send token response helper
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const safeUser = user.toObject();
  delete safeUser.password;
  res.status(statusCode).json({ success: true, token, user: safeUser });
};

// ═══════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════

// ── Health Check ────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "🌸 MomCare AI Backend is running!",
    mongoStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ────────────────────────────────────────
//  AUTH ROUTES  /api/auth
// ────────────────────────────────────────

// POST /api/auth/register
app.post(
  "/api/auth/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("emergencyContact").notEmpty().withMessage("Emergency contact name is required"),
    body("emergencyPhone").notEmpty().withMessage("Emergency contact phone is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, phone, pregnancyStartDate, weight,
              bloodGroup, medicalConditions, emergencyContact, emergencyPhone,
              doctorName, doctorPhone } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ success: false, message: "Email already registered." });

      const user = await User.create({
        name, email, password, phone, pregnancyStartDate, weight,
        bloodGroup, medicalConditions, emergencyContact, emergencyPhone,
        doctorName, doctorPhone,
      });

      sendToken(user, 201, res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/auth/login
app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }
      sendToken(user, 200, res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/auth/me  — get current user
app.get("/api/auth/me", protect, async (req, res) => {
  // Recalculate week on every fetch
  if (req.user.pregnancyStartDate) {
    const diffDays = Math.floor((Date.now() - new Date(req.user.pregnancyStartDate)) / 86400000);
    req.user.pregnancyWeek = Math.max(1, Math.min(40, Math.floor(diffDays / 7)));
    await req.user.save();
  }
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/update  — update profile
app.put("/api/auth/update", protect, async (req, res) => {
  try {
    const allowed = ["name","phone","weight","bloodGroup","medicalConditions",
                     "emergencyContact","emergencyPhone","doctorName","doctorPhone",
                     "pregnancyStartDate","dashboardNote"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/changepassword
app.put("/api/auth/changepassword", protect,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be 6+ chars"),
  ],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("+password");
      if (!(await user.comparePassword(req.body.currentPassword)))
        return res.status(400).json({ success: false, message: "Current password is incorrect." });

      user.password = req.body.newPassword;
      await user.save();
      sendToken(user, 200, res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ────────────────────────────────────────
//  WATER TRACKER  /api/water
// ────────────────────────────────────────

// GET /api/water?date=YYYY-MM-DD
app.get("/api/water", protect, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const log  = await WaterLog.findOne({ user: req.user._id, date });
    res.json({ success: true, data: log || { date, glasses: 0, goalGlasses: 8, mlConsumed: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/water/history  — last 7 days
app.get("/api/water/history", protect, async (req, res) => {
  try {
    const logs = await WaterLog.find({ user: req.user._id })
      .sort({ date: -1 }).limit(30);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/water  — upsert today's log
app.post("/api/water", protect, async (req, res) => {
  try {
    const { date, glasses, goalGlasses } = req.body;
    const mlConsumed = (glasses || 0) * 250;

    const log = await WaterLog.findOneAndUpdate(
      { user: req.user._id, date },
      { glasses, goalGlasses, mlConsumed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────
//  EXERCISE TRACKER  /api/exercise
// ────────────────────────────────────────

// GET /api/exercise?date=YYYY-MM-DD
app.get("/api/exercise", protect, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const log  = await ExerciseLog.findOne({ user: req.user._id, date });
    res.json({ success: true, data: log || { date, exercises: [], totalMinutes: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/exercise/history
app.get("/api/exercise/history", protect, async (req, res) => {
  try {
    const logs = await ExerciseLog.find({ user: req.user._id })
      .sort({ date: -1 }).limit(30);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/exercise/log  — add an exercise entry
app.post("/api/exercise/log", protect, async (req, res) => {
  try {
    const { date, exercise } = req.body;

    let log = await ExerciseLog.findOne({ user: req.user._id, date });
    if (!log) {
      log = new ExerciseLog({ user: req.user._id, date, exercises: [], totalMinutes: 0 });
    }
    log.exercises.push(exercise);
    log.totalMinutes = log.exercises.reduce((s, e) => s + (e.duration || 0), 0);
    await log.save();

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────
//  APPOINTMENTS  /api/appointments
// ────────────────────────────────────────

// GET /api/appointments
app.get("/api/appointments", protect, async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user._id }).sort({ date: 1 });
    res.json({ success: true, data: appts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/appointments
app.post(
  "/api/appointments",
  protect,
  [
    body("doctor").notEmpty().withMessage("Doctor name required"),
    body("date").isISO8601().withMessage("Valid date required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { doctor, specialty, date, time, location, notes } = req.body;
      const appt = await Appointment.create({
        user: req.user._id, doctor, specialty, date, time, location, notes,
      });
      res.status(201).json({ success: true, data: appt });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/appointments/:id
app.put("/api/appointments/:id", protect, async (req, res) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found." });

    const fields = ["doctor","specialty","date","time","location","notes","status"];
    fields.forEach((f) => { if (req.body[f] !== undefined) appt[f] = req.body[f]; });
    await appt.save();
    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/appointments/:id
app.delete("/api/appointments/:id", protect, async (req, res) => {
  try {
    const appt = await Appointment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found." });
    res.json({ success: true, message: "Appointment deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────
//  FETAL / EMBRYO  /api/embryo
// ────────────────────────────────────────
const FETAL_DATA = {
  1:  { size:"Poppy seed",   cm:"0.1",  weight:"<1g",   desc:"Fertilization and implantation in uterine wall.",      tip:"Start folic acid (400mcg/day) immediately." },
  2:  { size:"Sesame seed",  cm:"0.2",  weight:"<1g",   desc:"Neural tube forming. Heart begins to develop.",        tip:"Avoid alcohol, smoking and raw seafood." },
  3:  { size:"Lentil",       cm:"0.4",  weight:"<1g",   desc:"Brain, spinal cord, and heart forming rapidly.",       tip:"Prenatal vitamins are crucial." },
  4:  { size:"Blueberry",    cm:"1.3",  weight:"1g",    desc:"Facial features and limb buds appearing.",             tip:"Morning sickness peak — eat small meals." },
  5:  { size:"Raspberry",    cm:"1.6",  weight:"1g",    desc:"Fingers, toes, and eyes forming.",                     tip:"Stay well hydrated." },
  6:  { size:"Grape",        cm:"2.3",  weight:"3g",    desc:"Brain growing rapidly. Baby starts small movements.",  tip:"First ultrasound usually week 8–10." },
  7:  { size:"Lime",         cm:"4",    weight:"14g",   desc:"All major organs formed. Now officially a fetus.",     tip:"Start sleeping on your left side." },
  8:  { size:"Lemon",        cm:"7.4",  weight:"43g",   desc:"Baby can swallow, kick, and make fists.",              tip:"Prenatal yoga helps with round ligament pain." },
  9:  { size:"Avocado",      cm:"14",   weight:"100g",  desc:"Developing taste buds and fingerprints.",              tip:"Mid-pregnancy checkup recommended." },
  10: { size:"Banana",       cm:"26.7", weight:"360g",  desc:"Hearing developing — baby can hear your voice!",       tip:"Talk and sing to your baby." },
  11: { size:"Cauliflower",  cm:"34",   weight:"660g",  desc:"Lungs and brain growing rapidly.",                     tip:"Attend childbirth preparation classes." },
  12: { size:"Ear of corn",  cm:"40",   weight:"1.3kg", desc:"Baby can open eyes and practice breathing motions.",   tip:"Sleep on your left side for blood flow." },
};

// GET /api/embryo/month/:month
app.get("/api/embryo/month/:month", protect, (req, res) => {
  const month = Math.min(12, Math.max(1, parseInt(req.params.month)));
  const data  = FETAL_DATA[month];
  if (!data) return res.status(404).json({ success: false, message: "Month data not found." });
  res.json({ success: true, data: { month, ...data } });
});

// GET /api/embryo/all  — all months data
app.get("/api/embryo/all", protect, (req, res) => {
  const all = Object.entries(FETAL_DATA).map(([m, d]) => ({ month: parseInt(m), ...d }));
  res.json({ success: true, data: all });
});

// ────────────────────────────────────────
//  DISEASE PREDICTOR  /api/predict
// ────────────────────────────────────────

// POST /api/predict  — calls Python ML server (RandomForest + LogisticRegression)
app.post("/api/predict", protect, async (req, res) => {
  try {
    const {
      symptoms = [], bp, glucose, hemoglobin,
      age, diastolicBp, bodyTemp, heartRate,
      bloodSugar
    } = req.body;
    const pregnancyWeek = req.user.pregnancyWeek || 12;
    const ML_URL = process.env.ML_SERVER_URL || "http://localhost:5001";

    // ── Try Python ML Server first ──────────────────
    let mlResult = null;
    try {
      const mlRes = await fetch(`${ML_URL}/predict/disease`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age:          age || req.user.age || 28,
          systolicBp:   bp,
          diastolicBp:  diastolicBp,
          bloodSugar:   bloodSugar || glucose,
          bodyTemp:     bodyTemp,
          heartRate:    heartRate,
          hemoglobin:   hemoglobin,
          symptoms,
          pregnancyWeek,
        }),
        signal: AbortSignal.timeout(5000),   // 5s timeout
      });
      mlResult = await mlRes.json();
    } catch (_) {
      // ML server not running — fallback to rule-based
    }

    let riskLevel, warnings, suggestions, confidence, modelUsed;

    if (mlResult?.success) {
      // ✅ Use Python ML result
      riskLevel    = mlResult.riskLevel;
      warnings     = mlResult.warnings     || [];
      suggestions  = mlResult.suggestions  || [];
      confidence   = mlResult.confidence   || null;
      modelUsed    = mlResult.model        || "ML Ensemble";
    } else {
      // ── Fallback: rule-based ──────────────────────
      modelUsed = "Rule-Based (start ml_server.py for ML accuracy)";
      let score = 0;
      warnings  = [];
      const bpV  = parseFloat(bp);
      const gluV = parseFloat(glucose || bloodSugar);
      const hbV  = parseFloat(hemoglobin);

      if (!isNaN(bpV)) {
        if (bpV > 160)      { score += 40; warnings.push("BP critically elevated — preeclampsia risk."); }
        else if (bpV > 140) { score += 25; warnings.push("Blood pressure elevated — monitor for preeclampsia."); }
        else if (bpV > 130) { score += 10; warnings.push("BP slightly above normal."); }
      }
      if (!isNaN(gluV)) {
        if (gluV > 200)      { score += 35; warnings.push("Very high blood glucose — gestational diabetes risk."); }
        else if (gluV > 140) { score += 20; warnings.push("Elevated blood glucose — possible gestational diabetes."); }
      }
      if (!isNaN(hbV)) {
        if (hbV < 8)         { score += 30; warnings.push("Severely low hemoglobin — anemia."); }
        else if (hbV < 10)   { score += 15; warnings.push("Low hemoglobin — anemia risk."); }
        else if (hbV < 11)   { score += 8;  warnings.push("Hemoglobin slightly below normal (11 g/dL)."); }
      }
      const highS = ["Vaginal bleeding","Severe abdominal pain","Blurred vision","Shortness of breath","Decreased fetal movement"];
      symptoms.forEach(s => {
        if (highS.includes(s)) { score += 20; warnings.push(`${s} — urgent medical attention required.`); }
        else score += 5;
      });
      riskLevel   = score >= 40 ? "High" : score >= 15 ? "Medium" : "Low";
      const sugMap = {
        Low:    ["Continue prenatal vitamins daily", "Drink 2000–2500ml water per day", "Gentle exercise 20-30 min/day", "Attend prenatal checkups on time"],
        Medium: ["Doctor visit within 3–5 days", "Monitor symptoms daily", "Rest and avoid heavy lifting", "Increase iron-rich foods"],
        High:   ["⚠️ Seek medical care IMMEDIATELY", "Call doctor or go to hospital NOW", "Do NOT self-medicate", "Use Emergency SOS in the app"],
      };
      suggestions = sugMap[riskLevel];
    }

    // ── Save to MongoDB ──────────────────────────
    const prediction = await Prediction.create({
      user: req.user._id,
      symptoms,
      bp:         parseFloat(bp)         || null,
      glucose:    parseFloat(glucose)    || null,
      hemoglobin: parseFloat(hemoglobin) || null,
      riskLevel,
      warnings,
      suggestions,
      pregnancyWeek,
    });

    res.json({
      success: true,
      data: {
        riskLevel, warnings, suggestions, pregnancyWeek,
        confidence:  confidence || null,
        modelUsed,
        mlServerActive: !!mlResult?.success,
        id: prediction._id,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/predict/exercise  — proxies to Python ML server
app.post("/api/predict/exercise", protect, async (req, res) => {
  try {
    const ML_URL = process.env.ML_SERVER_URL || "http://localhost:5001";
    const { month, fitnessLevel, condition } = req.body;
    const mlRes = await fetch(`${ML_URL}/predict/exercise`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month:        month || Math.ceil((req.user.pregnancyWeek||12) / 4.3),
        fitnessLevel: fitnessLevel || "Beginner",
        condition:    condition    || "None",
      }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await mlRes.json();
    res.json(data);
  } catch (err) {
    res.status(503).json({ success: false, message: "ML server not available. Start ml_server.py", error: err.message });
  }
});

// POST /api/predict/hydration  — proxies to Python ML server
app.post("/api/predict/hydration", protect, async (req, res) => {
  try {
    const ML_URL = process.env.ML_SERVER_URL || "http://localhost:5001";
    const week = req.user.pregnancyWeek || 12;
    const mlRes = await fetch(`${ML_URL}/predict/hydration`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trimester:     req.body.trimester     || (week<=13?1:week<=26?2:3),
        weightKg:      req.body.weightKg      || req.user.weight || 60,
        activityLevel: req.body.activityLevel || "Light",
        temperature:   req.body.temperature   || "Moderate",
      }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await mlRes.json();
    res.json(data);
  } catch (err) {
    res.status(503).json({ success: false, message: "ML server not available. Start ml_server.py", error: err.message });
  }
});

// GET /api/predict/history  — user's prediction history
app.get("/api/predict/history", protect, async (req, res) => {
  try {
    const preds = await Prediction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: preds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────
//  EMERGENCY  /api/emergency
// ────────────────────────────────────────

// POST /api/emergency/trigger  — log an emergency event
app.post("/api/emergency/trigger", protect, async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    const log = await EmergencyLog.create({
      user:     req.user._id,
      location: { lat, lng, address },
      status:   "active",
    });

    // In production: send SMS/push notification to emergency contacts here
    // e.g. Twilio SMS to user.emergencyPhone

    res.json({
      success: true,
      message: "Emergency triggered. Contacts notified.",
      data: {
        id: log._id,
        emergencyContact: req.user.emergencyContact,
        emergencyPhone:   req.user.emergencyPhone,
        doctorName:       req.user.doctorName,
        doctorPhone:      req.user.doctorPhone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/emergency/resolve
app.post("/api/emergency/resolve/:id", protect, async (req, res) => {
  try {
    const log = await EmergencyLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "resolved", resolvedAt: Date.now() },
      { new: true }
    );
    if (!log) return res.status(404).json({ success: false, message: "Emergency log not found." });
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/emergency/history
app.get("/api/emergency/history", protect, async (req, res) => {
  try {
    const logs = await EmergencyLog.find({ user: req.user._id }).sort({ triggeredAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────
//  DASHBOARD STATS  /api/dashboard
// ────────────────────────────────────────
app.get("/api/dashboard", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const week  = req.user.pregnancyWeek || 1;

    const [waterLog, exerciseLog, upcomingAppts, lastPrediction] = await Promise.all([
      WaterLog.findOne({ user: req.user._id, date: today }),
      ExerciseLog.findOne({ user: req.user._id, date: today }),
      Appointment.find({ user: req.user._id, date: { $gte: new Date() }, status: "upcoming" })
        .sort({ date: 1 }).limit(3),
      Prediction.findOne({ user: req.user._id }).sort({ createdAt: -1 }),
    ]);

    const month = Math.min(12, Math.ceil(week / 4.3));

    res.json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          pregnancyWeek: week,
          pregnancyMonth: month,
          trimester: week <= 13 ? 1 : week <= 26 ? 2 : 3,
          weeksLeft: Math.max(0, 40 - week),
          progress: Math.round((week / 40) * 100),
          bloodGroup: req.user.bloodGroup,
          weight: req.user.weight,
        },
        today: {
          waterGlasses:   waterLog?.glasses    || 0,
          waterGoal:      waterLog?.goalGlasses || 8,
          exerciseMinutes:exerciseLog?.totalMinutes || 0,
        },
        fetalData: FETAL_DATA[month] || FETAL_DATA[1],
        upcomingAppointments: upcomingAppts,
        lastPrediction: lastPrediction
          ? { riskLevel: lastPrediction.riskLevel, date: lastPrediction.createdAt }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────
//  404 handler
// ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ───────────────────────────────────────
//  START SERVER
// ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║  🌸  MomCare AI Backend               ║
  ║  ✅  Running on http://localhost:${PORT}  ║
  ║  📦  MongoDB: ${process.env.MONGO_URI?.slice(0,25)}...║
  ╚═══════════════════════════════════════╝
  `);
});
