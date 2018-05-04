const express = require("express");
const app = express();

// MAKE REACT WORK IN DEPLOYMENT

// Express will serve production assets (main.js main.css etc)
// This says that if any GET request comes in for something and is not understood what is looking for, look for it at ./build
app.use(express.static("./build"));

// Express will serve index.html if the route is not recognized (not even in the ./build dir)
const path = require("path");
app.get("*", (req, res) => {
   res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

// const PORT = process.env.PORT || 5000;
const PORT = 3001;
app.listen(PORT, () => {
   console.log("Server up and ready to go!");
});
