if(process.env.NODE_ENV != "production")
{
    require('dotenv').config()
    console.log(process.env.name)
}

const express=require("express");
const app=express();
const port=3000;
const mongoose=require("mongoose");
const Listing=require("./models/listings.js");
const path=require("path");
const methodOverride=require("method-override");
const ExpressError=require("./ExpressError.js");
let listingSchema=require('./Schema.js');
let {reviewSchema}=require("./Schema.js");
const Reviews=require("./models/reviews.js");
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.use(express.json());
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
app.use(express.json()); 
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const contollerListing=require("./controllers/listing.js")
//file uploading
const multer  = require('multer')
const dburl=process.env.ATLASDB_URL;

const {storage}=require("./cloudConfig.js")
const upload = multer({ storage })


main().then((res)=>{
    console.log("connection sucessfull");
})
.catch((err)=>{
    console.log(err);
});
async function main()
    {
        await mongoose.connect(dburl);
    }

//middleware for cookie
const cookieParser=require("cookie-parser");  //for accesing the cookie
app.use(cookieParser());

function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    }
}

//Router route
//router.route("/")
//.get
//.post

const store= MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600
})

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

//express-session
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httponly:true,
    },
}
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//middleware for initializing and should be implemented after session only
app.use(passport.session());//middleware that does not cause to user to login again while navigating diff pages//stores a session
passport.use(new LocalStrategy(User.authenticate()));//static met added by passport-local-mongoose

passport.serializeUser(User.serializeUser());//serializes user to session//stores info
passport.deserializeUser(User.deserializeUser());//deserializes

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    next();
})

//ROUTER
const users=require("./routes/users.js");
app.use("/users",users);
//ROUTER
const login=require("./routes/login.js");
app.use("/login",login);

const validateListing=(req,res,next)=>{
    // console.log(req.body);
    let result=listingSchema.validate(req.body);
    if(result.error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }
    else
    {
        next();
    }
}

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }
    else
    {
        next();
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
//store into local variable since passport resets the req.session.redirecturl
const redirectURL=(req,res,next)=>{
    if(req.session.redirectURL){
    res.locals.redirectURL=req.session.redirectURL;
    }
    next();
};

const isowner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(res.locals.curruser && !listing.owner._id.equals(res.locals.curruser._id))
    {
        req.flash("error","you do not have the authority to edit this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

const isreviewAuthor=async(req,res,next)=>{
    let {reviewId}=req.params;
    let review=await Reviews.findById(reviewId);
    if(res.locals.curruser && !review.author.equals(res.locals.curruser._id))
    {
        req.flash("error","you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

app.listen(port,(req,res)=>{
    console.log("listening to port 3000");
})

//Authenticate
// app.get("/demouser",async(req,res)=>{
//     const newuser= new User({
//         email:"ron@gmail.com",
//         username:"ron",
//     })

//     let registereduser=await User.register(newuser,"helloworld");
//     res.send(registereduser);
// })

app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.post("/signup",asyncWrap(async(req,res)=>{
    try{
    let {email,password,username}=req.body;
    const newuser=new User({email,username});
    let redistered=await User.register(newuser,password);
    req.login(redistered,(err)=>{
        if(err)
            {
                return next(err);
            }
            req.flash("success","welcome to Airbnb");
            res.redirect("/");
    })
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err)
        {
            return next(err);
        }
        req.flash("success","logged out!");
        res.redirect("/");
    })
})

app.get("/",contollerListing.list);

app.get("/listings/new",isLoggedIn,(req,res)=>{
    try{
        res.render("new.ejs");
    }
    catch(err){
        throw new ExpressError(404,"Page not found");
    }
});

app.get("/listings/:id",contollerListing.show);

app.post("/",isLoggedIn,upload.single('listing[image][url]'),contollerListing.add);

app.get("/:id/edit",isLoggedIn,isowner,asyncWrap(async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id);
    if(!list)
        {
            req.flash("error","listing does not exist");
            res.redirect("/");
        }
    let ori=list.image.url;
    ori=ori.replace("/upload","/upload/c_fill,h_250,w_250/e_blur:200");
    res.render("edit.ejs",{list,ori});
}))

app.put("/:id",isLoggedIn,isowner,upload.single('listing[image][url]'),asyncWrap(async (req,res)=>{
   
    let {id}=req.params;
    if(!req.body.listing)
    {
        throw new ExpressError(400,"send proper data");
    }
    const updatedlisting=await Listing.findByIdAndUpdate((id),{...req.body.listing});
    if(typeof req.file!="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    updatedlisting.image={url,filename};
    updatedlisting.save();
    }
    req.flash("success","Successfully updated listing");
    res.redirect(`/listings/${id}`);
}))

app.delete("/:id",isLoggedIn,isowner,asyncWrap(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Successfully deleted listing");
    res.redirect("/");
}))

app.post("/reviews/:id",isLoggedIn,asyncWrap(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let rev=new Reviews(req.body.review);
    rev.author=req.user._id;
    listing.reviews.push(rev);
    await rev.save();
    await listing.save();
    req.flash("success","Successfully added new review");
    res.redirect(`/listings/${req.params.id}`);
    }))

app.delete("/reviews/:id/:reviewId",isLoggedIn,isreviewAuthor,asyncWrap(async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Reviews.findByIdAndDelete(reviewId);
    req.flash("success","Successfully deleted review");
    res.redirect(`/listings/${id}`);
}))


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found"));
})

app.use((err,req,res,next)=>{
    let {status=500,message="something went wrong"}=err;
    res.status(status).render("error.ejs",{err});
})

