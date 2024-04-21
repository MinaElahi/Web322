/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Mina Elahi  Student ID: 183771211 Date: 2024-04-03
*
* Published URL: https://puzzled-raincoat-cow.cyclic.app
*
********************************************************************************/
/*const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

legoData.initialize()
  .then(async () => {
    // Existing routes
    app.get('/', (req, res) => {
      res.render("home")
    });
    
    app.get('/about', (req, res) => {
      res.render("about");
    });
    
    app.get("/lego/addSet", async (req, res) => {
      let themes = await legoData.getAllThemes()
      res.render("addSet", { themes: themes })
    });
    
    app.post("/lego/addSet", async (req, res) => {
      try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
      } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    
    });
    
    app.get("/lego/editSet/:num", async (req, res) => {
    
      try {
        let set = await legoData.getSetByNum(req.params.num);
        let themes = await legoData.getAllThemes();
    
        res.render("editSet", { set, themes });
      } catch (err) {
        res.status(404).render("404", { message: err });
      }
    
    });
    
    app.post("/lego/editSet", async (req, res) => {
    
      try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
      } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });
    
    app.get("/lego/deleteSet/:num", async (req, res) => {
      try {
        await legoData.deleteSet(req.params.num);
        res.redirect("/lego/sets");
      } catch (err) {
        res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    })
    
    app.get("/lego/sets", async (req, res) => {
    
      let sets = [];
    
      try {
        if (req.query.theme) {
          sets = await legoData.getSetsByTheme(req.query.theme);
        } else {
          sets = await legoData.getAllSets();
        }
    
        res.render("sets", { sets })
      } catch (err) {
        res.status(404).render("404", { message: err });
      }
    
    });
    
    app.get("/lego/sets/:num", async (req, res) => {
      try {
        let set = await legoData.getSetByNum(req.params.num);
        res.render("set", { set })
      } catch (err) {
        res.status(404).render("404", { message: err });
      }
    });
    
    app.use((req, res, next) => {
      res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
    });
    
  });
*/
/*const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');*/
const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");

const express = require('express');
const app = express();
const path = require('path');

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: 'o6LjQ5EVNC28ZgKM6sdfw4hDELM18ScpFQr', // this should be a long un-guessable string.
    duration: 10 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 600, // the session will be extended by this many ms each request (1 minute)
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}


app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{
  const theme = req.query.theme;
  if (theme) {
    const legoSetsByTheme = await legoData.getSetsByTheme(theme);
    if (legoSetsByTheme) {
      res.render("sets", {sets: legoSetsByTheme})
    } else {
      res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
    }
  } else {
      let sets = await legoData.getAllSets();
      res.render("sets", {sets: sets})
  }  
});

app.get("/lego/sets/:id", async (req,res)=>{
  try{
    const setNumber = req.params.id;
    let set = await legoData.getSetByNum(setNumber);
    res.render("set", {set: set})
  }catch(err){
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
  }
});

// GET route to render the login view
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: '', userName: '' }); // Adjust the view name accordingly
});

// GET route to render the register view
app.get('/register', (req, res) => {
  res.render('register', { successMessage:'', errorMessage: '', userName: '' }); // Adjust the view name accordingly
});

// POST route for user registration
app.post('/register', (req, res) => {
  authData.registerUser(req.body)
      .then(() => res.render('register', { successMessage: 'User created', errorMessage: '', userName: '' }))
      .catch((err) => res.render('register', { successMessage:'', errorMessage: err, userName: req.body.userName }));
});

// POST route for user login
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  authData.checkUser(req.body)
      .then((user) => {
          req.session.user = {
              userName: user.userName,
              email: user.email,
              loginHistory: user.loginHistory
          };
          res.redirect('/lego/sets');
      })
      .catch((err) => res.render('login', { errorMessage: err, userName: req.body.userName }));
});

// GET route for user logout
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

// GET route to render the userHistory view
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory'); // Adjust the view name accordingly
});


app.get('/lego/addSet', ensureLogin, (req, res) => {
  const themes = legoData.getAllThemes();
  themes.then((themeData) => {
    res.render('addSet', { themes: themeData });
  });
});

app.post('/lego/addSet', ensureLogin, (req, res) => {
  const setData = req.body;

  legoData.addSet(setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/editSet/:num', ensureLogin, (req, res) => {
  const setNum = req.params.num;

  Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()])
    .then(([setData, themeData]) => {
      res.render('editSet', { themes: themeData, set: setData });
    })
    .catch((err) => {
      res.status(404).render('404', { message: err });
    });
});

app.post('/lego/editSet', ensureLogin, (req, res) => {
  const setNum = req.body.set_num;
  const setData = req.body;

  legoData.editSet(setNum, setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
  const setNum = req.params.num;

  legoData.deleteSet(setNum)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

legoData.initialize()
.then(authData.initialize)
.then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
}).catch(err => {
  console.log(err)
});