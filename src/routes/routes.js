const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { isString, isUndefined, isEmpty, isNumber } = require('lodash');
const User = require('../model/model');
const logger = require('../utils/logger')

const router = express.Router();

router.post(
    '/signup',
    // passport.authenticate('signup', { session: false }),
    async (req, res, next) => {
        const {
            name,
            email,
            password
        } = req.body

        if (!name || !isString(name) || name.length < 3) {
            const error = new Error('Invalid Name');
            error.name = 'Validation Error';
            return res.status(400).json({ code: 400, error: true, msg: "Enter a valid name" });
        }

        if (
            !isString(password) ||
            password.length < 8 ||
            password.length > 30
        ) {
            const err = new Error('Invalid password. Password should be 8 to 30 characters long');
            err.name = 'ValidationError';
            return res.status(400).json({ code: 400, error: true, msg: "Enter a valid password" });
        }

        const userExists = await User.findOne({ email: email });

        if (userExists) {
            if (userExists.email == email) {
                return res.status(400).json({ code: 400, err: true, msg: `user with mail ID ${email} already present` });
            }
        }
        let newUser;
        if (await User.count() == 0) {
            // first user will be admin
            newUser = await User.create({
                name,
                email,
                password,
                isAdmin: true
            });
        } else {
            newUser = await User.create({
                name,
                email,
                password,
                isAdmin: false
            });
        }

        res.json({
            message: 'Signup successful',
            // user: req.user
            user: newUser
        });
    }
);

router.post(
    '/login',
    async (req, res, next) => {
        passport.authenticate(
            'login',
            async (err, user, info) => {
                try {
                    logger.info(req.body)
                    logger.error(err)
                    logger.info(user)
                    logger.info(info)
                    if (err || !user) {
                        const error = new Error(info.message);
                        // console.log(78, 'err', err, user, info)
                        throw error;
                    }

                    req.login(
                        user,
                        { session: false },
                        async (error) => {
                            if (error) {
                                // return next(error);
                                logger.log(error);
                                throw new Error(error);
                            }
                            const userInfo = { _id: user._id, name: user.name, email: user.email, isAdmin: user?.isAdmin };
                            const token = jwt.sign({ user: userInfo }, 'TOP_SECRET');

                            return res.json({ userInfo, token });
                        }
                    );
                } catch (error) {
                    logger.error(error.message)
                    return res.status(400).json({ code: 400, err: true, msg: error.message })
                }
            }
        )(req, res, next);
    }
);

module.exports = router;