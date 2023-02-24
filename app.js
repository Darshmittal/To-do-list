const express=require("express")
const bodyParser=require("body-parser")
const mongoose=require("mongoose")
const app=express();
const _=require("lodash")

let items=["leetcode","Backend"];
let workItems=[];

app.set('view engine','ejs');
mongoose.set('strictQuery', true);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const url='mongodb+srv://darshan_0111:darshan123@cluster0.c0wwvyq.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(url)
.then(function(db)
{
    console.log("db connected");
})
.catch(function(err){

    console.log(err);
})

const itemsSchema={
    name:String
};

const Item=mongoose.model("Item",itemsSchema); 

const item1=new Item({
    name:"Welcome to your to do list!!"
});

const item2=new Item({
    name:"Hit the + button to add new Goal."
});

const item3=new Item({
    name:"Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

app.get("/",function(req,res)
{
    let today=new Date();

    let options={

        weekday:"long",
        day:"numeric",
        month:"long"
    };

    

    let day=today.toLocaleDateString("en-US",options);

    Item.find({},function(err,founditems)
    {
        if(founditems.length===0)
        {
         Item.insertMany(defaultItems,function(err){

           if(err)
           {
              console.log(err);
           }
            else
           {
            console.log("Successfully added default item to DB.")
           }

           });

           res.redirect("/");

        }

        else{

            res.render('list',{listTitle:day ,newListItems:founditems});

        } 
    });
});

app.post("/",function(req,res)
{
    let itemName=req.body.newItem;
    const listName=req.body.list;

    let item=new Item({

        name:itemName
    });

    if(listName==="Today")
    {
        item.save();
        res.redirect("/");
    }

    else
    {
        List.findOne({name: listName},function(err,foundList)
        {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });

    }

});

app.get("/work",function(req,res)
{
    res.render('list',{listTitle:"work list",newListItems:workItems})
});

app.post("/work",function(req,res)
{
    let item=req.body.newItem;

    workItems.push(item);
    res.redirect("/work");
});

app.post("/delete",function(req,res)
{
    const id=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today")
    {
        Item.findByIdAndRemove(id,function(err)
    {
        if(!err)
        {
            console.log("Successfully Deleted checked item");
            res.redirect("/");
        }
    });

}    else{

        List.findOneAndUpdate({name:listName},{$pull: {items: {_id:id}}},function(err,foundList)
        {
            if(!err)
            {
                res.redirect("/" + listName);
            }


        })

    }

    
});

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/:ListName",function(req,res)
{
    const ListName=_.capitalize(req.params.ListName);

    List.findOne({name:ListName},function(err,foundList)   {
        if(!err)
        {
            if(!foundList)
            {
                const list=new List
                ({
                    name:ListName,
                    items:defaultItems
                });

                list.save();
                res.redirect("/" + ListName)
            }

            else
            {
                res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
            }
        }
    })

    const list=new List({
        name:ListName,
        items:defaultItems
    });

    list.save();
   
});


app.listen(3000);
