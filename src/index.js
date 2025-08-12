import dotenv from 'dotenv'; 
import app from './app.js'; 
import connectDB from './db/mongoose.js';



dotenv.config({
    path: "./.env", //looks for env file in all folders
});


const port = process.env.PORT || 3000; 


connectDB()
.then(() => {
  app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`); 
  }); 
})
.catch((err) => {
  console.error("MongoDB connect error", err);
  process.exit(1);
})
