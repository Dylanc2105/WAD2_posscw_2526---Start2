import express from 'express';
import { requireOrganiser } from '../middlewares/requireAuth.js';
import {
  dashboardPage,
  addCoursePage,
  postAddCourse,
  editCoursePage,
  postEditCourse,
  deleteCourse,
  classListPage,
  usersPage,
  deleteUser,
  addOrganiserPage,
  postAddOrganiser,
} from '../controllers/organiserController.js';

const router = express.Router();

router.use(requireOrganiser);

router.get('/', dashboardPage);
router.get('/courses/add', addCoursePage);
router.post('/courses/add', postAddCourse);
router.get('/courses/:id/edit', editCoursePage);
router.post('/courses/:id/edit', postEditCourse);
router.post('/courses/:id/delete', deleteCourse);
router.get('/courses/:id/classlist', classListPage);
router.get('/users', usersPage);
router.post('/users/:id/delete', deleteUser);
router.get('/users/add-organiser', addOrganiserPage);
router.post('/users/add-organiser', postAddOrganiser);

export default router;
