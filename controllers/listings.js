const Listing = require('../models/listing.js');
const axios = require('axios');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let lists = await Listing.find();
    res.render("listings/index.ejs", { lists });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res) => {

    const newListing = new Listing(req.body.listing);
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location ,
        limit: 1
    })
    .send();

    newListing.geometry=response.body.features[0].geometry;

    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success", "new listing added");
    res.redirect('/listings');

}

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('owner');
    if (!listing) { 
        req.flash("error", "Listing does not exists!");
        return res.redirect('/listings');
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', "Listing does not exists");
        return res.redirect('/listings');
    }
    let originalImgUrl = listing.image.url;
    originalImgUrl = originalImgUrl.replace("/upload", "/upload/ar_1.0,c_fill,h_100/bo_5px_solid_lightblue")
    console.log(originalImgUrl);
    res.render("listings/edit.ejs", { listing, originalImgUrl });
};

module.exports.editListing = async (req, res) => {

    let { id } = req.params;
    const listing = req.body.listing;

    console.log(listing);
    let list = await Listing.findByIdAndUpdate(id, listing);
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        list.image = { url, filename };
        await list.save();
    }
    console.log(list);

    req.flash("success", "Listing Edited!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;

    let data = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect('/listings');
};
