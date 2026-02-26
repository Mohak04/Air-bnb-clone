const express=require('express');
const router=express.Router();
const wrapAsync=require('../utils/wrapAsync.js');
const {isLoggedin,isOwner,validateListing}=require('../middleware.js');
const listingController=require('../controllers/listings.js');
const multer=require('multer');
const {storage}=require('../cloudConfig.js');
const Listing = require('../models/listing.js');
const upload=multer({storage});

//index route && //create listing route
router.route('/')
.get(wrapAsync(listingController.index))
.post(validateListing,upload.single('listing[image]'),wrapAsync(listingController.createListing));


//new route
router.get('/new',isLoggedin,listingController.renderNewForm);

//show route && //edit listing
router.route('/:id')
.get(wrapAsync(listingController.showListings))
.patch(validateListing,upload.single('listing[image]'),wrapAsync(listingController.editListing));


//edit route 
router.get('/edit/:id',isLoggedin,isOwner,wrapAsync(listingController.renderEditForm));

//delete route
router.delete('/delete/:id',isLoggedin,isOwner,wrapAsync(listingController.deleteListing));

router.post('/search',async(req,res)=>{
    let dest=req.body.destination;
    
     // Prevent single character search
    if (dest.length < 2) {
        return res.send("Type at least 2 characters");
    }

    // Smart regex:
    const regex = new RegExp(dest.replace(/\s+/g, ".*"), "i");

    let listings = await Listing.find({
        $or: [
            { location: regex },
            { country: regex },
            { title: regex }
        ]
    });

    if(!listings.length){
        req.flash("error",`No listings matched for "${dest}"`);
        return res.redirect('/listings');
    }
    else{
        req.flash("success",`Searched results for ${dest}`);
        return res.render("listings/search.ejs",{listings});
    }

})

module.exports=router;