const express = require('express')
var cors = require('cors')
var mysql = require('mysql');
var bodyParser = require('body-parser')
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ir_parking"
});


app.get('/problem', (req, res) => {
    con.query("select dateOfProblem, timeOfProblem, sence, licensePlate, allegation, countProblems,securityGuardUserName, problemDetails from securityguards s JOIN problems p on s.securityGuardID = p.securityGuardID JOIN problemtype pt on p.problemTypeID = pt.problemTypeID join trafficticket t on p.ticketID = t.ticketID join car c on t.carID = c.carID", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.json(result)
    });
})

app.get('/staff', (req, res) => {
  con.query("select firstName,lastName, userID from users u join adminstrators a on u.userID = a.adminID", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/securityguard', (req, res) => {
  con.query("select firstName,lastName, userID from users u join securityguards s on u.userID = s.securityGuardID", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/rule', (req, res) => {
  con.query("select ruleID, ruleName, maxWarnning, price from internalrules", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/addstaff', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into users (firstName,lastName,userID,userTel,userEmail) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.userID}', '${req.body.userTel}', '${req.body.userEmail}')
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  }); 
})

app.post('/addsecurityguard', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into users (firstName,lastName,userID.userTel.userEmail) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.userID}', '${req.body.userTel}', '${req.body.userEmail}')
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  }); 
})

app.post('/addrule', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into internalrules (ruleID,ruleName,maxWarnning,price) values('${req.body.ruleID}', '${req.body.ruleName}', '${req.body.maxWarnning}', '${req.body.price}')
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})


app.post('/addlocation', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into location (locationID,locationName,locationCode) values('${req.body.locationID}', '${req.body.locationName}', '${req.body.locationCode}')
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})


con.connect(err=> {
  app.listen(5000, () => {
    console.log('Start server at port 5000.')
  })
})
