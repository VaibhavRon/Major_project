const express=require("express");
const router=express.Router({mergeParams:true});//to pass parameter to child route
const path=require("path");
const User=require("../models/user.js");
const contollerListing=require("../controllers/login.js")
const passport=require("passport");

const redirectURL=(req,res,next)=>{
    if(req.session.redirectURL){
    res.locals.redirectURL=req.session.redirectURL;
    }
    next();
};
router.get("/hello",(req,res)=>{
    console.log("hiiiii");
})
router.route("/")
.get(contollerListing.renderlogin)
.post(redirectURL,passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),contollerListing.login);

module.exports=router;