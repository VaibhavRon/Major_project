module.exports.login=(req,res)=>{
    req.flash("success","welcome to Airbnb,you are logged in!");
    if(res.locals.redirectURL){
    res.redirect(res.locals.redirectURL);
    }
    else
    {
        res.redirect("/");
    }
}

module.exports.renderlogin=(req,res)=>{
    res.render("login.ejs");
}