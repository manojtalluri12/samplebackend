const express = require("express");
const mongoose = require("mongoose");
const RegisterUser = require("./model/Model.js");
const middleware = require("./middleware.js");
const Message=require('./model/MessageModel.js')
//const d=require('./client/src/images')
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
mongoose
  .connect(
    "mongodb+srv://manojkumarcse123:DGQeSSAjcXwAKZw8@cluster0.l7tuz8c.mongodb.net/authenti"
  )
  .then(() => {
    console.log("db connected");
  });

app.get("/", (req, res) => {
  res.send("working");
});

app.post("/registeruser", async (req, res, next) => {
  try {
    const { username, email, password, confirmpassword } = req.body;
    let exist = await RegisterUser.findOne({ email });
    if (
      email == "" ||
      password == "" ||
      username == "" ||
      confirmpassword == ""
    ) {
      return res.status(400).json({ message: "please fill the form" });
    }
    if (exist) {
      return next(errorHandler(400, "email alredy exist"));
    }
    if (password !== confirmpassword) {
      return next(errorHandler(400, "password not match"));
    }
    let newuser = new RegisterUser({
      username,
      email,
      password,
      confirmpassword,
    });
    await newuser.save();
    res.status(200).json({ message: "sucessfully registered" });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, "fill form correctly"));
  }
});

app.post("/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email == "" || password == "") {
      return res.status(400).json({ message: "please fill credtinals" });
    }
    let exist = await RegisterUser.findOne({ email });
    if (!exist) {
      return next(errorHandler(400, "email is not register "));
    }
    if (exist.password != password) {
      return next(errorHandler(400, "password not match"));
    }
    let payload = {
      user: {
        id: exist.id,
      },
    };
    jwt.sign(payload, "jwt", { expiresIn: 50000000 }, (err, token) => {
      if (err) throw err;
      return res.json({ token });
    });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, "enter logins correctly"));
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await RegisterUser.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "sucessfully deleted you account" });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, "delete correctly"));
  }
});

app.get("/myprofile", middleware, async (req, res) => {
  try {
    let exist = await RegisterUser.findById(req.user.id);
    if (!exist) {
      return res.status(400).json({ message: "user not found" });
    }
    res.json(exist);
  } catch (error) {
    console.log(error);
    res.json(500).json({ message: "server error" });
  }
});

app.patch('/edit/:id',async(req,res)=>{
  const {username,email}=req.body
  try {
    await RegisterUser.findByIdAndUpdate(req.params.id,{username,email})
    return res.status(200).json({ message: "sucessfully updated your account" });
  } catch (error) {
    console.log(error);
    res.json(500).json({ message: "server error" });
  }
})

app.post('/addmsg',middleware,async(req,res)=>{
  try {
    const {message}=req.body
    let exist=await RegisterUser.findById(req.user.id)
    const newuser=new Message({
      user:req.user.id,
      username:exist.username,
      message
    })
    await newuser.save()
    let  allmsg=await Message.find()
    return res.json(allmsg)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
})
app.get('/getmsg',async(req,res)=>{
  try {
    let  allmsg=await Message.find()
    return res.json(allmsg)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
})
app.listen(5000, () => {
  console.log("server starting....");
});

const errorHandler = (statusCode, message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  return error;
};

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
