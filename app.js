//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://dbRitik:ritik21@cluster0.e7l3k.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true,  useFindAndModify: false});
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"This To-Do list is crearted by Ritik Kundlas for the World ! "
});
const item2 = new Item({
  name:"Press the + button to start adding new task for the day !"
});

const item3 = new Item({
  name:"Let's get started , have fun ."
}) ;




const defaultItems = [ item1,item2,item3 ];

const listSchema ={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);







app.get("/", function(req, res) {



  Item.find({},function(err,foundItems)
  {
    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems,function(err)
      {
        if(err)
        console.log(err);
        else
        console.log("Success");
      });

      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});


app.get("/:customListName",function(req,res)
{
  const customListName = _.capitalize(req.params.customListName);




  List.findOne({name: customListName}, function(err,foundList)
{
  if(!err)
  {
    if(!foundList){
      //create a new List

      const list = new List({
        name:customListName,
        items:defaultItems
      });

      list.save();

      res.redirect("/"+customListName);

    }
    else
    //list alrerady exisits !
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
} );


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name : itemName
  });

  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList)
  {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if(listName==="Today") {
    Item.findByIdAndRemove(checkedItemId,function(err)
  {
    if(err)
    console.log(err);
    else{
    console.log("Success");
    res.redirect("/");}
  });
  }
  else {
    List.findOneAndUpdate({name:listName} , {$pull: { items:{_id:checkedItemId }}},function(err,foundList){
      if(!err)
      res.redirect("/"+listName);
    });
  }


// res.redirect("/"+customListName);
})



app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started Sucessfully !");
});
