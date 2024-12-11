const express=require("express");
const app=express();
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
//express session
const session=require("express-session");
app.use(session(
    {secret:"mysupersecretstring",
        resave:false,
        saveUninitialized:true,
    }));//any get,post,delete req will be saved with a sessionid in the form of cookie

const flash=require("connect-flash");
app.use(flash());
//for stateful protocol response can be diff even when save req is made

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})
app.get("/getcount",(req,res)=>{
    if(req.session.count)
    {
        req.session.count++;
    }
    else
    {
        req.session.count=1;
    }
    res.send(`you sent a req ${req.session.count} times`);
})
//session work is to save useful session info so that can be used again
app.get("/register",(req,res)=>{
    let{ name ="anonymous"}=req.query;
    req.session.name=name;
    if(name=="anonymous")
    {
        req.flash("error","user not registered");
    }
    else{
        req.flash("success","user registered successfully");
    }
    res.redirect("/hello");
    
})
app.get("/hello",(req,res)=>{
    res.render("page.ejs",{name:req.session.name});
})

app.listen(3000,()=>{
    console.log("listening to port 3000");
})