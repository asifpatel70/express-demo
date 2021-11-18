const db = require("../models");
const md5 = require('md5')
const User = db.User;


exports.signin = (req, res) => {
    User.findOne({
      where: {
        userName: req.body.userName,
        isActive: true
      }
    }).then(user => {
        if (!user) {
            req.session.loginError = true;
            return res.redirect('/login');
            //return res.status(404).send({ message: "User Not found." });
        }
        var passwordIsValid = (md5(req.body.password) == user.password) ? true: false;
        if (!passwordIsValid) {
            req.session.loginError = true;
            return res.redirect('/login');
            // return res.status(401).send({
            // accessToken: null,
            // message: "Invalid Password!"
            // });
        }
        req.session.loggedIn = true
        req.session.loginusername = user.name
        req.session.loginuserid = user.id
        res.redirect('/users')
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};
