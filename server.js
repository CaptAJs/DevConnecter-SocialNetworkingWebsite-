const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const post = require("./routes/api/post");

const app = express();

//DB Config
const db = require("./config/keys").mongoURI;

//Connect t MongoDB
mongoose
  .connect(db)
  .then(res => {
    console.log("mongo db connected");
  })
  .catch(err => {
    console.log(err);
  });

app.get("/", (req, res) => res.send("Hello"));

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/post", post);

port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server is running at ${port}`));
