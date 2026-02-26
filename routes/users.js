const express=require('express');
const router=express.Router();
const passport = require('passport');
const {saveRedirectUrl}=require('../middleware.js');
const userController=require('../controllers/users.js');

router.route('/signup')
.get(userController.signUpPage)
.post(userController.signUp);

router.route('/login')
.get(userController.loginPage)
.post(saveRedirectUrl,passport.authenticate("local",   
     {failureRedirect: "/users/login",
      failureFlash:true,}), //Passport always uses "error", you can’t change that key.
      userController.login);

router.get('/logout',userController.logout);

module.exports=router;