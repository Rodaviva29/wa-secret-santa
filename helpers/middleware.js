function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
      return next();
    } else {
      res.redirect('/');
    }
  }
  
module.exports = { isAuthenticated };
  