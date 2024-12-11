const Listing=require("../models/listings.js");
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxgeocoding({ accessToken:mapToken });

function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    }
}
const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.redirectURL=req.originalUrl;
        req.flash("error","please login");
        res.redirect("/login");
    }
    else
    {
        next();
    }
}

module.exports.list=asyncWrap(async(req,res)=>{
    let listings=await Listing.find();
    // console.log(listings);
    // console.log(require('./models/Schema.js'));
    // console.log(listingSchema);
    res.render("list.ejs",{listings});
})

module.exports.show=asyncWrap(async (req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id).populate({path:"reviews",populate:"author"}).populate("owner");
    if(!list)
    {
        req.flash("error","listing does not exist");
        res.redirect("/");
    }
    res.render("show.ejs",{list});
})

module.exports.add=asyncWrap(async(req,res,next)=>{
    // if(!req.body.listing)
    // {
    //     throw new ExpressError(400,"send valid data");
    // }
    // let result=listingSchema.validate(req.body);
    // console.log(result);

    let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
    .send();

    let url=req.file.path;
    let filename=req.file.filename;   //saves the link of the cloudinary url
    console.log(url,"..",filename);

    const newlisting=new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    newlisting.image={url,filename};
    newlisting.geometry=response.body.features[0].geometry;
    console.log(newlisting);
    await newlisting.save()
    req.flash("success","Successfully added new listing");
    res.redirect("/");
    
})