import passport from "passport";
import passportLocal from "passport-local";
import { isUniquenessError } from "../util/index.js";
import argon2 from "argon2";
import passportJWT from "passport-jwt";

passport.use("register", new passportLocal.Strategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true,
}, async (req, username, password, done) => {
    const db = req.app.get("db");

    try {
        const password_hash = await argon2.hash(password);

        await db("users")
            .insert({ username, password_hash });

        return done(null, { username });
    } catch(error) {
        if (isUniquenessError(error))
            return done(null, false, { message: "Username taken" });

        done(error);
    }
}));

passport.use("login", new passportLocal.Strategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true,
}, async (req, username, password, done) => {
    const db = req.app.get("db");

    try {
        const userQuery = await db
            .from("users")
            .select("username", "password_hash")
            .where("username", username);

        if (userQuery.length < 1)
            return done(null, false, { message: "Invalid username" });

        const password_hash = userQuery[0].password_hash;

        if (await argon2.verify(password_hash, password))
            return done(null, { username });
        else
            return done(null, false, { message: "Invalid password" });
    } catch(error) {
        done(error);
    }
}));

passport.use(new passportJWT.Strategy({
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
}, async(token, done) => {
    try {
        return done(null, { username: token.username });
    } catch(error) {
        done(error);
    }
}));
