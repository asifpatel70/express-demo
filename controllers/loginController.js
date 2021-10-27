const db = require("../models");
const md5 = require('md5')
const User = db.User;


exports.signin = (req, res) => {
    User.findOne({
      where: {
        userName: req.body.userName
      }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        var passwordIsValid = (req.body.password == user.password) ? true: false;
        if (!passwordIsValid) {
            return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
            });
        }
        req.session.loggedIn = true
        console.log(req.session)
        res.redirect('/users')
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};
