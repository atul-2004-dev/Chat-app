import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//create express app and http server

const app=express();
const server=http.createServer(app);

// initialize socket.io

export const io= new Server(server,{
    cors:{origin:"*"}
})
// store online
export const userSocketMap={};  // {iuserid:socket}
 // socket handler
 io.on("connection",(socket)=>{
     const userId=socket.handshake.query.userId;
     console.log("User connected",userId);
     if(userId) userSocketMap[userId]=socket.id;

  io.emit("getonlineUsers",Object.keys(userSocketMap));

  socket.on("disconnect",()=>{
    console.log("user disconnected",userId);
    delete userSocketMap[userId];
    io.emit("getonlineUsers",Object.keys(userSocketMap))
    
  })

 })

//middleware

app.use(express.json({limit:"4mb"}));
app.use(cors());
// routrs setup
app.use("/api/status",(req,res)=>res.send("server is live"));
 app.use("/api/auth",userRouter)
 app.use("/api/messages",messageRouter)
// connect to dabase
await connectDB();



if(process.env.NODE_ENV!=="production"){

const PORT =process.env.PORT || 5000;
server.listen(PORT,()=>console.log("Server is running on : "+PORT));
}
// export server for versel
export default server;

