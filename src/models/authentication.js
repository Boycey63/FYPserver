const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const fs = require('fs');

//Uncomment to when putting on server... Needs full path name on server
//let cert = fs.readFileSync('/var/www/thelittleguysproject.me/src/public/data/jwtRS256.key');

//Uncomment when running on local host
let cert = fs.readFileSync('./src/public/data/jwtRS256.key');

//Data used to create connection to the database
let pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

//Checks the username and password when user logs in
router.post('/checkLogin', function(req, res) {
    let username = req.body.username;
    let passwrd = req.body.passwrd;
    let secretkey = 'secretkey123';

    pool.getConnection(function(err, connection) {
        connection.query("SELECT * FROM Users WHERE username = ? AND AES_DECRYPT(passwrd, ? ) = ?;",[username,secretkey,passwrd], function(err, result) {
            if (err) throw err;

            if (result.length === 0) {
                res.json('fail');
            } else {
                const user = {
                    id: result[0].userID,
                    username: username,
                    password: passwrd,
                    userType: result[0].userType,
                };

                jwt.sign({user}, cert, {expiresIn: "24h"}, (err, token) => {
                    res.json({token});
                });
            }
            connection.release();
        });
    });
});

//Checks if the current token is valid
router.post('/checkToken',verifyToken,(req, res) => {

    let token = req.body.token;

    jwt.verify(req.token, cert, (err, authData) =>{
        if(err){
            res.json("Fail");
        }else{
            res.json("pass");
        }
    });
});

//Returns an error if token isn't valid or success if valid
function verifyToken(req, res, next){
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];
        next();
    }else{
        res.sendStatus(403);
    }
}

module.exports = router;