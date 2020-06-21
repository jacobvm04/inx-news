import express from "express";
import passport from 'passport';
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", function(req, res, next) {
    passport.authenticate("register", { session: false }, (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            res.status(422);
            res.json({
                message: info.message,
            });
        } else {
            res.status(201);
            res.json({
                message: "User registration successful",
                user,
            });
        }
    })(req, res, next);
});

router.post("/login", function(req, res, next) {
    passport.authenticate("login", { session: false }, (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            res.status(403);
            return res.json({
                message: info.message,
            })
        } else {
            try {
                req.login(user, {session: false}, (error) => {
                    if (error)
                        return next(error);

                    const token = jwt.sign(user, process.env.JWT_SECRET);

                    return res.json({ token });
                });
            } catch(error) {
                return next(error);
            }
        }
    })(req, res, next);
});

export default router;
