const express = require('express')
var cors = require('cors')
var mysql = require('mysql');
var bodyParser = require('body-parser')
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
const jwt = require("jwt-simple");
 
// parse application/json
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: "35.247.180.61",
  user: "parn",
  password: "irdb2019",
  database: "ir_parking"
});

con.connect(err=> {
  app.listen(5000, () => {
    console.log('Start server at port 5000.')
  })

const loginMiddleWare = (req, res, next) => {
  con.query(`select firstName, lastName, staffEmail, staffPassword,staffRole from Staffs where staffEmail = "${req.body.staffEmail}"`, function (err, result, fields) {
    if (err) throw err;
    if(result.length !== 0){
      if(req.body.staffEmail === result[0].staffEmail && req.body.staffPassword === result[0].staffPassword){
        req.staffRole = result[0].staffRole
        req.firstName = result[0].firstName
        req.lastName = result[0].lastName

        next();
      }
      else{
        res.json("wrong")
      }
    }
    else{
      res.json("wrong")
    }
  });
 };
 app.post("/login", loginMiddleWare, (req, res) => {
  console.log("PPPPPPP",req.staffRole)
    const payload = {
      //  sub: req.body.username,
      //  iat: new Date().getTime(),
       role: req.staffRole,
       firstName: req.firstName,
       lastName:req.lastName
    };
    const SECRET = "MY_SECRET_KEY"
    res.json(jwt.encode(payload, SECRET));
 });

 app.get('/userData', (req, res) => {
  con.query(`select ${firstName}, ${lastName}, ${role} `, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

  app.get('/problem', (req, res) => {
    con.query("select p.problemID, p.dateOfProblem, p.timeOfProblem, p.scene, c.licensePlate, pt.allegation, s.firstName, p.problemDetails, p.evidenceImage from Staffs s JOIN Problems p on s.staffID = p.staffID JOIN ProblemType pt on p.problemTypeID = pt.problemTypeID join TrafficTicket t on p.ticketID = t.ticketID join Car c on t.carID = c.carID", function (err, result, fields) {
      if (err) throw err;
      res.json(result)
    });
})

app.post('/deleteEvent', (req, res) => {
  con.query(`Delete from Problems where problemID = ${req.body.problemID}`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/staff', (req, res) => {
  con.query("select staffID, firstName,lastName, staffTel, staffEmail from Staffs where staffRole = 'Administrator'", function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/securityguard', (req, res) => {
  con.query("select staffID, firstName,lastName,staffTel, staffEmail, staffPassword, staffImages from Staffs where staffRole = 'Security Guard'", function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/rule', (req, res) => {
  con.query("select ruleID ,ruleName, maxWarning, price, ruleDetails from InternalRules", function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addstaff', (req, res) => {
  con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail,staffRole,organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}', '${req.body.staffEmail}', 'Administrator', 1)
    `, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  }); 
})


app.post('/deleteStaff', (req, res) => {
  con.query(`Delete from Staffs where staffID = ${req.body.staffID}`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addsecurityguard', (req, res) => {
  con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail,staffRole, organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}', '${req.body.staffEmail}', 'Security Guard',1 )
    `, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  }); 
})

app.post('/addrule', (req, res) => {
  con.query(`
    insert into InternalRules (ruleName ,maxWarning ,price ,ruleDetails, problemTypeID,organizationID) values('${req.body.ruleName}', '${req.body.maxWarning}', '${req.body.price}', '${req.body.ruleDetails}', 1 , 1)
    `, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addLocationLabel', (req, res) => {
  con.query(`
    insert into Location (locationName,locationCode,stickerID) values('${req.body.locationName}', '${req.body.locationCode}','${req.body.stickerID}')
    `, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/location', (req, res) => {
  con.query("select locationID, locationName, locationCode from Location", function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/stickerColor', (req, res)=>{
  con.query("SELECT s.colorOfSticker AS value, s.stickerID FROM Sticker s" , function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  })
})

app.post('/deleteRule', (req, res) => {
  con.query(`Delete from InternalRules where ruleID = ${req.body.ruleID}`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/carOwner', (req, res) => {
  con.query("select carOwnerID, carOwnerFirstName, carOwnerLastName, carOwnerTel, carOwnerEmail,carOwnerAddress, registerDate, expiredDate from CarOwners", function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/getSearchValue/:value', (req, res) => {
  let key = req.params.value
  con.query(`select carOwnerID, carOwnerFirstName, carOwnerLastName, carOwnerTel, carOwnerEmail,carOwnerAddress, registerDate, expiredDate from CarOwners where carOwnerFirstName like '%${key}%' || carOwnerLastName like '%${key}%'`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/editCarOwner', (req, res) => {
  con.query(`UPDATE CarOwners SET carOwnerFirstName = '${req.body.carOwnerFirstName}', carOwnerLastName= '${req.body.carOwnerLastName}', carOwnerEmail= '${req.body.carOwnerEmail}',carOwnerTel= '${req.body.carOwnerTel}',carOwnerAddress= '${req.body.carOwnerAddress}' where carOwnerID = '${req.body.carOwnerID}'`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/deleteCarOwner', (req, res) => {
  con.query(`Delete from CarOwners where carOwnerID = ${req.body.carOwnerID}`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/editRule', (req, res) => {
  con.query(`UPDATE InternalRules SET ruleName = '${req.body.ruleName}', maxWarning= '${req.body.maxWarning}', price= '${req.body.price}',ruleDetails= '${req.body.ruleDetails}' where ruleID = '${req.body.ruleID}'`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/extendLicense', (req, res) => {
  con.query(`UPDATE CarOwners SET expiredDate = '${req.body.expiredDate}' where carOwnerID = '${req.body.carOwnerID}'`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.json(result)
  });
})

app.post('/addSticker', (req, res) => {
  con.query(`
  insert into CarOwners (carOwnerFirstName,carOwnerLastName,carOwnerTel,carOwnerEmail,carOwnerAddress,registerDate,expiredDate,roleID,staffID)
   VALUES('${req.body.carOwnerFname}', '${req.body.carOwnerLname}','${req.body.carOwnerTel}','${req.body.carOwnerEmail}','${req.body.carOwnerAddress}','${req.body.registerDate}','${req.body.expireDate}','1','1');
  `,`insert into Car (licensePlate,province,carColor,carBrand,carModel,carOwnerID,stickerID)
  VALUES('${req.body.licensePlate}','1', '${req.body.carColor}','${req.body.brandCar}','${req.body.modelCar}','1','1')`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})



app.post('/deleteLocation', (req, res) => {
  con.query(`Delete from Location where locationID = ${req.body.locationID}`, function (err, result, fields) {
    if (err) throw err;
    res.json(result)
  });
})

})