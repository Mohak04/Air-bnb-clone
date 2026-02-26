if(process.env.NODE_ENV!="production"){
    require('dotenv').config();  //reads env, or ek br app chalu hogaya to fir baki files bhi .env access kr skti
}

const express=require("express");
const app=express();

const ExpressError=require('./utils/ExpressError.js');

const ejsMate=require('ejs-mate');  //like includes
app.engine("ejs",ejsMate);

const methodOverride=require('method-override');
app.use(methodOverride("_method"));

const session=require('express-session');
const MongoStore=require('connect-mongo').default;
const flash=require('connect-flash');

const path=require('path');

const mongoose=require('mongoose');
const listingRouter=require('./routes/listings.js');
const reviewRouter=require('./routes/reviews.js');
const userRouter=require('./routes/users.js');

const User=require('./models/users.js');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const { Session } = require('inspector');

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true})); //This line tells Express to read data coming from HTML forms and convert it into req.body.

let dbUrl=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("Connection successful");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}


// app.get('/',(req,res)=>{
//     res.send("Working");
// })


const store= MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("error",()=>{
    console.log("Error in mongo store",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');  //this make these variable available for all ejs files
    res.locals.currUser=req.user;
    next();
})

// app.get('/demouser',async (req,res)=>{
//     let newUser=new User({
//         email:"mohak@nimje",
//         username:"mohak_nimje"
//     })

//     let registeredUser=await User.register(newUser,"helloworld");
//     res.send(registeredUser);
// })


app.use('/listings',listingRouter);
app.use('/listings/:id/reviews',reviewRouter);
app.use('/users',userRouter);


// if in case any routes not matched then

// app.use((res,req)=>{
//     throw new ExpressError(404,"Page not found");
// })

//or


app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});


app.use((err,req,res,next)=>{
    let {status=500,message}=err;
    res.render("listings/error.ejs",{message});
});

let port=8080;
app.listen(port,()=>{
    console.log(`listening on ${port}`);
});