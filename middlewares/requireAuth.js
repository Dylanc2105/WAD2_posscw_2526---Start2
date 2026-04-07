export const requireLogin = (req, res, next) => {
  if (!req.user) return res.redirect('/login');
  next();
};

export const requireOrganiser = (req, res, next) => {
  if (!req.user) return res.redirect('/login');
  if (req.user.role !== 'organiser') return res.status(403).redirect('/');
  next();
};
