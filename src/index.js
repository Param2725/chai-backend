import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { mongo } from "mongoose";
import { app } from "./app.js";

dotenv.config({
    path: './env'
});

connectDB()

.then(() => {
    app.listen(process.env.PORT || 8000 ,() => {
        console.log(`server is running on port : ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log("MONGO db connection fail!!" , err);
    
})