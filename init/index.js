const mongoose=require("mongoose");
const Listing=require("../models/listings.js");
const initdata=require("./data.js");

main().then((res)=>{
    console.log("connection sucessfull");
})
.catch((err)=>{
    console.log(err);
});
async function main()
    {
        await mongoose.connect("mongodb://127.0.0.1:27017/airbnb");
    }

    const initDB = async () => {
        await Listing.deleteMany({});
        initdata.data=initdata.data.map((obj)=>({...obj,owner:'67494ab84de85e837cc37a79'}))
        await Listing.insertMany(initdata.data);
        console.log("data was initialized");
      };
      
      initDB();