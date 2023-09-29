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
const mysql = require("mysql2");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
app.use(fileUpload());
app.use("/public", express.static(__dirname + "/public"));

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.post("/login", (req, res) => {
  const json = req.body;
  if (json.user != undefined) {
    const { user } = json;
    const sqllogin = `SELECT * FROM members WHERE username = '${user}'`;
    connection.query(sqllogin, (err, results) => {
      if (err) return res.status(500).json({ message: "Not excute" });
      if (results[0] === undefined)
        return res.status(403).json({ message: "User not Found" });
      const {
        username,
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
      data: json,
    });
  }
});
app.post("/auth", (req, res) => {
  try {
    const decode = jwt.verify(req.headers.authorization, "token_key");
    res.status(200).json({ status: "ok", message: "ok", data: decode });
  } catch (err) {
    res.json({
      message: "time exipire",
      boo: "true",
      why: req.headers.authorization,
      data: { err },
    });
    console.log("false" + { err });
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
app.post("/api/upload", (req, res, next) => {
  const uploadFile = req.files.file;
  const reqname = req.body.engname;
  uploadFile.mv(`${__dirname}/public/files/${reqname}`, (err) => {
    if (err) {
      return res.status(500).send({ message: "Doesn't Upload", msg: { err } });
    }
    res.status(200).json({
      status: "ok",
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
  const validate =
    "SELECT * FROM `persons` WHERE `outlanderNo` ='" + postparam.id_outer + "'";
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
        .json({ message: "Database Not Connect or Input Valid", msg: err });
    }
    if (results[0] === undefined) {
      connection.query(sqlinsert, (err, results, fields) => {
        if (err) {
          return res.status(500).json({ message: "Input Valid", msg: err });
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
  const ids = req.params.id;
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
    ids +
    "";
  const checkid_out =
    sqlget + " WHERE `outlanderNo`='" + postparam.id_outer + "'";
  const updateq = `UPDATE persons SET outlanderNo  = ' ' WHERE personid = ${ids}`;
  connection.query(updateq, (err, results, fields) => {
    if (err) return res.status(500).json(err);
    connection.query(checkid_out, (err, results, fields) => {
      if (err) return res.status(500).json({ message: "Database Not Connect" });
      if (results[0] !== undefined) return res.json("รหัสต่างด้าวซ้ำ");
      connection.query(sqlupdate, (err, results, fields) => {
        if (err)
          return res.status(500).json({ message: "Database Not Connect " });

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
  });
});

app.post("/api/upcom", (req, res) => {});
app.put("/api/ecom", (req, res) => {});

app.listen(port, function () {
  console.log(`Server Listen on port ${port}`);
});
