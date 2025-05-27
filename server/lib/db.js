import mongoose from "mongoose";

// function to coonect mongodb database
export const connectDB=async()=>{
    try {
        mongoose.connection.on('connected',()=>console.log('database connected !..'));
        
         await mongoose.connect(`${process.env.MONOGODB_URI}/chat-app`)
    } catch (error) {
         console.log(error);
         
    }
}