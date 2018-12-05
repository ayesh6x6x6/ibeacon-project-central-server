var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var verifyToken = require('./VerifyToken');
var cycle = 0;
var [r,g,b] = [0,0,0];

router.post('/register', function(req, res) {
    if(cycle == 0){
      r = Math.floor(Math.random()*256);          // Random between 0-255
      g = Math.floor(Math.random()*256);          // Random between 0-255
      b = 255;  
      cycle = 1; 
    } else if(cycle == 1) {
      r = Math.floor(Math.random()*256);          // Random between 0-255
      g = 255;   
      b = Math.floor(Math.random()*256);          // Random between 0-255
      cycle = 2;
    } else {
      r = 255;   
      g = Math.floor(Math.random()*256);          // Random between 0-255
      b = Math.floor(Math.random()*256);          // Random between 0-255
      cycle = 0;
    }
    console.log('Received a request!');
    if(req.body.password!= ""){

          var hashedPassword = bcrypt.hashSync(req.body.password, 8);

          User.create({
            username : req.body.username,
            email : req.body.email,
            password : hashedPassword,
            picture: req.body.picture,
            favItems: [],
            orderHistory: [],
            r:r,
            g:g,
            b:b
          },
          function (err, user) {
            if (err) return res.status(500).send("There was a problem registering the user.")
            // create a token
            var token = jwt.sign({ id: user._id }, config.secret, {
              expiresIn: 86400 // expires in 24 hours
            });
            
      
            console.log("Created a user!");
            res.status(200).send({ auth: true, token: token });
          }); 

    } else {
      var found = false;
      User.findOne({email:req.body.email},(err,ress)=>{
        if(ress){
          console.log('User exists');
        } 
      });
      if(found == false){
        User.create({
          username : req.body.username,
          email : req.body.email,
          password: "",
          picture:req.body.picture,
          favItems: [],
          orderHistory: [],
          r:r,
          g:g,
          b:b
        },
        function (err, user) {
          if (err) return res.status(500).send("There was a problem registering the user.")
          // create a token
          var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          
    
          console.log("Created a user!");
          res.status(200).send({ auth: true, token: token });
        }); 
      }
    }

});


router.post('/login', function(req, res) {
  console.log('Login attempt!');
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    console.log(user);
    if(user.password!=""){
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
      console.log('Inside password');
    }
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).json({ auth: true, token: token, username: user.username, email: user.email });
  });
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});


module.exports = router;