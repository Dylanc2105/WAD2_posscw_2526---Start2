// middlewares/attachUser.js
import { UserModel } from '../models/userModel.js';

export const attachUser = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await UserModel.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.user = {
          ...user,
          isOrganiser: user.role === 'organiser'
        };
      } else {
        req.user = null;
        res.locals.user = null;
      }
    } else {
      req.user = null;
      res.locals.user = null;
    }
    next();
  } catch (err) {
    next(err);
  }
};