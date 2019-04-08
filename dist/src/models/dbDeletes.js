'use strict';

var express = require('express');
var mysql = require('mysql');
var router = express.Router();

//Data used to create connection to the database
var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

//Deletes a specific user account from the Users table
router.post('/account', function (req, res) {
    var userID = req.body.userID;
    pool.getConnection(function (err, connection) {
        connection.query("DELETE FROM Users WHERE userID = ?", [userID], function (err) {
            if (!err) {
                res.json('success');
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Deletes a specific business from the Business table
router.post('/business', function (req, res) {
    var companyID = req.body.companyID;
    pool.getConnection(function (err, connection) {
        connection.query("DELETE FROM Business WHERE businessID = ?", [companyID], function (err) {
            if (!err) {
                res.json('success');
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

module.exports = router;
//# sourceMappingURL=dbDeletes.js.map