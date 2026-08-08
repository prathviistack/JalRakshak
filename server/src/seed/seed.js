/**
 * Seeds the database with demo data for Assam flood relief scenarios.
 * Run with: npm run seed  (from server/)
 *
 * The platform itself is region-agnostic (see README) - this file just
 * chooses Assam districts and coordinates for the demo.
 */
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const EmergencyRequest = require("../models/EmergencyRequest");
const Shelter = require("../models/Shelter");
const Resource = require("../models/Resource");

// A few real Assam districts with approximate town-center coordinates [lng, lat]
const ASSAM_DISTRICTS = [
  { name: "Kamrup", coords: [91.7362, 26.1445] },
  { name: "Dibrugarh", coords: [94.912, 27.4728] },
  { name: "Cachar", coords: [92.7789, 24.8333] },
  { name: "Barpeta", coords: [91.0058, 26.3223] },
  { name: "Nagaon", coords: [92.6839, 26.3486] },
  { name: "Morigaon", coords: [92.3436, 26.2527] },
];

const run = async () => {
  await connectDB();
  console.log("[seed] Clearing existing demo collections...");
  await Promise.all([
    User.deleteMany({}),
    EmergencyRequest.deleteMany({}),
    Shelter.deleteMany({}),
    Resource.deleteMany({}),
  ]);

  console.log("[seed] Creating users...");
  const admin = await User.create({
    name: "Admin User",
    email: "admin@jalrakshak.org",
    password: "password123",
    role: "admin",
    state: "Assam",
    district: "Kamrup",
  });

  const ngo = await User.create({
    name: "Relief Coordinator",
    email: "ngo@jalrakshak.org",
    password: "password123",
    role: "ngo",
    organizationName: "Assam Flood Relief Trust",
    state: "Assam",
    district: "Barpeta",
    verified: true,
  });

  const volunteer = await User.create({
    name: "Rahul Das",
    email: "volunteer@jalrakshak.org",
    password: "password123",
    role: "volunteer",
    state: "Assam",
    district: "Nagaon",
    skills: ["boat rescue", "first aid"],
    location: { type: "Point", coordinates: ASSAM_DISTRICTS[4].coords },
  });

  const victim = await User.create({
    name: "Priya Sharma",
    email: "victim@jalrakshak.org",
    password: "password123",
    role: "victim",
    state: "Assam",
    district: "Nagaon",
  });

  console.log("[seed] Creating shelters...");
  const shelters = await Shelter.insertMany(
    ASSAM_DISTRICTS.slice(0, 4).map((d, i) => ({
      name: `${d.name} Community Relief Camp`,
      managedBy: ngo._id,
      state: "Assam",
      district: d.name,
      address: `Near District Sports Complex, ${d.name}`,
      location: { type: "Point", coordinates: d.coords },
      capacity: 200 + i * 50,
      currentOccupancy: 40 + i * 30,
      facilities: ["medical", "food", "water"],
      contactPhone: "+91-9000000000",
    }))
  );

  console.log("[seed] Creating resources...");
  await Resource.insertMany([
    { providedBy: ngo._id, shelter: shelters[0]._id, name: "Drinking water (5L cans)", category: "water", quantity: 500, unit: "cans", state: "Assam", district: shelters[0].district },
    { providedBy: ngo._id, shelter: shelters[0]._id, name: "Dry ration kits", category: "food", quantity: 300, unit: "kits", state: "Assam", district: shelters[0].district },
    { providedBy: ngo._id, shelter: shelters[1]._id, name: "First-aid kits", category: "medical", quantity: 120, unit: "kits", state: "Assam", district: shelters[1].district },
    { providedBy: ngo._id, shelter: shelters[2]._id, name: "Blankets", category: "clothing", quantity: 250, unit: "units", state: "Assam", district: shelters[2].district },
  ]);

  console.log("[seed] Creating sample emergency requests...");
  await EmergencyRequest.insertMany([
    {
      victim: victim._id,
      type: "rescue",
      urgency: "critical",
      status: "pending",
      description: "Water entering ground floor, family of 4 stranded including a toddler.",
      numberOfPeople: 4,
      state: "Assam",
      district: "Nagaon",
      address: "Near Kolong River bridge",
      location: { type: "Point", coordinates: ASSAM_DISTRICTS[4].coords },
    },
    {
      victim: victim._id,
      type: "medical",
      urgency: "high",
      status: "accepted",
      volunteer: volunteer._id,
      acceptedAt: new Date(),
      description: "Elderly relative needs insulin, ran out due to flooding blocking pharmacy access.",
      numberOfPeople: 1,
      state: "Assam",
      district: "Nagaon",
      location: { type: "Point", coordinates: ASSAM_DISTRICTS[4].coords },
    },
  ]);

  console.log("[seed] Done. Demo accounts (password: password123):");
  console.log(`  admin:     ${admin.email}`);
  console.log(`  ngo:       ${ngo.email}`);
  console.log(`  volunteer: ${volunteer.email}`);
  console.log(`  victim:    ${victim.email}`);

  process.exit(0);
};

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
