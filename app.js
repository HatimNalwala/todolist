//seting up  
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const { redirect } = require("express/lib/response");


// console.log(date()); 
//using imports
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");


//mongo
const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your TODOLIST"
});
const item2 = new Item({
    name: "Hit + button to add a new item"
});
const item3 = new Item({
    name: " {-- Hit this to delete an item "
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//node+express+js
app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("Error");
                }
                else {
                    console.log("Successfully Inserted");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("index", { listTitle: "Today", newlistItems: foundItems });
        }
    });
});

app.get("/:customtopic", function (req, res) {
    const customListName = _.capitalize(req.params.customtopic);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {

                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("index", { listTitle: foundList.name, newlistItems: foundList.items });
            }
        }
    });
})




app.get("/about", function (req, res) {

    res.render("about");
});



app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const checkedItemid = req.body.checkbox;
    const listName = req.body.listName;

    // if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemid, function (err) {
            if (!err) {
                res.redirect("/");
            }
        });
    // }
    // else {
    //     List.findOneAndDelete({ name: listName }, { $pull: { items: { _id: checkedItemid } } }, function (err, foundList) {
    //         if (!err) {
    //             res.redirect("/" + listName);
    //         }
    //     })
    // }

});

app.listen(3000, function () {
    console.log("server started on port 3000");
});