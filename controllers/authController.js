const db = require("../models");
const config = require("../config/auth.config");
const md5 = require('md5')
const User = db.User;
const RefreshToken = db.refreshToken;

const Op = db.Sequelize.Op;
var jwt = require("jsonwebtoken");
const models = require("../models");

exports.signin = (req, res) => {
    User.findOne({
      where: {
        userName: req.body.userName,
        isActive: true
      }
    })
    .then(user  = async (user) => {
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
        expiresIn: config.jwtExpiration // 5 minit // hours
    });
    let refreshToken = await RefreshToken.createToken(user);
        res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token,
        refreshToken: refreshToken,
      //  });
    });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};
exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;

    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required!" });
    }

    try {
        let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });

        if (!refreshToken) {
            res.status(403).json({ message: "Refresh token is not in database!" });
            return;
        }

        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.destroy({ where: { id: refreshToken.id } });

            res.status(403).json({
                message: "Refresh token was expired. Please make a new signin request",
            });
            return;
        }

        const user = await refreshToken.getUser();
        let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.jwtExpiration,
        });

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};