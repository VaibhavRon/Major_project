const mongoose=require("mongoose");

const reviewSchema=new mongoose.Schema({
    comment:{
        type:String,
    },
    rating:{
        type:Number,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
})

const Review=mongoose.model("Review",reviewSchema);

module.exports=Review;