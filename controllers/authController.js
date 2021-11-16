const db = require("../models");
const config = require("../config/auth.config");
const md5 = require('md5')
const User = db.User;
const Role = db.Role;

const Op = db.Sequelize.Op;
var jwt = require("jsonwebtoken");

exports.signin = (req, res) => {
    User.findOne({
      where: {
        userName: req.body.userName,
        isActive: true
      }
    })
    .then(user => {
    if (!user) {
        return res.status(404).send({ message: "User Not found." });
    }
    var passwordIsValid = (md5(req.body.password) == user.password) ? true: false;
    if (!passwordIsValid) {
        return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
        });
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 3000 // 5 minit // hours
    });

    var authorities = [];
    //user.getRoles().then(roles => {
        // for (let i = 0; i < roles.length; i++) {
        // authorities.push("ROLE_" + roles[i].name.toUpperCase());
        // }
        res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token
      //  });
    });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};