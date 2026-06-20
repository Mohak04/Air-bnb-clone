require("dotenv").config({path:'../.env'}); 
const mongoose=require('mongoose');
const initData=require('./data.js');
const Listing=require('../models/listing.js');
const { init } = require('../models/review.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

main()
.then(()=>{
    console.log("Connection successful");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB=async()=>{
    await Listing.deleteMany({});

    for(listing of initData.data){
        let res=await geocodingClient.forwardGeocode({
        query:listing.location,
        limit:1,
     })
     .send();
     listing.geometry=res.body.features[0].geometry;
     listing.owner="6985ed7989dac99c2ee9250b";
    }

    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}
initDB();
