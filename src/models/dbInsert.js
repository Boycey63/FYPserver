const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const CryptoJS = require("crypto-js");
const AES = require("crypto-js/aes");

//Data used to create connection to the database
let pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

//Used to insert new user into the Users table
router.post('/UserTable', function(req, res) {
    let username= req.body.username;
    let email= req.body.email;
    let passwrd= req.body.passwrd;
    let phoneNum= req.body.phoneNum;
    let city= req.body.city;
    let gender= req.body.gender;
    let DOB= req.body.DOB;
    let userType =req.body.userType;
    let secretkey = 'secretkey123';
    pool.getConnection(function(err, connection) {
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
router.post('/BusinessTable', function(req, res) {

    pool.getConnection(function(err, connection) {
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
router.post('/review', function(req, res) {
    let post = req.body;
    pool.getConnection(function(err, connection) {
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