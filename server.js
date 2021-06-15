const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "ffU^U(^&N:&YOINB%^R^IKftidp87^&%%4309-8737983hj98u&";

mongoose.connect("mongodb://localhost:27017/login-app-practo", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});
app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());

app.post("/api/login", async (req, res) => {
  const { person, email, password } = req.body;
  const user = await User.findOne({ person, email }).lean();

  if (!user)
    return res.json({
      status: "error",
      error: "Invalid Domain/Email/Password",
    });

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        id: user._id,
        person: user.person,
        email: user.email,
      },
      JWT_SECRET
    );
    return res.json({ status: "ok", data: token });
  }

  res.json({ status: "error", data: "Invalid Domain/Email/Password" });
});

app.post("/api/new-register", async (req, res) => {
  const { person, email, password: plainTextPassword } = req.body;
  // if (!person || person !== "doctor" || person !== "patient")
  //   return res.json({ status: "error", error: "Invalid Domain" });

  if (!email || typeof email !== "string")
    return res.json({
      status: "error",
      error: "Invalid Domain/Email/Password",
    });

  if (!plainTextPassword || typeof plainTextPassword !== "string")
    return res.json({
      status: "error",
      error: "Invalid Domain/Email/Password",
    });

  if (plainTextPassword.length < 5)
    return res.json({ status: "error", error: "Password is not strong!" });

  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const response = await User.create({
      person,
      email,
      password,
    });
    console.log("User created successfully: ", response);
  } catch (error) {
    if (error.code === 11000)
      return res.json({ status: "error", error: "Email already in use" });
    throw error;
  }
  res.json({ status: "ok" });
});

app.listen(3001, () => {
  console.log("Server runs at port 3001");
});
