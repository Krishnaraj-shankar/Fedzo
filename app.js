
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');



var filenameOfImage;
var prevImage = "";

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useFindAndModify', false);

//for post schema
const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

//for memory schema
const memorySchema = new mongoose.Schema({
  path : String
});

const Memory = mongoose.model("Memory", memorySchema);

//for goals schema

const goalSchema = {
  goal : String
};
 
const Goal = mongoose.model("Goal", goalSchema);


//multer storage disk
const storage = multer.diskStorage({
  destination : (req,file,cb)=>{
    cb(null,'public/images/');
  },
  filename : (req,file,cb) =>{
    filenameOfImage = Date.now() + path.extname(file.originalname);
    cb(null,filenameOfImage);
  }
})

const upload = multer({storage : storage});

const homeStartingContent = "I'm Krishnaraj ,Third year B.Tech - Information Technology Student. ";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//root or index
app.get("/", function(req, res){
    res.render("registration");

  });

app.post("/",function(req,res){
  res.redirect("/home");
})

app.get("/home", function(req, res){

  Post.find({}, function(err, posts){
    // res.render("index");
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});


//memories
app.get("/memories",function(req,res){
  Memory.find({},(req,memories) =>{
    console.log(memories)
    res.render("memories",{
      urls : memories
    });
  });
});

app.post("/memories",upload.single("image"),function(req,res){
  const what = req.body.memories_whattodo;
  if(what === 'delete'){
    const id = req.body.id_delete;
    console.log(id);
    Memory.findByIdAndRemove(id, function(err){
      if (!err) {
        // console.log("Successfully deleted checked item.");
        res.redirect("/memories");
      }
    });
  }
  else{
    if(prevImage != filenameOfImage){
      prevImage = filenameOfImage;
      const memory = new Memory({
      path : `/images/${filenameOfImage}`
    });
    memory.save();
    res.redirect("/memories");
    }
    else{
      res.redirect("/memories");
    }
  }
});


//goals
app.get("/goals",function(req,res){
  Goal.find({},function(req,goals){
    res.render("goals",{
      goalsItems : goals
    });
  })
})

app.post("/goals",function(req,res){
  const what = req.body.whattodo;
  if(what === 'add'){
  const newgoal = req.body.newgoal;
  const goal = new Goal({
    goal : newgoal
  });
  goal.save();
  res.redirect("/goals");
}
else if(what === 'delete')
{
  const checkedItemId = req.body.checkbox;
  Goal.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      // console.log("Successfully deleted checked item.");
      res.redirect("/goals");
    }
  });
}
})


//compose
app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
        res.redirect("/home");
    }
  });
});


//logout

app.get("/logout",function(req,res){
  res.render("registration");
})

//separate post
app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;
console.log(requestedPostId);

  Post.findOne({_id: requestedPostId}, function(err, postdetails){
    console.log(postdetails);
    if(err)
    {
      console.log(err);
    }
    else{
    res.render("post", {
      title: postdetails.title,
      content: postdetails.content
    });
    }
  });

});

//port listener
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
