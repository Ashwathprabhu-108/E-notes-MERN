import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://e-notes-backend-e03y.onrender.com/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.create({
                username: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                provider: "google",
                password: null,
                profileImage: profile.photos?.[0]?.value || null,
            });
        } else {
            // Update profile image if it changed
            if (profile.photos?.[0]?.value && user.profileImage !== profile.photos[0].value) {
                user.profileImage = profile.photos[0].value;
                await user.save();
            }
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

export default passport;