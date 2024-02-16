const passport = require('passport');

function authenticateJwt(req, res, next) 
{
    passport.authenticate('jwt', { session: false }, (err, user, info) => 
    {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: info ? info.message : 'Unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
}

module.exports = { authenticateJwt };
