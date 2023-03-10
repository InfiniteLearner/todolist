import express, {Express, Request, Response, urlencoded } from "express";
import mongoose, { CallbackError, Document, model, Schema } from "mongoose";
import _ from "lodash" ;
import * as dotenv from "dotenv" ;

import {getDate} from "../modules/date.js";


dotenv.config();

const username = encodeURIComponent(process.env.DB_USER!);
const password = encodeURIComponent(process.env.DB_PASSWORD!);
const cluster = process.env.CLUSTER! ;
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;

/* Set up app and db */

mongoose.set('strictQuery', false);
mongoose.connect(uri);

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
    description : string ;
}

const itemSchema = new Schema<IItem>({
    description: {
        type: String,
        required: [true, "You need to give a description for the item"]
    }
});

const Item = model<IItem>("Item", itemSchema);

interface IList {
    name: string ;
    items: IItem[]
}

const listSchema = new Schema<IList>({
    name: {
        type: String,
        required: [true, "The list need to have a name"]
    },
    items: [
       itemSchema
    ]
})

const List = model<IList>("List", listSchema);

/*------------------------*/

/* POST */

app.post("/", (req: Request, res: Response) => {
    res.redirect("/list/" + DEFAULT_CATEGORY);
})

app.post("/list/:category", (req: Request, res: Response) => {
    console.log("POST request");

    const item : string = req.body.newItem ;
    const category : string = _.capitalize(req.params.category) ;

    
    
    //if this is the default list, we discard the title of the list
    let redirectPath : string = (category === _.capitalize(DEFAULT_CATEGORY)) ? "/" : "/list/" + category ;

    console.log("Creating item");
    let mongooseItem: Document<unknown, any, IItem> & IItem = new Item({category: category, description: item});

    List.findOne({name: category}, (err : CallbackError, list: Document<unknown, any, IList> & IList) => {

        let listToSave : Document<unknown, any, IList> & IList ;

        if(err){
            console.log(err); 
            throw err; ;
        }else if(list === null){
            console.log("Creating new list");
            listToSave = new List({name: category, items: [mongooseItem]});
        }else{
            console.log("Updating existing list");
            list.items.push(mongooseItem);
            listToSave = list ;
        }

        listToSave.save((err: CallbackError, savedList: IList) => {
            if(err){
                console.log(err); 
                throw err; ;
            }else if(listToSave !== savedList){
                throw new Error("List hasn't been saved : " + savedList.name);
            }else{
                console.log("Saving item");
                mongooseItem.save((err: CallbackError, item: Document<unknown, any, IItem> ) => {
                    if(err){
                        console.log(err); 
                        throw err; ;
                    }else{
                        if(item === mongooseItem){
                            res.redirect(redirectPath);
                        }else{
                            throw new Error("Item didn't save " + mongooseItem);
                        }
                    }
                });

            }
        })
    })

})

app.post("/delete", (req: Request, res: Response) => {
    const id : string = req.body.checkbox ;
    console.log("DELETE request for " + id);

    Item.findOneAndDelete({_id: id}, (err: CallbackError, item: IItem) => {
        if(err){
            console.log(err); 
            throw err; ;
        }else if(!item){
            throw new Error("No item with the given id was found : " + id);
        }
        else{
            console.log("Deleting in list");
            List.findOneAndUpdate({"items.description": item.description}, {$pull: {items: {description : item.description}}}, (err: CallbackError, list: Document<unknown, any, IList> & IList) => {
                if(err){
                    console.log(err); 
                    throw err; ;
                }else if(!list){
                    throw new Error("The item was not in any list : " + item.description);
                }else{
                    console.log("List updated");
                    const redirectPath = (list.name === _.capitalize(DEFAULT_CATEGORY)) ? "/" : "/list/" + list.name ;
                    res.redirect(redirectPath);
                }
            })
        }
    });
})

/*--------------*/

/* GET */

app.get("/", (req: Request, res: Response) => {
    console.log("GET request at /");
   
    const day : string = getDate();


    findAndRender(day, _.capitalize(DEFAULT_CATEGORY), res);
})

app.get("/list/:category", (req: Request, res: Response) => {
    const category: string = _.capitalize(req.params.category);
    console.log("GET request at /" + category);

    findAndRender(category, category, res);
})

/*---------------*/

/* Helping functions */

function findAndRender(title: string, category: string, res: Response): void{

    List.findOne({name: category}, (err: CallbackError, list: IList) => {
        if(err){
            console.log(err); throw err; ;
        }else if(!list){
            let listToSave : Document<unknown, any, IList> & IList ;
            listToSave = new List({name: category, items: []});

            listToSave.save((err: CallbackError, savedList: IList) => {
                if(err){
                    console.log(err); 
                    throw err; ;
                }else if(listToSave !== savedList){
                    throw new Error("List hasn't been saved : " + savedList.name);
                }else{
                    res.render("list", {listTitle : title, items : savedList.items, category: savedList.name});
                }
            })
        }else{
            console.log(category + " items have been successfuly loaded");
            console.log("Rendering items...");
            res.render("list", {listTitle : title, items : list.items, category: list.name});
        }
    })
}

/*--------------*/