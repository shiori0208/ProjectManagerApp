import dotenv from 'dotenv'; //DONOT USE DOUBLE QUOTES FOR PACKAGE NAMES, IT TAKES IT AS STRING!!!

dotenv.config({
    path: "./.env", //looks for env file in all folders
});

let myusername = process.env.name;
//lets you access any data in env files 

console.log("value: ", myusername);

console.log("Starting backend AYYY lessgo");
