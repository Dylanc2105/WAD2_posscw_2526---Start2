import bcrypt from 'bcrypt';
import { CourseModel } from '../models/courseModel.js';
import { BookingModel } from '../models/bookingModel.js';
import { UserModel } from '../models/userModel.js';

export const dashboardPage = async (req, res, next) => {
  try {
    const courses = await CourseModel.list();
    res.render('organiser/dashboard', { title: 'Organiser Dashboard', courses });
  } catch (err) {
    next(err);
  }
};

export const addCoursePage = (req, res) => {
  res.render('organiser/add_course', { title: 'Add Course' });
};

export const postAddCourse = async (req, res, next) => {
  try {
    const { title, description, level, type, allowDropIn, startDate, endDate } = req.body;
    await CourseModel.create({ title, description, level, type, allowDropIn: !!allowDropIn, startDate, endDate });
    res.redirect('/organiser');
  } catch (err) {
    next(err);
  }
};

export const editCoursePage = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) return res.status(404).send('Course not found');
    const enriched = {
      ...course,
      isLevelBeginner: course.level === 'beginner',
      isLevelIntermediate: course.level === 'intermediate',
      isLevelAdvanced: course.level === 'advanced',
      isTypeWeekly: course.type === 'WEEKLY_BLOCK',
      isTypeWeekend: course.type === 'WEEKEND_WORKSHOP',
      isAllowDropIn: !!course.allowDropIn,
    };
    res.render('organiser/edit_course', { title: 'Edit Course', course: enriched });
  } catch (err) {
    next(err);
  }
};

export const postEditCourse = async (req, res, next) => {
  try {
    const { title, description, level, type, allowDropIn, startDate, endDate } = req.body;
    await CourseModel.update(req.params.id, { title, description, level, type, allowDropIn: !!allowDropIn, startDate, endDate });
    res.redirect('/organiser');
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    await CourseModel.delete(req.params.id);
    res.redirect('/organiser');
  } catch (err) {
    next(err);
  }
};

export const classListPage = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) return res.status(404).send('Course not found');
    const bookings = await BookingModel.findByCourse(req.params.id);
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await UserModel.findById(booking.userId);
        return { ...booking, userName: user ? user.name : 'Unknown' };
      })
    );
    res.render('organiser/class_list', { title: course.title, course, bookings: enrichedBookings });
  } catch (err) {
    next(err);
  }
};

export const usersPage = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();
    const enrichedUsers = users.map(u => ({ ...u, isSelf: u._id === req.user._id }));
    res.render('organiser/users', { title: 'Manage Users', users: enrichedUsers, currentUserId: req.user._id });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await UserModel.delete(req.params.id);
    res.redirect('/organiser/users');
  } catch (err) {
    next(err);
  }
};

export const addOrganiserPage = (req, res) => {
  res.render('organiser/add_organiser', { title: 'Add Organiser' });
};

export const postAddOrganiser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const password = await bcrypt.hash('changeme123', 10);
    await UserModel.create({ name, email, password, role: 'organiser' });
    res.redirect('/organiser/users');
  } catch (err) {
    next(err);
  }
};
