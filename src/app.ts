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

/*--------------------*/

/* Database objects */

enum Category {
    Default = "DEFAULT",
    Work = "WORK"
};

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
    console.log("POST request");

    const item : string = req.body.newItem ;
    let redirectPath : string ;
    let mongooseItem: Document<unknown, any, IItem> ;

    console.log("Creating item");

    if(req.body.list === Category.Work.toLocaleLowerCase()){
        mongooseItem = new Item({category: Category.Work, description: item});
        redirectPath = "/" + Category.Work.toLocaleLowerCase();
    }else{
        mongooseItem= new Item({category: Category.Default, description: item});
        redirectPath = "/" ;
    }

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
            const redirectPath : string = (item.category === Category.Work) ? "/" + Category.Work.toLocaleLowerCase() : "/" ;
            res.redirect(redirectPath);

        }
    });
})

/*--------------*/

/* GET */

app.get("/", (req: Request, res: Response) => {
    console.log("GET request at /");
   
    const day : string = getDate();

    findAndRender(day, Category.Default, res);
})

app.get("/" + Category.Work.toLocaleLowerCase(), (req: Request, res: Response) => {
    console.log("GET request at /" + Category.Work.toLocaleLowerCase())

    findAndRender(Category.Work.toLocaleLowerCase(), Category.Work, res);
})

/*---------------*/

/* Helping functions */

function findAndRender(title: string, category: Category, res: Response): void{

    Item.find({category: category}, (err: CallbackError, items: Array<IItem>) => {
        if(err){
            throw err ;
        }else{
            console.log(category + " items have been successfuly loaded");
            console.log("Rendering items...");
            res.render("list", {listTitle : title, items : items});
        }
    })
}

function deleteItem(item: string){
    console.log(item);
}

/*--------------*/