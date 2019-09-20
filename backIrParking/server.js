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
  host: "52.221.203.102",
  user: "parn",
  password: "irdb2019",
  database: "ir_parking"
});

con.connect(err=> {
  app.listen(5000, () => {
    console.log('Start server at port 5000.')
  })

  app.get('/problem', (req, res) => {
    con.query("select p.problemID, p.dateOfProblem, p.timeOfProblem, p.scene, c.licensePlate, pt.allegation, s.firstName, p.problemDetails, p.evidenceImage from Staffs s JOIN Problems p on s.staffID = p.staffID JOIN ProblemType pt on p.problemTypeID = pt.problemTypeID join TrafficTicket t on p.ticketID = t.ticketID join Car c on t.carID = c.carID", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.json(result)
    });
})

app.post('/deleteEvent', (req, res) => {
  con.query(`Delete from Problems where problemID = ${req.body.problemID}`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/staff', (req, res) => {
  con.query("select staffID, firstName,lastName, staffTel, staffEmail from Staffs where staffRole = 'Administrator'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/securityguard', (req, res) => {
  con.query("select firstName,lastName,staffTel, staffEmail, staffPassword from Staffs where staffRole = 'Security Guard'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/rule', (req, res) => {
  con.query("select ruleID ,ruleName, maxWarning, price, ruleDetails from InternalRules", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/addstaff', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail,staffRole,organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}', '${req.body.staffEmail}', 'Administrator', 1)
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  }); 
})


app.post('/deleteStaff', (req, res) => {
  console.log(req.body.ruleID)
  con.query(`Delete from Staffs where staffID = ${req.body.staffID}`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/addsecurityguard', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail, staffPassword, staffImages, staffRole, organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}', '${req.body.staffEmail}', '${req.body.staffPassword}' , '${req.body.staffImages}', 'Security Guard',1 )
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  }); 
})

app.post('/addrule', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into InternalRules (ruleName ,maxWarning ,price ,ruleDetails, problemTypeID,organizationID) values('${req.body.ruleName}', '${req.body.maxWarning}', '${req.body.price}', '${req.body.ruleDetails}', 1 , 1)
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/addlocation', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into Location (locationName,locationCode,stickerID) values('${req.body.locationName}', '${req.body.locationCode}',1)
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/addLocationLabel', (req, res) => {
  console.log(req.body)
  con.query(`
    insert into Location (locationName,locationCode,stickerID) values('${req.body.locationName}', '${req.body.locationCode}',1)
    `, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/location', (req, res) => {
  con.query("select  locationName, locationCode from Location", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/locationCode', (req, res) => {
  con.query("select locationCode from Location", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/deleteRule', (req, res) => {
  console.log(req.body.ruleID)
  con.query(`Delete from InternalRules where ruleID = ${req.body.ruleID}`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.get('/carOwner', (req, res) => {
  con.query("select carOwnerID, carOwnerFirstName, carOwnerLastName, carOwnerTel, carOwnerEmail,carOwnerAddress, registerDate, expiredDate from CarOwners", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/editCarOwner', (req, res) => {
  con.query(`UPDATE CarOwners SET carOwnerFirstName = '${req.body.carOwnerFirstName}', carOwnerLastName= '${req.body.carOwnerLastName}', carOwnerEmail= '${req.body.carOwnerEmail}',carOwnerTel= '${req.body.carOwnerTel}',carOwnerAddress= '${req.body.carOwnerAddress}' where carOwnerID = '${req.body.carOwnerID}'`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/deleteCarOwner', (req, res) => {
  con.query(`Delete from CarOwners where carOwnerID = ${req.body.carOwnerID}`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/editRule', (req, res) => {
  con.query(`UPDATE InternalRules SET ruleName = '${req.body.ruleName}', maxWarning= '${req.body.maxWarning}', price= '${req.body.price}',ruleDetails= '${req.body.ruleDetails}' where ruleID = '${req.body.ruleID}'`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})



})


