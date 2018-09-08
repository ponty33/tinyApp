
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
var PORT = 8080;
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["lighthouse"]
}));
app.use(bodyParser.urlencoded({extended: true}));
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  let templateVars = { userData: users, userData: users[req.session.user_id] };
  res.render("hello_world", templateVars);
});

app.get("/warning", (req, res) => {
  let templateVars = { userData: users, userData: users[req.session.user_id] };
  res.render("warning", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/warning");
  } 
  let templateVars = { userData: users[req.session.user_id], urls: urlsForUser(req.session.user_id) };
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
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login");
})

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("../login");
  } 
  let templateVars = { userData: users, userData: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).send("YOU SHALL NOT PASS");
  }

  for (let user in users) {
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, users[user].password)) {
        req.session.user_id = users[user].id;
        return res.redirect("/urls"); 
      }
    return res.status(403).send("THOU SHALL NOT PASS");
    }
  }
  res.status(403).send("YOU SHALL NOT PASS");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");  
});

app.post("/urls", (req, res) => {
  let genId = generateRandomString();
  urlDatabase[genId] = [genId];
  urlDatabase[genId].longURL = req.body.longURL;
  urlDatabase[genId].user_id = req.session.user_id;
  res.redirect("/urls");       
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.id].user_id) {
    return res.status(400).send("YOU DO NOT OWN THIS!"); 
  }
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");       
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.id].user_id) {
    return res.status(400).send("YOU DO NOT OWN THIS!"); 
  }
  urlDatabase[req.params.id].longURL = req.body.update;
  res.redirect("/urls");
});

app.get("/warning3", (req, res) => {
  let templateVars = { userData: users, userData: users[req.session.user_id] };
  res.render("notExist", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortUrlKey = req.params['shortURL'];
  let longURL = urlDatabase[shortUrlKey].longURL;
  if (longURL === undefined) {
    return res.redirect("/warning3");
  }
  res.redirect(longURL);
});

app.get("/warning2", (req, res) => {
  let templateVars = { userData: users, userData: users[req.session.user_id] }
  res.render("notYours", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/warning");
  } 

  if (req.session.user_id !== urlDatabase[req.params.id].user_id) {
    return res.redirect("/warning2");
  } 
  let templateVars = { userData: users[req.session.user_id], shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

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

  const encrypPassword = bcrypt.hashSync(password, 10);
  let randId = generateRandomString();
  users[randId] = {
    id: randId,
    email: email,
    password: encrypPassword
  };

  req.session.user_id = users[randId].id;
  res.redirect("urls");
});


