// seed/seed.js
import bcrypt from 'bcrypt';
import {
  initDb,
  usersDb,
  coursesDb,
  sessionsDb,
  bookingsDb,
} from "../models/_db.js";
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { UserModel } from "../models/userModel.js";

const iso = (d) => new Date(d).toISOString();

async function wipeAll() {
  await Promise.all([
    usersDb.remove({}, { multi: true }),
    coursesDb.remove({}, { multi: true }),
    sessionsDb.remove({}, { multi: true }),
    bookingsDb.remove({}, { multi: true }),
  ]);
  await Promise.all([
    usersDb.compactDatafile(),
    coursesDb.compactDatafile(),
    sessionsDb.compactDatafile(),
    bookingsDb.compactDatafile(),
  ]);
}

async function ensureDemoUsers() {
  const studentPassword = await bcrypt.hash('student123', 10);
  const organiserPassword = await bcrypt.hash('organiser123', 10);

  await UserModel.create({
    name: 'Dylan',
    email: 'student@yoga.local',
    role: 'student',
    password: studentPassword
  });

  await UserModel.create({
    name: 'Admin',
    email: 'organiser@yoga.local',
    role: 'organiser',
    password: organiserPassword
  });
}

async function createWeekendWorkshop() {
  const instructor = await UserModel.create({
    name: "Ava",
    email: "ava@yoga.local",
    role: "instructor",
  });
  const course = await CourseModel.create({
    title: "Winter Mindfulness Workshop",
    level: "beginner",
    type: "WEEKEND_WORKSHOP",
    allowDropIn: false,
    startDate: "2026-01-10",
    endDate: "2026-01-11",
    instructorId: instructor._id,
    sessionIds: [],
    description: "Two days of breath, posture alignment, and meditation.",
  });

  const base = new Date("2026-01-10T09:00:00");
  const sessions = [];
  for (let i = 0; i < 5; i++) {
    const start = new Date(base.getTime() + i * 2 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const s = await SessionModel.create({
      courseId: course._id,
      startDateTime: iso(start),
      endDateTime: iso(end),
      capacity: 20,
      bookedCount: 0,
    });
    sessions.push(s);
  }
  await CourseModel.update(course._id, {
    sessionIds: sessions.map((s) => s._id),
  });
  return { course, sessions, instructor };
}

async function createWeeklyBlock() {
  const instructor = await UserModel.create({
    name: "Ben",
    email: "ben@yoga.local",
    role: "instructor",
  });
  const course = await CourseModel.create({
    title: "12-Week Vinyasa Flow",
    level: "intermediate",
    type: "WEEKLY_BLOCK",
    allowDropIn: true,
    startDate: "2026-02-02",
    endDate: "2026-04-20",
    instructorId: instructor._id,
    sessionIds: [],
    description: "Progressive sequences building strength and flexibility.",
  });

  const first = new Date("2026-02-02T18:30:00");
  const sessions = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(first.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 75 * 60 * 1000);
    const s = await SessionModel.create({
      courseId: course._id,
      startDateTime: iso(start),
      endDateTime: iso(end),
      capacity: 18,
      bookedCount: 0,
    });
    sessions.push(s);
  }
  await CourseModel.update(course._id, {
    sessionIds: sessions.map((s) => s._id),
  });
  return { course, sessions, instructor };
}

async function verifyAndReport() {
  const [users, courses, sessions, bookings] = await Promise.all([
    usersDb.count({}),
    coursesDb.count({}),
    sessionsDb.count({}),
    bookingsDb.count({}),
  ]);
  console.log("— Verification —");
  console.log("Users   :", users);
  console.log("Courses :", courses);
  console.log("Sessions:", sessions);
  console.log("Bookings:", bookings);
  if (courses === 0 || sessions === 0) {
    throw new Error("Seed finished but no courses/sessions were created.");
  }
}

async function run() {
  console.log("Initializing DB…");
  await initDb();

  console.log("Wiping existing data…");
  await wipeAll();

  console.log("Creating demo users…");
  await ensureDemoUsers();

  console.log("Creating weekend workshop…");
  const w = await createWeekendWorkshop();

  console.log("Creating weekly block…");
  const b = await createWeeklyBlock();

  await verifyAndReport();

  console.log("\n✅ Seed complete.");
  console.log("Workshop course ID   :", w.course._id, "(sessions:", w.sessions.length + ")");
  console.log("Weekly block course ID:", b.course._id, "(sessions:", b.sessions.length + ")");
}

run().catch((err) => {
  console.error("❌ Seed failed:", err?.stack || err);
  process.exit(1);
});