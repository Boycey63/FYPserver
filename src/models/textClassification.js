const express = require('express');
const router = express.Router();
const Classifier = require( 'wink-naive-bayes-text-classifier' );
const nlp = require( 'wink-nlp-utils' );
const fs = require('fs');
const readline = require('readline');

let nbc = Classifier();
let ended = false;
//Uncomment to when putting on server... Needs full path name on server
//let file = '/var/www/thelittleguysproject.me/src/public/data/trainingData.json';

//Uncomment when running on local host
let file = './src/public/data/trainingData.json';
let rawdata = fs.readFileSync(file,'utf8');
let parsedData = JSON.parse(rawdata);

//Used to keep track of when rating classes are full
let one, two, three, four, five;
one= two= three= four= five=0;


/*
    Overall used to divide up, save and train the machine learning models using the YELP data set

    The saveTrainingReviews function:
     (1) takes in the 4 gigabyte review file
     (2) opens up the reviewdata file
     (3) sets up configurations for the machine learning algorithm
     (4) reads the review file line by line and checks the star rating for that line
     (5) saves each used line into the reviewdata file
     (6) trains each used line into the algorithm
     (7) once each review class has reached 350000 reviews learned the data is exported to the training file
     (8) finally the files are closed
 */
let saveTrainingReviews = () => {
    //Open big review file
    let instream = fs.createReadStream('./src/public/data/review.json');

    let rl = readline.createInterface({
        input: instream,
        terminal: false
    });

    // Reads big file and learns based off it ... need to create new document...
    let numberOfReviews = 5261670;

    let i = 0;

    let reviewData = fs.openSync('./src/public/data/reviewdata.json', 'a');

    nbc.reset();

    nbc.definePrepTasks( [
        // Simple tokenizer
        nlp.string.tokenize0,
        // Common Stop Words Remover
        nlp.tokens.removeWords,
        // Stemmer to obtain base word
        nlp.tokens.stem
    ] );

    // Configure behavior
    nbc.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );


    rl.on('line', function(line) {
        let reviewString = JSON.parse(line);
        //438160 5261670
        let numberofReviewsTrained = 350000;
        if (!ended) {
            if(i < numberOfReviews) {
                //console.log(i);
                if( i === 0 ) {
                    fs.writeFileSync(reviewData, '{"review":\n' + '\t[');
                }
                if(one === numberofReviewsTrained && two === numberofReviewsTrained && three === numberofReviewsTrained && four === numberofReviewsTrained && five === numberofReviewsTrained ){
                    i = numberOfReviews + 1;
                    nbc.consolidate();
                    let variable = nbc.exportJSON();
                    let exportData = JSON.stringify(variable);
                    fs.writeFileSync(file, exportData);
                    res.json("Exported successfully!");
                    console.log(i);

                    console.log(one + " -> 1 star reviews");
                    console.log(two + " -> 2 star reviews");
                    console.log(three + " -> 3 star reviews");
                    console.log(four + " -> 4 star reviews");
                    console.log(five + " -> 5 star reviews");

                    fs.appendFileSync(reviewData, '\n\t]\n}');
                    fs.closeSync(reviewData);
                    ended =true;
                }
                console.log(i);
                if(parseInt(reviewString.stars) === 1 && one < numberofReviewsTrained){

                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    one++;
                    //console.log("One = "+one);
                }
                if(parseInt(reviewString.stars) === 2 && two < numberofReviewsTrained){
                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    two++;
                    //console.log("Two = "+two);
                }
                if(parseInt(reviewString.stars) === 3 && three < numberofReviewsTrained){
                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    three++;
                    //console.log("Three = "+three);
                }
                if(parseInt(reviewString.stars) === 4 && four < numberofReviewsTrained){
                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    four++;
                    //console.log("Four = "+four);
                }
                if(parseInt(reviewString.stars) === 5 && five < numberofReviewsTrained){
                    if( i === 0 ){
                        fs.appendFileSync(reviewData, '\n' + '\t\t{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                        nbc.learn(reviewString.text.trim(), reviewString.stars);
                    }else {
                        fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                        //nbc.learn(reviewString.text.trim(), reviewString.stars);
                    }
                    five++;
                    //console.log("Five = "+five);
                }
                i++;
            }
        }else{
            rl.close();
        }
    });
};

/*
    Same as above but only saves reviews with usefulness of over 4
 */

let saveTrainingReviewsUseful = () => {
    //Open big review file
    let instream = fs.createReadStream('./src/public/data/review.json');

    let rl = readline.createInterface({
        input: instream,
        terminal: false
    });

    // Reads big file and learns based off it ... need to create new document...
    let numberOfReviews = 5261668;

    let i = 0;
    let useful = 4;

    let reviewData = fs.openSync('./src/public/data/reviewdatauseful2.json', 'a');

    nbc.reset();

    nbc.definePrepTasks( [
        // Simple tokenizer
        nlp.string.tokenize0,
        // Common Stop Words Remover
        nlp.tokens.removeWords,
        // Stemmer to obtain base word
        nlp.tokens.stem
    ] );

    // Configure behavior
    nbc.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );


    rl.on('line', function(line) {
        let reviewString = JSON.parse(line);
        //438160 5261670
        let numberofReviewsTrained = 55000;

        if( i === 0 ) {
            fs.writeFileSync(reviewData, '{"review":\n' + '\t[');
        }

        if (!ended) {
            if(i < numberOfReviews) {
                if(one === numberofReviewsTrained && two === numberofReviewsTrained && three === numberofReviewsTrained && four === numberofReviewsTrained && five === numberofReviewsTrained ){
                    nbc.consolidate();
                    let variable = nbc.exportJSON();
                    let exportData = JSON.stringify(variable);
                    fs.writeFileSync(file, exportData);
                    console.log("Exported successfully!");
                    console.log(one + " -> 1 star reviews");
                    console.log(two + " -> 2 star reviews");
                    console.log(three + " -> 3 star reviews");
                    console.log(four + " -> 4 star reviews");
                    console.log(five + " -> 5 star reviews");
                    fs.appendFileSync(reviewData, '\n\t]\n}');
                    fs.closeSync(reviewData);
                    ended =true;
                }
                if(parseInt(reviewString.stars) === 1 && parseInt(reviewString.useful) >= useful && one < numberofReviewsTrained){
                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) + ',"useful":' + JSON.stringify(reviewString.useful) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    one++;
                    //console.log("One = "+one);
                }
                if(parseInt(reviewString.stars) === 2 && parseInt(reviewString.useful) >= useful && two < numberofReviewsTrained){
                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) + ',"useful":' + JSON.stringify(reviewString.useful) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    two++;
                    //console.log("Two = "+two);
                }
                if(parseInt(reviewString.stars) === 3 && parseInt(reviewString.useful) >= useful && three < numberofReviewsTrained){
                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) + ',"useful":' + JSON.stringify(reviewString.useful) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    three++;
                    //console.log("Three = "+three);
                }
                if(parseInt(reviewString.stars) === 4 && parseInt(reviewString.useful) >= useful && four < numberofReviewsTrained){
                    fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) + ',"useful":' + JSON.stringify(reviewString.useful) +'}');
                    nbc.learn(reviewString.text.trim(), reviewString.stars);
                    four++;
                    //console.log("Four = "+four);
                }
                if(parseInt(reviewString.stars) === 5 && parseInt(reviewString.useful) >= useful && five < numberofReviewsTrained){
                    if( i === 0 ){
                        fs.appendFileSync(reviewData, '\n' + '\t\t{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) + ',"useful":' + JSON.stringify(reviewString.useful) +'}');
                        nbc.learn(reviewString.text.trim(), reviewString.stars);
                    }else {
                        fs.appendFileSync(reviewData, '\n' + '\t\t,{"review_id":'+ JSON.stringify(reviewString.review_id)+ ',"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) + ',"useful":' + JSON.stringify(reviewString.useful) +'}');
                        nbc.learn(reviewString.text.trim(), reviewString.stars);
                    }
                    five++;
                    //console.log("Five = "+five);
                }
                i++;
            }
            console.log(i);
        }else{
            rl.close();
        }
    });
};


/*
    Overall used to get the the remaining unused reviews from the YELP data set

    The saveTestReviews function:
     (1) takes in the 4 gigabyte review file
     (2) opens up the testdata file
     (3) each line of the review file is read
     (4) increments i until it reaches where the saveTrainingReviews function finished
     (5) save each line once i = the above point
     (6) the testdata file is closed once each class reaches 85000 (the minimum amount to have an even amount of review in each class)
 */
let saveTestReviews = () => {
    //Open big review file
    let instream = fs.createReadStream('./src/public/data/review.json');

    let rl = readline.createInterface({
        input: instream,
        terminal: false
    });

    // Reads big file and learns based off it ... need to create new document...
    let numberOfReviews = 5261669;
    let i = 0;

    let reviewData = fs.openSync('./src/public/data/testdata.json', 'a');

    rl.on('line', function(line) {
        let reviewString = JSON.parse(line);
        //438160 5261670
        let numberofReviewsforTesting = 4194867;
        let reviewToSave = 85000;

        if (!ended) {
            if(i < numberOfReviews) {
                console.log(i);
                if(i >= numberofReviewsforTesting) {
                    if(one === reviewToSave && two === reviewToSave && three === reviewToSave && four === reviewToSave && five === reviewToSave ){
                        i = numberOfReviews + 1;
                        console.log(one + " -> 1 star reviews");
                        console.log(two + " -> 2 star reviews");
                        console.log(three + " -> 3 star reviews");
                        console.log(four + " -> 4 star reviews");
                        console.log(five + " -> 5 star reviews");

                        fs.closeSync(reviewData);
                        ended =true;
                    }

                    if (parseInt(reviewString.stars) === 1 && one < reviewToSave) {
                        fs.appendFileSync(reviewData,'\n' + '{"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                        one++;
                        //console.log("One = "+one);
                    }
                    if (parseInt(reviewString.stars) === 2 && two < reviewToSave) {
                        fs.appendFileSync(reviewData,'\n' + '{"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                        two++;
                        //console.log("Two = "+two);
                    }
                    if (parseInt(reviewString.stars) === 3 && three < reviewToSave) {
                        fs.appendFileSync(reviewData,'\n' + '{"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                        three++;
                        //console.log("Three = "+three);
                    }
                    if (parseInt(reviewString.stars) === 4 && four < reviewToSave) {
                        fs.appendFileSync(reviewData,'\n' + '{"stars":' + JSON.stringify(reviewString.stars)+ ',"text":' + JSON.stringify(reviewString.text) +'}');
                        four++;
                        //console.log("Four = "+four);
                    }
                    if (parseInt(reviewString.stars) === 5 && five < reviewToSave) {
                        if(i === numberofReviewsforTesting) {
                            fs.appendFileSync(reviewData, '{"stars":' + JSON.stringify(reviewString.stars) + ',"text":' + JSON.stringify(reviewString.text) + '}');
                        }else {
                            fs.appendFileSync(reviewData, '\n' + '{"stars":' + JSON.stringify(reviewString.stars) + ',"text":' + JSON.stringify(reviewString.text) + '}');
                        }
                        five++;
                        //console.log("Five = "+five);
                    }
                }
                i++;
            }
        }else{
            rl.close();
        }
    });
};
/*
    Overall used to test the remaining unused reviews against the machine learning model

    The runTest function:
    (1) opens the testdata file (remaining reviews that weren't used to train the model)
    (2) opens the testresults file (where the results will be stored)
    (3) reads each line of the testdata, predicts the rating, compares it to the YELP rating and increments the right variably
    (4) saves variable values into testresults
    (5) closes all files

*/
let runTest = () => {
    //Open big review file
    let instream = fs.createReadStream('./src/public/data/testdata.json');

    let rl = readline.createInterface({
        input: instream,
        terminal: false
    });

    let i = 0;
    let positiveTest = 0;
    let negativeTest = 0;
    let numberOfline = 425000;
    //let numberOfline = 2000;

    let testResults = fs.openSync('./src/public/data/testResults3.json', 'a');
    //let testResults = fs.openSync('./src/public/data/testResults2.json', 'a');

    rl.on('line', function (line) {
        if (!ended) {
            let reviewString = JSON.parse(line);

            console.log(i);
            if (i < numberOfline) {
                let predictedClass = nbc.predict(JSON.stringify(reviewString.text));

                if (predictedClass === JSON.stringify(reviewString.stars)) {
                    positiveTest++;
                } else {
                    negativeTest++;
                }
                i++;
            }

            if (i === numberOfline) {
                fs.appendFileSync(testResults, 'Matching result scores >> ' + positiveTest);
                fs.appendFileSync(testResults, '\n' + 'Non Matching result scores >> ' + negativeTest);

                console.log("Pos >> " + positiveTest);
                console.log("Neg >> " + negativeTest);
                ended = true;
            }
        } else {
            rl.close();
        }
    });
};


//Any functions above this code are not run on website
nbc.reset();

nbc.definePrepTasks( [
    // Simple tokenizer
    nlp.string.tokenize0,
    // Common Stop Words Remover
    nlp.tokens.removeWords,
    // Stemmer to obtain base word
    nlp.tokens.stem,
] );

// Configure behavior
nbc.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );

//For importing the JSON
nbc.importJSON(parsedData);
nbc.consolidate();

//runTest();

//Function used to train new review data from user
let trainReviewData = (reviewText, starRating) =>{
    nbc.importJSON(parsedData);
    nbc.learn(reviewText, starRating);
    nbc.consolidate();
    let variable = nbc.exportJSON();
    let exportData = JSON.stringify(variable);
    fs.writeFileSync(file, exportData);
    nbc.importJSON(parsedData);
    nbc.consolidate();
};

//Predicts the income data from user
router.post('/test', function(req, res) {
    let predictedClass = nbc.predict(req.body.text);
    trainReviewData(req.body.text, predictedClass);
    res.json(predictedClass);
});

//Used to export the consolidated training data to a JSON file
router.post('/export', function(req, res) {
    nbc.consolidate();
    let variable = nbc.exportJSON();
    let exportData = JSON.stringify(variable);
    fs.writeFileSync(file, exportData);
    res.json("Exported successfully!");
});

//Used ny admit to add a review and a star rating to learn
router.post('/train', function(req, res) {
    nbc.importJSON(parsedData);
    nbc.learn(req.body.text, req.body.starRating);
    nbc.consolidate();
    let variable = nbc.exportJSON();
    let exportData = JSON.stringify(variable);
    fs.writeFileSync(file, exportData);
    res.json("Exported successfully!");
});

module.exports = router;