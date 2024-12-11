const mongoose=require("mongoose");
const Reviews=require("./reviews.js");
const schema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        filename:{
            type:String,
        },
        url:{
            type:String,
        default:"https://i.pinimg.com/736x/b4/60/0b/b4600b612afa7af00e1d68783d8ea21a.jpg",
        set:(v)=>v===""? "https://i.pinimg.com/736x/b4/60/0b/b4600b612afa7af00e1d68783d8ea21a.jpg":v,
        },
    },
    price:{
        type:Number,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
          type: [Number],
        }
      }
});
schema.post("findOneAndDelete",async(listing)=>{
    if(listing.reviews.length)
    {
        let res=await Reviews.deleteMany({_id: {$in:listing.reviews}});
        console.log(res);
    }
})


const Listing=mongoose.model("Listing",schema);
module.exports=Listing;