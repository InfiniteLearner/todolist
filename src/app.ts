import express, {Express, Request, Response } from "express";
import mongoose, { CallbackError, Document, model, Schema } from "mongoose";
import {getDate} from "../modules/date.js";

/* Set up app and db */

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

console.log("Connect to the database todolistDB");

const app: Express = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

const DEFAULT_CATEGORY = "default" ;

/*--------------------*/

/* Database objects */

interface IItem {
    category : string ;
    description : string ;
}

const itemSchema = new Schema<IItem>({
    category: {
        type: String,
        required: [true, "The item should be classified in a given category"]
    },
    description: {
        type: String,
        required: [true, "You need to give a description for the item"]
    }
});

const Item = model<IItem>("Item", itemSchema);

/*------------------------*/

/* POST */

app.post("/", (req: Request, res: Response) => {
    res.redirect("/list/" + DEFAULT_CATEGORY);
})

app.post("/list/:category", (req: Request, res: Response) => {
    console.log("POST request");

    const item : string = req.body.newItem ;
    //if this is the default list, we discard the title of the list
    const category : string = req.params.category ;
    console.log("Category : " + category);

    let redirectPath : string = (category === DEFAULT_CATEGORY) ? "/" : "/" + category ;
    let mongooseItem: Document<unknown, any, IItem> ;

    console.log("Creating item");
    mongooseItem = new Item({category: category, description: item});
    

    console.log("Saving item");
    mongooseItem.save((err: CallbackError, item: Document<unknown, any, IItem> ) => {
        if(err){
            throw err ;
        }else{
            if(item === mongooseItem){
                res.redirect(redirectPath);
            }else{
                throw new Error("Item didn't save " + mongooseItem);
            }
        }
    });
})

app.post("/delete", (req: Request, res: Response) => {
    const id : string = req.body.checkbox ;
    console.log("DELETE request for " + id);

    Item.findByIdAndDelete({_id: id}, (err: CallbackError, item: IItem) => {
        if(err){
            throw err ;
        }else{
            const redirectPath : string = (item.category === DEFAULT_CATEGORY) ? "/"  : "/" + item.category ;
            res.redirect(redirectPath);
        }
    });
})

/*--------------*/

/* GET */

app.get("/", (req: Request, res: Response) => {
    console.log("GET request at /");
   
    const day : string = getDate();

    findAndRender(day, DEFAULT_CATEGORY, res);
})

app.get("/:category", (req: Request, res: Response) => {
    const category: string = req.params.category;
    console.log("GET request at /" + category);

    findAndRender(category, category, res);
})

/*---------------*/

/* Helping functions */

function findAndRender(title: string, category: string, res: Response): void{

    Item.find({category: category}, (err: CallbackError, items: Array<IItem>) => {
        if(err){
            throw err ;
        }else{
            console.log(category + " items have been successfuly loaded");
            console.log("Rendering items...");
            res.render("list", {listTitle : title, items : items, category: category});
        }
    })
}

function deleteItem(item: string){
    console.log(item);
}

/*--------------*/