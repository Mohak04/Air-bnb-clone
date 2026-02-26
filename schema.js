const Joi=require('joi');

const listingSchema= Joi.object({ 
    listing: Joi.object({ // mtlb joi me object hogi listing name ki jisme ye sb conditions satisfy honi chahiye.
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required(),
        image: Joi.string().allow("",null)
    }).required(), // or lisitng object bhi compulsory chahiye hi.
});

const reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().min(1).max(5).required(),
        comment:Joi.string().required()
    }).required(),
});

module.exports={listingSchema,reviewSchema};

