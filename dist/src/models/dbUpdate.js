'use strict';

var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

router.post('/UserDetail', function (req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var passwrd = req.body.passwrd;
    var phoneNum = req.body.phoneNum;
    var city = req.body.city;
    var gender = req.body.gender;
    var DOB = req.body.DOB;
    var userType = req.body.userType;
    var userID = req.body.userID;
    var secretkey = 'secretkey123';

    pool.getConnection(function (err, connection) {
        connection.query("UPDATE Users SET username = ?, email = ?, passwrd = AES_ENCRYPT(? ,?), phoneNum = ?, city = ?, gender = ?, DOB = ?, userType = ? WHERE userID = ?", [username, email, passwrd, secretkey, phoneNum, city, gender, DOB, userType, userID], function (err) {
            if (!err) {
                res.json('success');
            } else {
                res.json('fail');
            }
        });
        connection.release();
    });
});

router.post('/CompanyDetails', function (req, res) {
    var companyID = req.body.companyID;
    var companyName = req.body.companyName;
    var ownerName = req.body.ownerName;
    var yearEst = req.body.yearEst;
    var companyNum = req.body.companyNum;
    var companyEmail = req.body.companyEmail;
    var description = req.body.description;
    var address = req.body.address;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var monday = req.body.monday;
    var tuesday = req.body.tuesday;
    var wednesday = req.body.wednesday;
    var thursday = req.body.thursday;
    var friday = req.body.friday;
    var saturday = req.body.saturday;
    var sunday = req.body.sunday;

    console.log(req.body);

    pool.getConnection(function (err, connection) {
        connection.query("UPDATE Business SET companyName = ?, ownerName = ?, yearEst = ?, companyNum = ?, companyEmail = ?, description = ?, address = ?, latitude = ?, longitude = ? WHERE businessID = ?", [companyName, ownerName, yearEst, companyNum, companyEmail, description, address, latitude, longitude, companyID], function (err) {
            if (!err) {
                connection.query("UPDATE OpenHours SET monday = ?, tuesday = ?, wednesday = ?, thursday = ?, friday = ?, saturday = ?, sunday = ? WHERE businessID = ?", [monday, tuesday, wednesday, thursday, friday, saturday, sunday, companyID], function (err) {
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
        connection.release();
    });
});

module.exports = router;
//# sourceMappingURL=dbUpdate.js.map