
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
var PORT = 8080;
var cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  let text = "";
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (var i = 0; i < 6; i++) {
    text += char.charAt(Math.floor(Math.random() * (62 - 0)));
  }
  return text;
}


app.get("/", (req, res) => {
  res.send("Hello!");
  // Cookies that have not been signed
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  
  res.cookie('username', req.body.userName);
  
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");  
})

app.post("/urls", (req, res) => {
  let genId = generateRandomString();
  urlDatabase[genId] = req.body.longURL;
  res.redirect("/urls");       
});

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id
  delete urlDatabase[id];
  res.redirect("/urls")         
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.update;
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  let shortUrlKey = req.params['shortURL'];
  let longURL = urlDatabase[shortUrlKey];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"]}
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let { email, password } = req.body;

  if (!req.body["email"] || !req.body["password"]){
    return res.status(400).send("YOU SHALL NOT PASS!!!");
  } 
  
  for (let userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("YOU SHALL NOT USE THAT!");
    } else {
      let randId = generateRandomString()
      users[randId] = {
      id: randId,
      email: email,
      password: password
      }

      console.log(users)
  
      res.cookie('user_id', users[randId].id);
      return res.redirect("urls");
    }
  }
});

