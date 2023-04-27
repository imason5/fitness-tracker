const express = require("express");
const User = require("../models/User.model");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const { validateSignupInput } = require("../middleware/inputValidation");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard")

const roundOfSalt = 13;
const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/* --- 1. GET: signup page --- */
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

/* --- 2. POST: signup page --- */
router.post("/signup", validateSignupInput, async (req, res, next) => {
  try {
    const isExistingUser = await User.findOne({ username: req.body.username });

    if (!isExistingUser) {
      if (pwdRegex.test(req.body.password)) {
        const salt = bcryptjs.genSaltSync(roundOfSalt);
        const passwordHash = bcryptjs.hashSync(req.body.password, salt);

        await User.create({
          username: req.body.username,
          password: passwordHash,
          email: req.body.email,
        });
        res.redirect("/auth/login");
      } else {
        res.render("auth/signup");
      }
    } else {
      res.render("auth/signup");
    }
  } catch (error) {
    console.log("Error from signup post: ", error);
  }
});

/* --- 3. GET: login page --- */
router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

/* --- 4. POST: login page --- */
router.post("/login", async (req, res, next) => {
  const { username, password, email } = req.body;

  try {
    const isExistingUser = await User.findOne({ username });

    if (isExistingUser) {
      if (bcryptjs.compareSync(password, isExistingUser.password)) {
        req.session.loggedInUser = isExistingUser;
        res.render("auth/profile", {username, email});
      } else {
        res.render("auth/login", { username });
      }
    } else {
      res.render("auth/login", { username });
    }
  } catch (error) {
    console.log("Error from login post: ", error);
  }
});

/* --- 5. GET: profile page --- */
router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("auth/profile")
})

/* --- 6. GET: logout request --- */
router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err)
    res.redirect('/')
  })
})

module.exports = router;