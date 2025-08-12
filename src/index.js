import dotenv from 'dotenv'; 
import app from './app.js'; 



dotenv.config({
    path: "./.env", //looks for env file in all folders
});


const port = process.env.PORT || 3000; 


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`); 
})

