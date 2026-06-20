const User=require('../models/users.js');

module.exports.signUpPage=(req,res)=>{
    res.render('users/signup.ejs');
};

module.exports.signUp=async (req,res,next)=>{
    try{
        let {username,email,password}=req.body;
        const newUser=new User({username,email});
        const registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success",`Welcome @${registeredUser.username} to wanderlust`);
            res.redirect('/listings');
        });
    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("/users/signup");
    }
};

module.exports.loginPage=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=async (req,res)=>{
    req.flash("success",`Welcome ${req.user.username} to wanderlust`);
    
    let Url=res.locals.redirectUrl || '/listings'; 
    res.redirect(Url);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged out successfully");
        return res.redirect('/listings');
    })
};
