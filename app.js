const express = require("express");
const fs = require("fs");

const app = express();

const STORAGE_FILE_NAME = "items" ;
const SPLIT_CARACTER = "\n" ;

let items = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));

app.post("/", (req, res) => {
    let item = SPLIT_CARACTER + req.body.newItem ;
    let options = {
        flag : "a"
    };

    fs.writeFileSync(STORAGE_FILE_NAME, item, options);

    res.redirect("/");
})

app.get("/", (req, res) => {
    let today = new Date();

    let options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    };

    let day = today.toLocaleDateString("fr-FR", options);

    items = fs.readFileSync(STORAGE_FILE_NAME).toString().split(SPLIT_CARACTER);

    res.render("list", {day : day, items : items});
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});