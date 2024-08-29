var express = require('express');
var router = express.Router();

// FAILURE DETECTOR DASHBOARD
router.get('/', function (req, res, next) {
    if(req.query.secret == 'mysecret'){
        res.render("failure-detector", {
            title: "FAILURE DETECTOR DASHBOARD"
        });
    }else res.render('error');
});

module.exports = router;