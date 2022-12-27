const express = require("express");
const fs = require("fs");
const date = require(__dirname + "/date.js");

const app = express();

const STORAGE_DIRECTORY = "storage" ;
const STORAGE_FILE_NAME = "items" ;
const STORAGE_FILE_PATH = STORAGE_DIRECTORY + "/" + STORAGE_FILE_NAME ;
const STORAGE_WORK_FILE_NAME = "work-items" ;
const STORAGE_WORK_FILE_PATH = STORAGE_DIRECTORY + "/" + STORAGE_WORK_FILE_NAME ;
const SPLIT_CARACTER = "\n" ;

const WORK_LIST_TITLE = "work"


let items = [];
let workItems = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));

app.post("/", (req, res) => {
    const item = SPLIT_CARACTER + req.body.newItem ;
    const options = {
        flag : "a"
    };

    if(req.body.list === WORK_LIST_TITLE){
        fs.writeFileSync(STORAGE_WORK_FILE_PATH, item, options);

        res.redirect("/work");
    }else{
        fs.writeFileSync(STORAGE_FILE_PATH, item, options);

        res.redirect("/");
    }

    
})

app.get("/", (req, res) => {
   
    const day = date.getDate();

    items = fs.readFileSync(STORAGE_FILE_PATH).toString().split(SPLIT_CARACTER);

    res.render("list", {listTitle : day, items : items});
})

app.get("/work", (req, res) => {
    workItems = fs.readFileSync(STORAGE_WORK_FILE_PATH).toString().split(SPLIT_CARACTER);

    res.render("list", {listTitle : WORK_LIST_TITLE, items : workItems});
})


app.listen(3000, () => {
    console.log("Server running on port 3000");
});