const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
require("dotenv").config("");
const app = express();

const port = 5000;
// const bcrypt = require("bcrypt");
const mysql = require("mysql2");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
app.use(fileUpload());
app.use("/public", express.static(__dirname + "/public"));
app.listen(port, function () {
  console.log(`Server Listen on port ${port}`);
});

app.use((req, res, next) =>{
  req.setHeader("Access-Control-Allow-Origin", "*"); 
  req.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, *");
  req.setHeader("Access-Control-Allow-Headers", "Content-Type, *");
  req.setHeader("Access-Control-Allow-Credentials", true);
  req.setHeader("Content-Type","application/json")
  req.setHeader("Accept","application/json")
  req.setHeader("Origin", "https://main.d1yi7ula7o7ab3.amplifyapp.com");


  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, *");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, *");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-Type","application/json")
  res.setHeader("Accept","application/json")
  res.setHeader("Origin", "https://main.d1yi7ula7o7ab3.amplifyapp.com");
  next();
});

const connection  = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// app.post("/register"),
//   async (req, res) => {
//     try {
//       const { first_name, last_name, email, password } = req.body;
//       if (!(email && first_name && last_name && password)) {
//         res.status(400).send("Please inPut required");
//       }
//       const oldUser = await connection;
//     } catch (err) {
//       console.log(err);
//     }
//   };

app.post("/hello",(req, res) => {
  const json = req.body
  const { user, pass } = req.body;
  const sqllogin =
  "SELECT * FROM members WHERE username = '" + `${user}` + "'";
  connection.query(sqllogin,  (err, results) => {
    if (err) return res.status(500).json({ message: "Not excute" });
    return res.status(200).json({
      status: "ok",
      message: "Logged in",
      accessToken: jwt.sign({ username: results[0].username }, "token_key", {
        expiresIn: "1h",
      }),
      expiresIn: "1h",
      user: results
    })  
 }) 
})

// const c =  bcrypt.compare(password, hash);
      // if (c) {
  // }
      // return res.status(401).json({
      //   message: "The username and password your provided are invalid",
      // });


app.post("/loginsa", (req, res) => {
  const json = req.query
  if (json.user != undefined) {
    const { user } = req.query;
    const sqllogin =
      "SELECT * FROM members WHERE username = '" + `${user}` + "'";
    connection.query(sqllogin,  (err, results) => {
      if (err) return res.status(500).json({ message: "Not excute" });
      if (results[0] === undefined)
        return res.status(401).json({ message: "User not Found" });
      const {
        username,
        password,
        member_company,
        member_name,
        member_lastname,
        email,
        tel,
        company_no_outlander,
      } = results[0];
      
        return res.status(200).json({
          status: "ok",
          message: "Logged in",
          accessToken: jwt.sign({ username: username }, "token_key", {
            expiresIn: "1h",
          }),
          expiresIn: "1h",
          user: {
            fname: member_name,
            lname: member_lastname,
            username: username,
            company: member_company,
            email: email,
            tel: tel,
            companyNo: company_no_outlander,
          },
        });
    
    });
  } else {
    res.status(401).json({
      message: "The username or password your provided are invalid",
      data: json
    });
  }
});
// req.body.token ||
//     req.query.token ||
//     req.headers["x-access-token"] ||
app.post("/auth", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send("A token is required for authen");
  const authHeader = token;
  let accessToken;
  if (req.headers.authorization) {
    accessToken = authHeader.split(" ")[1];
  } else {
    accessToken = authHeader;
  }
  try {
    const decode = jwt.verify(accessToken, "token_key");
    res.status(200).json({ status: "ok", message: "ok", data: decode });
  } catch (err) {
    res.json({
      message: "time exipire",
      boo: "true",
      why: {token},
      data:{err}
    });
  }
});

app.get("/download/:filename", (req, res) => {
  const fliename = req.params.filename;
  const filePath = `${__dirname}/public/files/${fliename}`;
  res.download(filePath, (err) => {
    if (err) {
      res.json({
        message: "ไม่พบไฟล์ที่จะดาวน์โหลด ควรอัพโหลดไฟล์",
      });
    }
  });
});

//upload file
app.post("/api/upload", (req, res) => {
  const uploadFile = req.files.file;
  const reqname = req.body.engname;
  uploadFile.mv(__dirname + "/public/files/" + reqname, (err) => {
    if (err) {
      return res.status(500).send({ message: "Doesn't Upload" });
    }

    res.status(200).json({
      status: "ok",
      // file: __dirname + "\\public\\" + reqname,
      message: `Has been upload ${reqname}`,
    });
  });
});

//upload file
const sqlget = "SELECT * FROM persons";
// My SQL Server
app.get("/api/users", (req, res) => {
  connection.query(sqlget, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Server OFFLINE" });
    }
    res.status(200).send({
      data: results,
    });
  });
});
app.get("/api/users/:id", (req, res) => {
  const id = req.params.id;
  let sqlwhere = sqlget + " WHERE `personid` = " + id;
  connection.query(sqlwhere, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Server OFFLINE" });
    }
    if (results == "") {
      return res.status(402).json({
        status: "Data Not Found",
      });
    }
    res.status(200).json({
      status: "ok",
      message: `User Found`,
      data: results,
    });
  });
});

app.post("/api/plususers", (req, res) => {
  const postparam = req.body;
  const validate = sqlget + " WHERE `outlanderNo`='" + postparam.id_outer + "'";
  var sqlinsert =
    "INSERT INTO `persons`( `outlanderNo`, `prefix`, `firstname`, `lastname`, `prefixth`, `firstnameth`, `lastnameth`,`nationality`, `passportNo`, `passportdate`, `passportexp`,`pathpassport`, `visaNo`, `visadate`, `visaext`, `pathvisa`, `workpermitno`, `workpermitdate`, `workpermitext`, `pathworkpermit`, `ninetydate`, `ninetyexp`, `pathninety`,`company_no`,`companyname`,`picpath`) VALUES";
  sqlinsert +=
    " ('" +
    postparam.id_outer +
    "','" +
    postparam.engtitle +
    "','" +
    postparam.engname +
    "','" +
    postparam.engsurname +
    "','";
  sqlinsert +=
    postparam.thaititle +
    "','" +
    postparam.thainame +
    "','" +
    postparam.thaisurname +
    "','" +
    postparam.nationality +
    "','";
  sqlinsert +=
    postparam.id_passport +
    "','" +
    postparam.startpassport +
    "','" +
    postparam.endpassport +
    "','" +
    postparam.filepassport +
    "','";
  sqlinsert +=
    postparam.id_visa +
    "','" +
    postparam.startvisa +
    "','" +
    postparam.endvisa +
    "','" +
    postparam.filevisa +
    "','" +
    postparam.id_workpermit +
    "','" +
    postparam.startworkpermit +
    "','";
  sqlinsert +=
    postparam.endworkpermit +
    "','" +
    postparam.fileworkpermit +
    "','" +
    postparam.startninetydays +
    "','" +
    postparam.endninetydays +
    "','" +
    postparam.fileninetydays +
    "','";
  sqlinsert +=
    postparam.id_company +
    "','" +
    postparam.company +
    "','" +
    postparam.picpath +
    "')";
  connection.query(validate, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Input Valid" });
    }
    // console.log(results);
    if (results[0] === undefined) {
      connection.query(sqlinsert, (err, results, fields) => {
        if (err) {
          return res.status(500).json({ message: "Input Valid" });
        }

        res.status(200).json({
          status: "ok",
          message:
            "Insert ID: " +
            postparam.id_outer +
            " Name: " +
            postparam.thainame +
            " Successful",
        });
      });
    } else {
      res.status(200).json({
        message: "รหัสต่างด้าว :" + postparam.id_outer + " ซ้ำ",
      });
    }
  });
});

app.put("/api/upuser/:id", function (req, res) {
  const id = req.params.id;
  const validate = sqlget + " WHERE personid =" + id;
  const postparam = req.body;
  var sqlupdate =
    "UPDATE `persons` SET `outlanderNo`='" +
    postparam.id_outer +
    "',`prefix`='" +
    postparam.engtitle +
    "',`firstname`='" +
    postparam.engname +
    "',`lastname`='" +
    postparam.engsurname +
    "',`prefixth`='" +
    postparam.thaititle +
    "',`firstnameth`='" +
    postparam.thainame +
    "',`lastnameth`='" +
    postparam.thaisurname +
    "',`nationality`='" +
    postparam.nationality +
    "',`passportNo`='" +
    postparam.id_passport +
    "',`passportdate`='" +
    postparam.startpassport +
    "',`passportexp`='" +
    postparam.endpassport +
    "',`pathpassport`='" +
    postparam.filepassport +
    "',`visaNo`='" +
    postparam.id_visa +
    "',`visadate`='" +
    postparam.startvisa +
    "',`visaext`='" +
    postparam.endvisa +
    "',`pathvisa`='" +
    postparam.filevisa +
    "',`workpermitno`='" +
    postparam.id_workpermit +
    "',`workpermitdate`='" +
    postparam.startworkpermit +
    "',`workpermitext`='" +
    postparam.endworkpermit +
    "',`pathworkpermit`='" +
    postparam.fileworkpermit +
    "',`ninetydate`='" +
    postparam.startninetydays +
    "',`ninetyexp`='" +
    postparam.endninetydays +
    "',`pathninety`='" +
    postparam.fileninetydays +
    "',`company_no`='" +
    postparam.id_company +
    "',`companyname`='" +
    postparam.company +
    "',`picpath`='" +
    postparam.picpath +
    "' WHERE personid =" +
    id +
    "";
  const checkid_out =
    sqlget + " WHERE `outlanderNo`='" + postparam.id_outer + "'";
  connection.query(validate, (err, results, fields) => {
    if (err) {
      return res.status(500).json({ message: "Database Not Connect" });
    }

    if (results[0] !== undefined) {
      connection.query(checkid_out, (err, results, fields) => {
        if (err) {
          return res.status(500).json({ message: "Database Not Connect" });
        }
        if (results[0] !== undefined) {
          return res.status(403).json({ message: "รหัสต่างด้าวซ้ำ" });
        }
        connection.query(sqlupdate, (err, results, fields) => {
          if (err) {
            return res.status(500).json({ message: "Database Not Connect " });
          }
          res.status(200).json({
            status:
              "Update ID: " +
              postparam.id_outer +
              " Name: " +
              postparam.thainame +
              " Successful",
          });
        });
      });
    } else {
      res.status(403).json({
        mesage:
          "ID" + id + "Doesn't has in database ,Plese Check and Try again",
      });
    }
  });
});


