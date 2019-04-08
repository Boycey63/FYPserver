'use strict';

var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");

//Data used to create connection to the database
var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

//Used to insert new user into the Users table
router.post('/UserTable', function (req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var passwrd = req.body.passwrd;
    var phoneNum = req.body.phoneNum;
    var city = req.body.city;
    var gender = req.body.gender;
    var DOB = req.body.DOB;
    var userType = req.body.userType;
    var secretkey = 'secretkey123';
    pool.getConnection(function (err, connection) {
        connection.query("INSERT INTO Users(username, email, passwrd, phoneNum, city, gender, DOB, userType) VALUES (? , ? , AES_ENCRYPT(? ,?), ?, ?, ? ,? ,?);", [req.body.username, req.body.email, req.body.passwrd, secretkey, req.body.phoneNum, req.body.city, req.body.gender, req.body.DOB, req.body.userType], function (err, results) {
            if (!err) {
                res.json('success');
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Inserts new business into the Business table
router.post('/BusinessTable', function (req, res) {

    pool.getConnection(function (err, connection) {
        //Insert into business table
        connection.query("INSERT INTO Business(companyName, ownerName, yearEst, companyNum, companyEmail, description, isOpen, address, latitude, longitude, categoryID, userID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [req.body.companyName, req.body.ownerName, req.body.yearEst, req.body.companyNum, req.body.companyEmail, req.body.description, req.body.isOpen, req.body.address, req.body.latitude, req.body.longitude, req.body.categoryID, req.body.userID], function (err, fields) {
            if (err) throw err;
            //Select to get the businessID
            connection.query("SELECT businessID FROM Business WHERE companyName = '" + req.body.companyName + "';", function (err, result) {
                if (!err) {
                    //Inserts into the openhours table
                    pool.query("INSERT INTO OpenHours(monday, tuesday, wednesday, thursday, friday, saturday, sunday, businessID) VALUES (?, ?, ?, ?, ?, ?, ?, ?); ", [req.body.monday, req.body.tuesday, req.body.wednesday, req.body.thursday, req.body.friday, req.body.saturday, req.body.sunday, result[0].businessID], function (err, fields) {
                        if (!err) {
                            res.json('success');
                        } else {
                            res.json('fail');
                        }
                    });
                } else {
                    res.json('fail');
                }
            });
        });
        connection.release();
    });
});

//Inserts new review into the Review table
router.post('/review', function (req, res) {
    var post = req.body;
    pool.getConnection(function (err, connection) {
        connection.query("INSERT INTO Reviews(ReviewTitle, ReviewDate, Stars, ReviewText, businessID, userID) VALUES (?, now(), ?, ?, ?, ?)", [req.body.reviewTitle, parseInt(req.body.Stars), req.body.ReviewText, req.body.businessID, req.body.userID], function (err, fields) {
            if (!err) {
                res.json('success');
            } else {
                res.json('fail');
            }
            connection.release();
        });
    });
});

module.exports = router;
//# sourceMappingURL=dbInsert.js.map