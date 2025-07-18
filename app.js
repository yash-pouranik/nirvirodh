if(!process.env.NODE_ENV) {
    require('dotenv').config();
}
const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);


const mongoose = require("mongoose");

//override method
const methodOverride = require("method-override");
app.use(methodOverride('_method'));


const flash = require("connect-flash");

//
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}

main()
.then((r) => {
    console.log("Connecton to DB Done");
})
.catch((e) => {
    console.log("Connection to DB Failed");
});



//setting ejs engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//ejs-mate
const engine = require('ejs-mate');
app.engine('ejs', engine); // Use ejs-mate as the rendering engine

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());





app.use(session({
  secret: "key", // use a long secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day (optional)
  }
}));

app.use(passport.initialize());
app.use(passport.session());



passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) return done(null, false);
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(u => done(null, u)));



// Share io with routes
app.set("io", io);

app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");   // For error messages
  res.locals.success = req.flash("success");
  res.locals.currUser = req.user || null;
  next();
});


const userRoute = require("./routes/user");
const homeRoute = require("./routes/home");
const teamRoute = require("./routes/team");
const  projectRoute = require("./routes/projects");


app.use("/", userRoute);
app.use("/", homeRoute);
app.use("/", teamRoute);
app.use("/", projectRoute);








io.on("connection", (socket) => {
  console.log("🟢 New client connected");

  socket.on("joinRoom", (teamId) => {
    socket.join(teamId);
    console.log("🟢 Joined room:", teamId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});









server.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 3000");
});