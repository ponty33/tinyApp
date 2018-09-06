
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
  console.log('Cookies: ', req.cookies)
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
  console.log(req.cookies.username)
  
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

