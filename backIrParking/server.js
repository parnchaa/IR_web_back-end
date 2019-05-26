const express = require('express')
var cors = require('cors')
var mysql = require('mysql');
var bodyParser = require('body-parser')
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
require('dotenv').config()
 
// parse application/json
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

con.connect(err=> {
  app.listen(5000, () => {
    console.log('Start server at port 5000.')
  })

  app.get('/problem', (req, res) => {
    con.query("select p.problemID, p.dateOfProblem, p.timeOfProblem, p.scene, c.licensePlate, pt.allegation,s.firstName, p.problemDetails from Staffs s JOIN Problems p on s.staffID = p.staffID JOIN ProblemType pt on p.problemTypeID = pt.problemTypeID join TrafficTicket t on p.ticketID = t.ticketID join Car c on t.carID = c.carID", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.json(result)
    });
})

app.get('/staff', (req, res) => {
  con.query("select firstName,lastName, staffTel, staffEmail from Staffs where staffRole = 'Administrator'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/securityguard', async (req, res) => {
  await con.query("select firstName,lastName,staffTel, staffEmail from Staffs where staffRole = 'Security Guard'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/rule', async (req, res) => {
  await con.query("select ruleName, maxWarning, price, ruleDetails from InternalRules", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/addstaff',async (req, res) => {
  console.log(req.body)
  await con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail,staffRole,organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}', '${req.body.staffEmail}', 'Administrator', 1)
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  }); 
})

app.post('/addsecurityguard',async (req, res) => {
  console.log(req.body)
  await con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail,staffRole, organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}', '${req.body.staffEmail}', 'Security Guard',1 )
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  }); 
})

app.post('/addrule',async (req, res) => {
  console.log(req.body)
  await con.query(`
    insert into InternalRules (ruleName ,maxWarning ,price ,ruleDetails, problemTypeID,organizationID) values('${req.body.ruleName}', '${req.body.maxWarning}', '${req.body.price}', '${req.body.ruleDetails}', 1 , 1)
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})


app.post('/addlocation', async (req, res) => {
  console.log(req.body)
  await con.query(`
    insert into Location (locationName,locationCode,stickerID) values('${req.body.locationName}', '${req.body.locationCode}',1)
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/location', async (req, res) => {
  await con.query("select  locationName, locationCode from Location", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})


})
