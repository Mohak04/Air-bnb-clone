const Listing=require('./models/listing.js');
const Review = require('./models/review.js');
const {listingSchema,reviewSchema}=require('./schema.js');
const ExpressError=require('./utils/ExpressError.js');

module.exports.isLoggedin = (req,res,next)=>{
    // console.log(req.path, "  ", req.originalUrl)
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl; //ye middleware konsi req se trigger hua uska path
        console.log(req.session.redirectUrl);
        req.flash("error","User must be logged in");
        return res.redirect("/users/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    // console.log(listing);
    // console.log(listing.owner," ",res.locals.currUser);
    if(res.locals.currUser && !res.locals.currUser._id.equals(listing.owner)){
        req.flash("error","You don't have permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing = (req,res,next)=>{
 
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(',');
        throw new ExpressError(400,errMsg);
    }
    else{
        return next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(',');
        throw new ExpressError(400,errMsg);
    }
    else{
        return next();
    }
};

module.exports.isAuthor=async (req,res,next)=>{
    let{id,reviewId}=req.params;
    let review=await Review.findById(reviewId);

    if(res.locals.currUser && !res.locals.currUser._id.equals(review.author)){
        req.flash("error","you don't have permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
}