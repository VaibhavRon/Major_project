const express=require("express");
const router=express.Router({mergeParams:true});//to pass parameter to child route
const path=require("path");

const cookieParser=require("cookie-parser");  //for accesing the cookie
router.use(cookieParser("secretcode"));


//for cookie example

router.get("/",(req,res)=>{
    res.send("hello world");
})
router.get("/cookies",(req,res)=>{
    res.cookie("vaibhav","ron");
    res.send("hi");
})
router.get("/show",(req,res)=>{
    console.dir(req.cookies);
    res.send("showing");
})
router.get("/getsignedcookie",(Req,res)=>{
    res.cookie("madeIn","India",{signed:true});
    res.send("signed cookie sent");
})
router.get("/verify",(req,res)=>{
    console.log(req.signedCookies);
    res.send("verified");
})
module.exports=router;