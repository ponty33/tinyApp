
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
var PORT = 8080;
var cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    user_id: "userRandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    user_id: "user2RandomID"
  }
}
// var urlDatabaseNew ={
//   "b2xVn2": {
//     shortURL: "b2xVn2",
//     longURL: "http://www.google.com",
//     userid: '9090'
//   }
// }

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
  if (!req.cookies.user_id) {
    res.send("LOGIN or REGISTER FIRST!");
  } 
  let templateVars = { userData: users[req.cookies.user_id], urls: urlsForUser(req.cookies.user_id) };
  res.render("urls_index", templateVars);
});

var urlsForUser = function(id) {
  var userUrl = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].user_id) {
      userUrl[url] = urlDatabase[url];
      userUrl[url].shortURL = urlDatabase[url].shortURL;    
      userUrl[url].longURL = urlDatabase[url].longURL; 
    }
  }
  return userUrl;
} 


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("../login");
  } 
  let templateVars = { userData: users, userData: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).send("YOU SHALL NOT PASS");
  }

  for (let user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        res.cookie('user_id', users[user].id);
        return res.redirect("/urls"); 
      }
    return res.status(403).send("THOU SHALL NOT PASS");
    }
  }
  res.status(403).send("YOU SHALL NOT PASS");
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");  
})

app.post("/urls", (req, res) => {
  let genId = generateRandomString();
  urlDatabase[genId] = req.body.longURL;
  res.redirect("/urls");       
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies.user_id !== urlDatabase[req.params.id].user_id) {
    return res.status(400).send("YOU DO NOT OWN THIS!"); 
  }
  let id = req.params.id
  delete urlDatabase[id];
  res.redirect("/urls")         
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.update;
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  let shortUrlKey = req.params['shortURL'];
  let longURL = urlDatabase[shortUrlKey].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  if (req.cookies.user_id !== urlDatabase[req.params.id].user_id) {
    return res.status(400).send("YOU DO NOT OWN THIS!"); 
  } 
  let templateVars = { userData: users[req.cookies.user_id], shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { userData: users }
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
    }
  }
  let randId = generateRandomString();
  users[randId] = {
    id: randId,
    email: email,
    password: password
  };
  res.cookie('user_id', users[randId].id);
  res.redirect("urls");
});



