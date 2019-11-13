const express = require('express')
var cors = require('cors')
var mysql = require('mysql');
var bodyParser = require('body-parser')
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
const jwt = require("jwt-simple");
const bcrypt = require('bcrypt');
const passport = require("passport");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
 
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

  const SECRET = "MY_SECRET_KEY"

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: SECRET
  };

  const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
    if (payload.sub !== undefined) done(null, true);
    else done(null, false);
  });

  passport.use(jwtAuth);

  const loginMiddleWare = (req, res, next) => {
  
  con.query(`select firstName, lastName, staffEmail,staffRole,staffImages from Staffs where staffEmail = "${req.body.staffEmail}"`, function (err, result){
     if(err) throw err
     if(result.length !== 0){
      let cipherPassword = `SELECT s.staffPassword FROM Staffs s WHERE s.staffEmail = "${req.body.staffEmail}"`
      con.query(cipherPassword, function (err, result) {
        
        if (err) throw err;
        let hashPassword = result[0].staffPassword
    
    
        let match = bcrypt.compareSync(req.body.staffPassword, hashPassword)
      
        if(match){
          con.query(`select firstName, lastName, staffEmail,staffRole,staffImages from Staffs where staffEmail = "${req.body.staffEmail}"`, function (err, result) {
            if (err) throw err;
        
            if(result.length !== 0){
              next();
            }
            else{
              res.json("wrong")
            }
          });
        }else{
          res.json("wrong")
        }
    
      })
     }
     else{
       res.json("wrong")
     }
  })

  

 };

 app.post("/login", loginMiddleWare, (req, res) => {
    const payload = {
       sub: req.body.staffEmail,
       iat: new Date().getTime()
    };
    res.json(jwt.encode(payload, SECRET));
 });

 const requireJWTAuth = passport.authenticate("jwt", {session:false});

 app.get('/userData/:email', requireJWTAuth ,  (req, res) => {
  let email = req.params.email
  con.query(`select s.staffID, s.firstName, s.lastName, s.staffEmail, s.staffRole, s.staffImages, s.organizationID, o.organizationName from Staffs s join Organizations o on o.organizationID = s.organizationID where s.staffEmail = "${email}"`, function (err, result) {  
    if (err) throw err;
    res.json(result)
  });
})

  app.get('/problem/:value', (req, res) => {
    let key = req.params.value
    con.query(`select p.problemID, p.dateOfProblem, p.timeOfProblem, p.scene, c.licensePlate, ir.ruleName, s.firstName, p.problemDetails, p.evidenceImage from Staffs s JOIN Problems p on s.staffID = p.staffID JOIN InternalRules ir on p.ruleID = ir.ruleID join TrafficTicket t on p.ticketID = t.ticketID join Car c on t.carID = c.carID where p.organizationID = "${key}"`, function (err, result) {
      if (err) throw err;
      res.json(result)
    });
})

app.post('/deleteEvent', (req, res) => {
  con.query(`Select ticketID from Problems where problemID = ${req.body.problemID}` , function (err, result) {
    if (err) throw err;
    if(result[0] != null){
      let ticketID = result[0].ticketID
      con.query(`Delete from Problems where problemID = ${req.body.problemID}`, `Delete from TrafficTicket where ticketID = ${ticketID}` , function (err, result) {
        if (err) throw err;
        res.json(result)
      });
      
    }
  })
})

app.get('/staff/:value', (req, res) => {
  let key = req.params.value
  con.query(`select staffID, firstName,lastName, staffTel, staffEmail from Staffs where staffRole = 'Administrator' and organizationID = ${key}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/securityguard/:value', (req, res) => {
  let key = req.params.value
  con.query(`select staffID, firstName,lastName,staffTel, staffEmail from Staffs where staffRole = 'Security Guard' and organizationID = ${key}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/rule/:value', (req, res) => {
  let key = req.params.value
  con.query(`select ruleID ,ruleName, maxWarning, price from InternalRules where organizationID = ${key}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addstaff', (req, res) => {
  bcrypt.hash(req.body.staffPassword, 10, function(err, hashPassword) {
    con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail, staffPassword, staffImages,staffRole,organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}', '${req.body.staffEmail}','${hashPassword}','${req.body.staffImages}', 'Administrator', '${req.body.organizationID}')
    `, function (err, result) {
    if (err) throw err;
    res.json(result)
  }); 
  })
})

app.post('/addsecurityguard', (req, res) => {
  bcrypt.hash(req.body.staffPassword, 10, function(err, hashPassword) {
    con.query(`
    insert into Staffs (firstName,lastName,staffTel,staffEmail, staffPassword, staffImages,staffRole, organizationID) values('${req.body.firstName}', '${req.body.lastName}', '${req.body.staffTel}','${req.body.staffEmail}','${hashPassword}','${req.body.staffImages}', 'Security Guard','${req.body.organizationID}' )
    `, function (err, result) {
    if (err) throw err;
    res.json(result);
  }); 
  })
})

app.post('/deleteStaff', (req, res) => {
  con.query(`Delete from Staffs where staffID = ${req.body.staffID}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addrule', (req, res) => {
  con.query(`
    insert into InternalRules (ruleName ,price,maxWarning  ,organizationID) values('${req.body.ruleName}', '${req.body.price}', '${req.body.maxWarning}', '${req.body.organizationID}')
    `, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/ruleId/:organizationID', (req,res)=>{
  let key = req.params.organizationID
  con.query(`select MIN(ruleID) AS ruleID from InternalRules where organizationID = ${key}`, function (err, result) {
    if(err) throw err
    res.json(result) 
  })
})

app.get('/stickerName/:value', (req, res) => {
  let key = req.params.value
  con.query(`select stickerID,typeOfSticker,colorOfSticker AS value from Sticker where organizationID = ${key}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addSticker', (req, res) => {
  con.query(`
    insert into Sticker (typeOfSticker ,colorOfSticker ,ruleID, organizationID) values('${req.body.typeOfSticker}', '${req.body.colorOfSticker}', '${req.body.ruleID}','${req.body.organizationID}')
    `, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addLocationLabel', (req, res) => {
  con.query(`
    insert into Location (locationName,locationCode,stickerID) values('${req.body.locationName}', '${req.body.locationCode}','${req.body.stickerID}')
    `, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/location/:value', (req, res) => {
  let key = req.params.value
  con.query(`select l.locationID, l.locationName, l.locationCode, s.colorOfSticker from Location l join Sticker s on l.stickerID = s.stickerID where l.organizationID = ${key}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/stickerTable/:value', (req, res) => {
  let key = req.params.value
  con.query(`select stickerID,typeOfSticker,colorOfSticker from Sticker where organizationID = ${key}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/stickerColor/:value', (req, res)=>{
  let key = req.params.value
  con.query(`SELECT s.colorOfSticker AS value, s.stickerID FROM Sticker s where organizationID = ${key}` , function (err, result) {
    if (err) throw err;
    res.json(result)
  })
})

app.post('/deleteRule', (req, res) => {
  con.query(`Delete from InternalRules where ruleID = ${req.body.ruleID}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/carOwner/:value', (req, res) => {
  let key = req.params.value
  con.query(`select carOwnerID, carOwnerFirstName, carOwnerLastName, carOwnerTel, carOwnerEmail,carOwnerAddress, registerDate, expiredDate from CarOwners where organizationID = ${key}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/getSearchValue/:value/:id', (req, res) => {
  let key = req.params.value
  let id = req.params.id
  con.query(`select carOwnerID, carOwnerFirstName, carOwnerLastName, carOwnerTel, carOwnerEmail,carOwnerAddress, registerDate, expiredDate from CarOwners where carOwnerFirstName like '%${key}%' or carOwnerLastName like '%${key}%' and organizationID = ${id}`, function (err, result) {
    if (err) throw err;   
    res.json(result)
  });
})

app.get('/getSearchLicensePlate/:value/:id', (req, res) => {
  let key = req.params.value
  let id = req.params.id
  con.query(`select p.problemID, p.dateOfProblem, p.timeOfProblem, p.scene, c.licensePlate, ir.ruleName, s.firstName, p.problemDetails, p.evidenceImage from Staffs s JOIN Problems p on s.staffID = p.staffID JOIN InternalRules ir on p.ruleID = ir.ruleID join TrafficTicket t on p.ticketID = t.ticketID join Car c on t.carID = c.carID where c.licensePlate like '%${key}%' AND p.organizationID = ${id}`, function (err, result) {
    if (err) throw err;   
    res.json(result)
  });
})


app.post('/editCarOwner', (req, res) => {
  con.query(`UPDATE CarOwners SET carOwnerFirstName = '${req.body.carOwnerFirstName}', carOwnerLastName= '${req.body.carOwnerLastName}', carOwnerEmail= '${req.body.carOwnerEmail}',carOwnerTel= '${req.body.carOwnerTel}',carOwnerAddress= '${req.body.carOwnerAddress}' where carOwnerID = '${req.body.carOwnerID}'`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/deleteCarOwner', (req, res) => {
  con.query(`Delete from CarOwners where carOwnerID = ${req.body.carOwnerID}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/editRule', (req, res) => {
  con.query(`UPDATE InternalRules SET ruleName = '${req.body.ruleName}', maxWarning= '${req.body.maxWarning}', price= '${req.body.price}' where ruleID = '${req.body.ruleID}'`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/extendLicense', (req, res) => {
  con.query(`UPDATE CarOwners SET expiredDate = '${req.body.expiredDate}' where carOwnerID = '${req.body.carOwnerID}'`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/addCarowner', (req, res) => {
  con.query(`
  insert into CarOwners (carOwnerFirstName,carOwnerLastName,carOwnerTel,carOwnerEmail,carOwnerAddress,registerDate,expiredDate,organizationID)
   VALUES('${req.body.carOwnerFname}', '${req.body.carOwnerLname}','${req.body.carOwnerTel}','${req.body.carOwnerEmail}','${req.body.carOwnerAddress}','${req.body.registerDate}','${req.body.expireDate}','${req.body.organizationID}');
  `, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/lastCarOwnerId/:organizationID', (req,res)=>{
  let key = req.params.organizationID
  con.query(`select MAX(carOwnerID) AS lastID from CarOwners where organizationID = ${key}`, function (err, result) {
    if(err) throw err
    res.json(result) 
  })
})

app.post('/addCar', (req, res) => {
  
  con.query(`insert into Car (licensePlate,province,carColor,carBrand,carModel,carOwnerID,stickerID,organizationID)
  VALUES('${req.body.licensePlate}','${req.body.province}','${req.body.carColor}','${req.body.brandCar}','${req.body.modelCar}',${req.body.carOwnerID},${req.body.stickerID},${req.body.organizationID})`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.post('/deleteLocation', (req, res) => {
  con.query(`Delete from Location where locationID = ${req.body.locationID}`, function (err, result) {
    if (err) throw err;
    res.json(result)
  });
})

})