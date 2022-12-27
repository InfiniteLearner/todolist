const express = require("express");
const fs = require("fs");

const app = express();

const STORAGE_FILE_NAME = "items" ;
const SPLIT_CARACTER = "\n" ;

var items = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));

app.post("/", (req, res) => {
    var item = SPLIT_CARACTER + req.body.newItem ;
    var options = {
        flag : "a"
    };

    fs.writeFileSync(STORAGE_FILE_NAME, item, options);

    res.redirect("/");
})

app.get("/", (req, res) => {
    var today = new Date();

    var options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    };

    var day = today.toLocaleDateString("fr-FR", options);

    items = fs.readFileSync(STORAGE_FILE_NAME).toString().split(SPLIT_CARACTER);

    res.render("list", {day : day, items : items});
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});