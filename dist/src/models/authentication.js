'use strict';

var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var fs = require('fs');

//Uncomment to when putting on server... Needs full path name on server
//let cert = fs.readFileSync('/var/www/thelittleguysproject.me/src/public/data/jwtRS256.key');

//Uncomment when running on local host
var cert = fs.readFileSync('./src/public/data/jwtRS256.key');

//Data used to create connection to the database
var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

//Checks the username and password when user logs in
router.post('/checkLogin', function (req, res) {
    var username = req.body.username;
    var passwrd = req.body.passwrd;
    var secretkey = 'secretkey123';

    pool.getConnection(function (err, connection) {
        connection.query("SELECT * FROM Users WHERE username = ? AND AES_DECRYPT(passwrd, ? ) = ?;", [username, secretkey, passwrd], function (err, result) {
            if (err) throw err;

            if (result.length === 0) {
                res.json('fail');
            } else {
                var user = {
                    id: result[0].userID,
                    username: username,
                    password: passwrd,
                    userType: result[0].userType
                };

                jwt.sign({ user: user }, cert, { expiresIn: "24h" }, function (err, token) {
                    res.json({ token: token });
                });
            }
            connection.release();
        });
    });
});

//Checks if the current token is valid
router.post('/checkToken', verifyToken, function (req, res) {

    var token = req.body.token;

    jwt.verify(req.token, cert, function (err, authData) {
        if (err) {
            res.json("Fail");
        } else {
            res.json("pass");
        }
    });
});

//Returns an error if token isn't valid or success if valid
function verifyToken(req, res, next) {
    var bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(' ');
        req.token = bearer[1];
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = router;
//# sourceMappingURL=authentication.js.map