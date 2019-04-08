const express = require('express');
const mysql = require('mysql');
const router = express.Router();

//Data used to create connection to the database
let pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'TLGjb18!',
    database: 'LittleGuys1'
});

//Test the connection for initial page
router.get('/testConnection', function(req, res) {
    pool.getConnection(function(err, connection) {
       if(err){
           res.json(503);
       }else{
           res.json(200);
       }
    });
});

//Selects a user based on userID
router.post('/user', function(req, res) {
    let userID = req.body.userID;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *,DATE_FORMAT(DOB, \"%d-%m-%Y\") as DateofBirth,DATE_FORMAT(DOB, \"%Y-%m-%d\") as DateofBirth2 FROM Users WHERE userID = ?", [userID], function (err, result) {
            if (result.length === 1 && !err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects all reviews based on the username
router.post('/UserReviews', function(req, res) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *,DATE_FORMAT(ReviewDate, \"%d-%m-%Y\") as formReviewDate FROM Reviews JOIN Business ON Business.businessID=Reviews.businessID JOIN Users ON Reviews.userID=Users.userID WHERE Users.username = ?", [req.body.username],function(err, result) {
            if(!err) {
                res.json(result);
            }else{
                res.json(err);
            }
            connection.release();
        });
    });
});

//Checks if user exists based on input username from account registration
router.post('/checkUsername', function(req, res) {
    let username = req.body.username;

    if(username !== '') {
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM Users WHERE username = ?", [username], function (err, result) {
                if (result.length > 0 && !err) {
                    res.json('exists');
                } else {
                    res.json('Not exist');
                }
                connection.release();
            });
        });
    }else{
        res.json("No input");
    }
});

//Checks email exist based on input email from account registration
router.post('/checkEmail', function(req, res) {
    let email = req.body.email;

    if(email !== '') {
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM Users WHERE email = ?", [email], function (err, result) {
                if (result.length > 0 && !err) {
                    res.json('exists');
                } else {
                    res.json(err);
                }
                connection.release();
            });
        });
    }else{
        res.json("No input");
    }
});

//Checks if phone number exists based on input number from account registration
router.post('/checkNumber', function(req, res) {

    let phoneNum = req.body.phoneNum;
    if(phoneNum !== '') {
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM Users WHERE phoneNum = ?", [phoneNum], function (err, result) {
                if (result.length > 0 && !err) {
                    res.json('exists');
                } else {
                    res.json(err);
                }
                connection.release();
            });
        });
    }else{
        res.json("No input");
    }
});

//Checks on a company name
router.post('/checkCompanyName', function(req, res) {

    let companyName = req.body.companyName;
    let companyID = req.body.companyID;

    //If company name is not blank but the id is
    if(companyName !== '' && companyID === '') {
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM Business WHERE companyName = ?", [companyName], function (err, result) {
                if (result.length > 0 && !err) {
                    res.json('exists');
                } else {
                    res.json(err);
                }
                connection.release();
            });
        });
    }
    //If both fields are not blank
    else if(companyName !== '' && companyID !== ''){
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM Business WHERE companyName = ? AND businessID != ?", [companyName,companyID], function (err, result) {
                if (result.length > 0 && !err) {
                    res.json('exists');
                } else {
                    res.json(err);
                }
                connection.release();
            });
        });
    }
    else{
        res.json("No input");
    }
});


//Selects a list of categories in ascending order
router.get('/categories', function(req, res) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT * FROM Category ORDER BY categoryName ASC", function (err, result) {
            if (result.length > 0 && !err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects businesses based on the users input term
router.post('/searchTerm', function(req, res) {
    let searchTerm = req.body.searchTerm;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *, DATE_FORMAT(yearEst, \"%d-%m-%Y\") as formYearEst, DATE_FORMAT(creationDate, \"%d-%m-%Y\") as formCreationDate FROM Business  JOIN Category ON Category.categoryID=Business.categoryID WHERE Business.companyName LIKE CONCAT('%', ? , '%') ORDER BY businessID DESC", [searchTerm], function (err, result) {
            if (!err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects all reviews in descending order for the most recent reviews page
router.get('/ReviewTable', function(req, res) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *,DATE_FORMAT(ReviewDate, \"%d-%m-%Y\") as formReviewDate FROM Reviews JOIN Business ON Business.businessID=Reviews.businessID JOIN Users ON Reviews.userID=Users.userID ORDER BY ReviewDate DESC", function (err, result) {
            if (!err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects all businesses in descending order
router.get('/BusinessTable', function(req, res) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *, DATE_FORMAT(yearEst, \"%d-%m-%Y\") as formYearEst, DATE_FORMAT(creationDate, \"%d-%m-%Y\") as formCreationDate FROM Business  JOIN Category ON Category.categoryID=Business.categoryID ORDER BY businessID DESC", function (err, result) {
            if (!err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects companies for homepage based on a square location of the users preset location
router.post('/BusinessLatLng', function(req, res) {
    let A_x = req.body.A_x;
    let A_y = req.body.A_y;
    let B_x = req.body.B_x;
    let B_y = req.body.B_y;
    let filterValue= req.body.filterValue;
    if(filterValue === "") {
        //This one is for when the user doesn't set the filter on the homepage
        pool.getConnection(function(err, connection) {
            connection.query("SELECT *, DATE_FORMAT(yearEst, \"%d-%m-%Y\") as formYearEst, DATE_FORMAT(creationDate, \"%d-%m-%Y\") as formCreationDate FROM Business JOIN Category ON Category.categoryID=Business.categoryID  WHERE latitude < ? AND latitude > ? AND longitude > ? AND longitude <  ? ORDER BY Business.businessID DESC", [A_x, B_x, B_y, A_y], function (err, result) {
                if (err) {
                    res.json(err);
                }
                if (result.length > 0) {
                    res.json(result);
                } else {
                    res.json("No such business!");
                }
                connection.release();
            });
        });
    }else{
        //This one is for when the user sets the filter on the homepage
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM Business JOIN Category ON Category.categoryID=Business.categoryID WHERE categoryName = ? AND latitude < ? AND latitude > ? AND longitude > ? AND longitude <  ? ORDER BY Business.businessID DESC", [filterValue,A_x,B_x,B_y,A_y], function (err, result) {
                if (err){
                    res.json(err);
                }
                if (result.length > 0) {
                    res.json(result);
                } else {
                    res.json("No such business!");
                }
                connection.release();
            });
        });
    }
});

//This is for when the user sets the filter on the All Businesses page
router.post('/businessFilter', function(req, res){

    let filterValue = req.body.filterValue;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *, DATE_FORMAT(yearEst, \"%d-%m-%Y\") as formYearEst, DATE_FORMAT(creationDate, \"%d-%m-%Y\") as formCreationDate FROM Business JOIN Category ON Category.categoryID=Business.categoryID WHERE categoryName = ?", [filterValue], function (err, result) {
            if (!err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects a single business for the business profile page... based on which business is clicked into
router.post('/oneBusiness', function(req, res){

    let companyName = req.body.companyName;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *, DATE_FORMAT(yearEst, \"%d-%m-%Y\") as formYearEst, DATE_FORMAT(creationDate, \"%d-%m-%Y\") as formCreationDate FROM Business JOIN Category ON Category.categoryID=Business.categoryID  JOIN OpenHours ON Business.businessID = OpenHours.businessID  WHERE Business.companyName = ?", [companyName], function (err, result) {
            if (!err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects the businesses associated with the userID
router.post('/userBusiness', function(req, res){

    let userID = req.body.userID;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *,DATE_FORMAT(DOB, \"%Y-%m-%d\") as formYearEst2,DATE_FORMAT(yearEst, \"%Y-%m-%d\") as formYearEst3, DATE_FORMAT(yearEst, \"%d-%m-%Y\") as formYearEst, DATE_FORMAT(creationDate, \"%d-%m-%Y\") as formCreationDate FROM Business JOIN Category ON Category.categoryID=Business.categoryID  JOIN OpenHours ON Business.businessID = OpenHours.businessID JOIN Users ON Business.userID = Users.userID WHERE Business.userID = ?", [userID], function (err, result) {
            if (!err) {
                res.json(result);
            } else {
                res.json(err);
            }
            connection.release();
        });
    });
});

//Selects all reviews relating to the company name passed in
router.post('/businessReviews', function(req, res){

    let companyName = req.body.companyName;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *,DATE_FORMAT(ReviewDate, \"%d-%m-%Y\") as formReviewDate FROM Reviews JOIN Business ON Business.businessID=Reviews.businessID JOIN Users ON Reviews.userID=Users.userID WHERE Business.companyName = ? ORDER BY ReviewDate DESC", [companyName], function (err, result) {
            if (err) {
                res.json(err);
            }
            if (result.length > 0) {
                res.json(result);
            } else {
                res.json("No reviews found");
            }
            connection.release();
        });
    });
});

//Get the average rating for a business
router.post('/averageRating', function(req, res){

    let companyName = req.body.companyName;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT AVG(Stars) as starAverage FROM Reviews JOIN Business ON Business.businessID=Reviews.businessID WHERE Business.companyName = ?", [companyName], function (err, result) {
            if (err) {
                res.json(err);
            }

            if (result[0].starAverage === null) {
                res.json("No reviews found");
            }
            else if (result.length > 0) {
                res.json(result);
            } else {
                res.json("No reviews found");
            }
            connection.release();
        });
    });
});

//Used to Filter star rating of a specific business
router.post('/businessReviewsFiltered', function(req, res){

    let companyName = req.body.companyName;
    let starValue = req.body.filterValue;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *,DATE_FORMAT(ReviewDate, \"%d-%m-%Y\") as formReviewDate FROM Reviews JOIN Business ON Business.businessID=Reviews.businessID JOIN Users ON Reviews.userID=Users.userID WHERE Business.companyName = ? AND Reviews.Stars = ? ORDER BY ReviewDate DESC", [companyName, starValue], function (err, result) {
            if (err) {
                res.json(err);
            }
            if (result.length > 0) {
                res.json(result);
            } else {
                res.json("No reviews found");
            }
            connection.release();
        });
    });
});

//Used to filter star rating of a reviews
router.post('/recentReviewsFiltered', function(req, res){

    let starValue = req.body.filterValue;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT *,DATE_FORMAT(ReviewDate, \"%d-%m-%Y\") as formReviewDate FROM Reviews JOIN Business ON Business.businessID=Reviews.businessID JOIN Users ON Reviews.userID=Users.userID WHERE Reviews.Stars = ? ORDER BY ReviewDate DESC", [starValue], function (err, result) {
            if (err) {
                res.json(err);
            }
            if (result.length > 0) {
                res.json(result);
            } else {
                res.json("No reviews found");
            }
            connection.release();
        });
    });
});

module.exports = router;
