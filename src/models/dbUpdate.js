const express = require('express');
const mysql = require('mysql');
const router = express.Router();


let pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

router.post('/UserDetail', function(req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let passwrd = req.body.passwrd;
    let phoneNum = req.body.phoneNum;
    let city = req.body.city;
    let gender = req.body.gender;
    let DOB = req.body.DOB;
    let userType = req.body.userType;
    let userID = req.body.userID;
    let secretkey = 'secretkey123';

    pool.getConnection(function(err, connection) {
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

router.post('/CompanyDetails', function(req, res) {
    let companyID = req.body.companyID;
    let companyName = req.body.companyName;
    let ownerName = req.body.ownerName;
    let yearEst = req.body.yearEst;
    let companyNum = req.body.companyNum;
    let companyEmail = req.body.companyEmail;
    let description = req.body.description;
    let address = req.body.address;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let monday = req.body.monday;
    let tuesday = req.body.tuesday;
    let wednesday = req.body.wednesday;
    let thursday = req.body.thursday;
    let friday = req.body.friday;
    let saturday = req.body.saturday;
    let sunday = req.body.sunday;

    console.log(req.body);

    pool.getConnection(function(err, connection) {
        connection.query("UPDATE Business SET companyName = ?, ownerName = ?, yearEst = ?, companyNum = ?, companyEmail = ?, description = ?, address = ?, latitude = ?, longitude = ? WHERE businessID = ?", [companyName, ownerName, yearEst, companyNum, companyEmail, description, address, latitude, longitude, companyID], function (err) {
            if (!err) {
                connection.query("UPDATE OpenHours SET monday = ?, tuesday = ?, wednesday = ?, thursday = ?, friday = ?, saturday = ?, sunday = ? WHERE businessID = ?", [monday, tuesday, wednesday, thursday, friday, saturday, sunday, companyID], function (err) {
                    if (!err) {
                        res.json('success');
                    }else {
                        res.json('fail');
                    }
                });
            }else {
                res.json('fail');
            }
        });
        connection.release();
    });
});

module.exports = router;