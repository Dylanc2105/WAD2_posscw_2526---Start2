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

/** Create weekly sessions starting from `startIso`, n weeks, at given time */
async function makeWeeklySessions(courseId, startIso, weeks, hour, minute, durationMin, capacity) {
  const base = new Date(startIso);
  base.setHours(hour, minute, 0, 0);
  const sessions = [];
  for (let i = 0; i < weeks; i++) {
    const start = new Date(base.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + durationMin * 60 * 1000);
    const s = await SessionModel.create({
      courseId,
      startDateTime: iso(start),
      endDateTime: iso(end),
      capacity,
      bookedCount: 0,
    });
    sessions.push(s);
  }
  return sessions;
}

/** Create a run of sessions across one weekend (Sat+Sun) */
async function makeWeekendSessions(courseId, saturdayIso, slotsPerDay, capacity) {
  const sat = new Date(saturdayIso);
  const sun = new Date(sat.getTime() + 24 * 60 * 60 * 1000);
  const days = [sat, sun];
  const sessions = [];
  for (const day of days) {
    for (let i = 0; i < slotsPerDay; i++) {
      const start = new Date(day);
      start.setHours(9 + i * 2, 0, 0, 0);
      const end = new Date(start.getTime() + 90 * 60 * 1000);
      const s = await SessionModel.create({
        courseId,
        startDateTime: iso(start),
        endDateTime: iso(end),
        capacity,
        bookedCount: 0,
      });
      sessions.push(s);
    }
  }
  return sessions;
}

async function run() {
  console.log("Initialising DB…");
  await initDb();

  console.log("Wiping existing data…");
  await wipeAll();

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("Creating users…");
  const pw = async (p) => bcrypt.hash(p, 10);

  const [organiser, dylan, sarah, james, emma, oliver, chloe, priya, tom] =
    await Promise.all([
      UserModel.create({ name: 'Admin',  email: 'organiser@yoga.local', role: 'organiser',   password: await pw('organiser123') }),
      UserModel.create({ name: 'Dylan',  email: 'student@yoga.local',   role: 'student',     password: await pw('student123')   }),
      UserModel.create({ name: 'Sarah',  email: 'sarah@yoga.local',     role: 'student',     password: await pw('student123')   }),
      UserModel.create({ name: 'James',  email: 'james@yoga.local',     role: 'student',     password: await pw('student123')   }),
      UserModel.create({ name: 'Emma',   email: 'emma@yoga.local',      role: 'student',     password: await pw('student123')   }),
      UserModel.create({ name: 'Oliver', email: 'oliver@yoga.local',    role: 'student',     password: await pw('student123')   }),
      UserModel.create({ name: 'Chloe',  email: 'chloe@yoga.local',     role: 'student',     password: await pw('student123')   }),
      UserModel.create({ name: 'Priya',  email: 'priya@yoga.local',     role: 'student',     password: await pw('student123')   }),
      UserModel.create({ name: 'Tom',    email: 'tom@yoga.local',       role: 'student',     password: await pw('student123')   }),
    ]);

  const [ava, ben, clara, david] = await Promise.all([
    UserModel.create({ name: 'Ava',   email: 'ava@yoga.local',   role: 'instructor' }),
    UserModel.create({ name: 'Ben',   email: 'ben@yoga.local',   role: 'instructor' }),
    UserModel.create({ name: 'Clara', email: 'clara@yoga.local', role: 'instructor' }),
    UserModel.create({ name: 'David', email: 'david@yoga.local', role: 'instructor' }),
  ]);

  // ── Courses ────────────────────────────────────────────────────────────────
  console.log("Creating courses & sessions…");

  const courseSpecs = [
    // beginner / WEEKLY_BLOCK
    {
      title: 'Winter Mindfulness Workshop',
      level: 'beginner', type: 'WEEKEND_WORKSHOP', allowDropIn: false,
      startDate: '2026-01-10', endDate: '2026-01-11',
      instructorId: ava._id,
      description: 'Two days of breath, posture alignment, and meditation.',
      sessions: { kind: 'weekend', saturday: '2026-01-10', slotsPerDay: 3, capacity: 20 },
    },
    {
      title: '12-Week Vinyasa Flow',
      level: 'intermediate', type: 'WEEKLY_BLOCK', allowDropIn: true,
      startDate: '2026-02-02', endDate: '2026-04-20',
      instructorId: ben._id,
      description: 'Progressive sequences building strength and flexibility over 12 weeks.',
      sessions: { kind: 'weekly', start: '2026-02-02', weeks: 12, hour: 18, minute: 30, duration: 75, capacity: 18 },
    },
    {
      title: 'Sunrise Yin Yoga',
      level: 'beginner', type: 'WEEKLY_BLOCK', allowDropIn: true,
      startDate: '2026-05-04', endDate: '2026-07-20',
      instructorId: ava._id,
      description: 'Slow-paced early morning classes targeting deep connective tissue.',
      sessions: { kind: 'weekly', start: '2026-05-04', weeks: 12, hour: 7, minute: 0, duration: 60, capacity: 16 },
    },
    {
      title: 'Power Yoga Fundamentals',
      level: 'intermediate', type: 'WEEKEND_WORKSHOP', allowDropIn: false,
      startDate: '2026-05-09', endDate: '2026-05-10',
      instructorId: ben._id,
      description: 'Build a strong foundation in power yoga over an intensive weekend.',
      sessions: { kind: 'weekend', saturday: '2026-05-09', slotsPerDay: 3, capacity: 14 },
    },
    {
      title: 'Advanced Ashtanga Series',
      level: 'advanced', type: 'WEEKLY_BLOCK', allowDropIn: false,
      startDate: '2026-05-11', endDate: '2026-08-10',
      instructorId: david._id,
      description: 'Full primary and secondary series for experienced practitioners.',
      sessions: { kind: 'weekly', start: '2026-05-11', weeks: 13, hour: 19, minute: 0, duration: 90, capacity: 10 },
    },
    {
      title: 'Restorative Yoga & Breathwork',
      level: 'beginner', type: 'WEEKEND_WORKSHOP', allowDropIn: true,
      startDate: '2026-06-06', endDate: '2026-06-07',
      instructorId: clara._id,
      description: 'A nourishing weekend using props and breathwork to deeply relax.',
      sessions: { kind: 'weekend', saturday: '2026-06-06', slotsPerDay: 2, capacity: 20 },
    },
    {
      title: 'Hot Yoga Flow',
      level: 'intermediate', type: 'WEEKLY_BLOCK', allowDropIn: true,
      startDate: '2026-06-08', endDate: '2026-08-24',
      instructorId: ben._id,
      description: 'Dynamic flowing sequences in a heated studio to boost detox and flexibility.',
      sessions: { kind: 'weekly', start: '2026-06-08', weeks: 12, hour: 18, minute: 0, duration: 60, capacity: 15 },
    },
    {
      title: 'Meditation & Mindfulness',
      level: 'beginner', type: 'WEEKLY_BLOCK', allowDropIn: true,
      startDate: '2026-06-15', endDate: '2026-08-31',
      instructorId: ava._id,
      description: 'Weekly guided meditation and mindfulness to reduce stress and improve focus.',
      sessions: { kind: 'weekly', start: '2026-06-15', weeks: 12, hour: 9, minute: 30, duration: 45, capacity: 25 },
    },
    {
      title: 'Advanced Inversions & Arm Balances',
      level: 'advanced', type: 'WEEKEND_WORKSHOP', allowDropIn: false,
      startDate: '2026-07-11', endDate: '2026-07-12',
      instructorId: david._id,
      description: 'Headstands, handstands, and advanced arm balances workshop for experienced students.',
      sessions: { kind: 'weekend', saturday: '2026-07-11', slotsPerDay: 3, capacity: 8 },
    },
    {
      title: 'Yoga for Athletes',
      level: 'intermediate', type: 'WEEKLY_BLOCK', allowDropIn: true,
      startDate: '2026-07-13', endDate: '2026-09-28',
      instructorId: clara._id,
      description: 'Targeted sequences to improve athletic performance, mobility, and recovery.',
      sessions: { kind: 'weekly', start: '2026-07-13', weeks: 12, hour: 7, minute: 30, duration: 60, capacity: 16 },
    },
    {
      title: 'Corporate Wellness Yoga',
      level: 'beginner', type: 'WEEKEND_WORKSHOP', allowDropIn: true,
      startDate: '2026-07-18', endDate: '2026-07-19',
      instructorId: ava._id,
      description: 'Chair yoga, desk stretches, and stress-relief techniques tailored for office workers.',
      sessions: { kind: 'weekend', saturday: '2026-07-18', slotsPerDay: 2, capacity: 30 },
    },
    {
      title: 'Advanced Pranayama & Philosophy',
      level: 'advanced', type: 'WEEKLY_BLOCK', allowDropIn: false,
      startDate: '2026-08-03', endDate: '2026-10-19',
      instructorId: david._id,
      description: 'Deep exploration of yogic breathing techniques and classical philosophy texts.',
      sessions: { kind: 'weekly', start: '2026-08-03', weeks: 12, hour: 20, minute: 0, duration: 90, capacity: 12 },
    },
    {
      title: 'Beginner Hatha Yoga',
      level: 'beginner', type: 'WEEKLY_BLOCK', allowDropIn: true,
      startDate: '2026-09-07', endDate: '2026-11-23',
      instructorId: clara._id,
      description: 'A gentle introduction to yoga postures, breathing, and relaxation for absolute beginners.',
      sessions: { kind: 'weekly', start: '2026-09-07', weeks: 12, hour: 10, minute: 0, duration: 60, capacity: 20 },
    },
  ];

  const createdCourses = [];
  for (const spec of courseSpecs) {
    const { sessions: sesSpec, ...courseData } = spec;
    const course = await CourseModel.create({ ...courseData, sessionIds: [] });

    let sessions = [];
    if (sesSpec.kind === 'weekly') {
      sessions = await makeWeeklySessions(
        course._id, sesSpec.start, sesSpec.weeks,
        sesSpec.hour, sesSpec.minute, sesSpec.duration, sesSpec.capacity
      );
    } else {
      sessions = await makeWeekendSessions(
        course._id, sesSpec.saturday, sesSpec.slotsPerDay, sesSpec.capacity
      );
    }

    await CourseModel.update(course._id, { sessionIds: sessions.map(s => s._id) });
    createdCourses.push({ course: { ...course, _id: course._id }, sessions });
  }

  // ── Bookings ───────────────────────────────────────────────────────────────
  console.log("Creating bookings…");

  const students = [dylan, sarah, james, emma, oliver, chloe, priya, tom];

  // Each student books 2–4 different courses
  const bookingPlan = [
    { student: dylan,  courseIndexes: [0, 1, 4] },
    { student: sarah,  courseIndexes: [0, 2, 7] },
    { student: james,  courseIndexes: [1, 3, 9] },
    { student: emma,   courseIndexes: [2, 5, 7] },
    { student: oliver, courseIndexes: [1, 4, 8] },
    { student: chloe,  courseIndexes: [0, 6, 7] },
    { student: priya,  courseIndexes: [2, 3, 5, 12] },
    { student: tom,    courseIndexes: [4, 8, 11] },
  ];

  for (const { student, courseIndexes } of bookingPlan) {
    for (const ci of courseIndexes) {
      const { course, sessions } = createdCourses[ci];
      const sessionIds = sessions.map(s => s._id);
      await bookingsDb.insert({
        userId: student._id,
        courseId: course._id,
        type: 'COURSE',
        sessionIds,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      });
      // update bookedCount on each session
      for (const s of sessions) {
        await sessionsDb.update({ _id: s._id }, { $inc: { bookedCount: 1 } });
      }
    }
  }

  // ── Report ─────────────────────────────────────────────────────────────────
  const [uCount, cCount, sCount, bCount] = await Promise.all([
    usersDb.count({}),
    coursesDb.count({}),
    sessionsDb.count({}),
    bookingsDb.count({}),
  ]);
  console.log("\n— Summary —");
  console.log("Users   :", uCount);
  console.log("Courses :", cCount);
  console.log("Sessions:", sCount);
  console.log("Bookings:", bCount);
  console.log("\n✅ Seed complete.");
}

run().catch((err) => {
  console.error("❌ Seed failed:", err?.stack || err);
  process.exit(1);
});
