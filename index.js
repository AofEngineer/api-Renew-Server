const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const enva = process.env;
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
app.use(fileUpload());
app.use("/public", express.static(__dirname + "/public"));

const connection = mysql.createPool({
  host: enva.DB_HOST,
  user: enva.DB_USER,
  password: enva.DB_PASSWORD,
  database: enva.DB_DATABASE,
});

const jwtGenerate = (user) => {
  const accessToken = jwt.sign(
    { user: user.username, id: user.mem_id },
    enva.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3m",
      algorithm: "HS256",
    }
  );

  return accessToken;
};

const jwtRefreshTokenGenerate = (user) => {
  const refreshToken = jwt.sign(
    { user: user.username, id: user.mem_id },
    enva.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
      algorithm: "HS256",
    }
  );
  return refreshToken;
};

const jwtValidate = (req, res, next) => {
  try {
    // if (!req.headers.authorization) return res.sendStatus(401);
    // const token = req.headers.authorization;
    // jwt.verify(token, enva.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //   if (err) throw new Error();
    // });
    next();
  } catch (error) {
    return res.status(403).json();
  }
};

const jwtRefreshTokenValidate = (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ message: "no Authorization" });
    // if (!req.body.user) return res.status(401).json({message: "no body user"});
    if (!req.headers.tokenrefresh)
      return res.status(401).json({ message: "no tokenrefresh" });
    const decodetoken = jwt.decode(
      req.headers.authorization,
      enva.ACCESS_TOKEN_SECRET
    );
    // return res.json(req.headers.authorization);
    const sql = `SELECT * FROM members WHERE mem_id = '${decodetoken.id}'`;
    connection.query(sql, (err, results) => {
      if (err) return res.status(500).json({ err });
      if (
        !bcrypt.compareSync(results[0].refreshtoken, req.headers.tokenrefresh)
      )
        return res.json({ message: "token not match" });
      const token = results[0].refreshtoken;
      jwt.verify(token, enva.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) throw new Error(error);
        req.user = decoded;
        req.user.token = token;
        delete req.user.exp;
        delete req.user.iat;
      });
      next();
    });
  } catch (error) {
    // return res.json(req.body.user);
    return res
      .status(403)
      .json({ message: "Login Expire Please login againt " });
  }
};

app.post("/login", (req, res) => {
  const { user, hash } = req.body;
  const sql = `SELECT m.*,p.addpermis, p.delpermis,p.editpermis,p.readpermis,p.admin FROM members as m  LEFT JOIN permission as p ON m.piority = p.per_id WHERE username = '${user}'`;
  connection.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Database Not Connect", msg: err });
    const index = results.findIndex((e) => e.username === user);
    if (!user || index < 0)
      return res.status(400).json({ message: "User Invalid" });
    const data = results[0];

    if (bcrypt.compareSync(data.password, hash)) {
      const accessToken = jwtGenerate(data);
      const refresh_token = jwtRefreshTokenGenerate(data);
      const sqltoken = `UPDATE members SET refreshtoken='${refresh_token}' WHERE mem_id= ${data.mem_id}`;
      // return res.json(sqltoken);
      connection.query(sqltoken, res, (err, row) => {
        const refreshToken = bcrypt.hashSync(refresh_token, salt);
        const hashread = bcrypt.hashSync(data.readpermis.toString(), salt);
        const hashadd = bcrypt.hashSync(data.addpermis.toString(), salt);
        const hashedit = bcrypt.hashSync(data.editpermis.toString(), salt);
        const hashdel = bcrypt.hashSync(data.delpermis.toString(), salt);
        const admin = bcrypt.hashSync(data.admin.toString(), salt);
        if (err)
          return res
            .status(500)
            .json({ message: "Database Not Connect or Data Invalid" });
        res.status(200).json({
          status: "ok",
          message: "Logged in",
          accessToken,
          refreshToken,
          user: {
            fname: data.member_name,
            lname: data.member_lastname,
            username: data.username,
            company: data.member_company,
            email: data.email,
            tel: data.tel,
            companyNo: data.company_id,
            piority: {
              readpermis: hashread,
              addpermis: hashadd,
              editpermis: hashedit,
              delpermis: hashdel,
              role: admin,
            },
          },
        });
      });
    } else {
      res.status(400).json({
        message: "Password Invalid",
      });
    }
  });
});
app.post("/auth", jwtRefreshTokenValidate, (req, res) => {
  const access_token = jwtGenerate(req.user);
  return res.json({
    accesstoken: access_token,
  });
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
// jwtValidate,
// My SQL Server
app.get("/api/users", jwtValidate, (req, res) => {
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
app.get("/api/members", jwtValidate, (req, res) => {
  const mem_id = req.body.mem_id ? `WHERE mem_id = ${req.body.mem_id}` : ``;
  const sql = `SELECT username , member_name, member_lastname, email, tel, p.addpermis, p.delpermis,p.editpermis,p.readpermis FROM members as m  LEFT JOIN permission as p ON m.piority = p.per_id ${mem_id}`;
  connection.query(sql, (err, results, fields) => {
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
app.get("/api/company", jwtValidate, (req, res) => {
  const cpn_id = req.body.cpn_id ? `WHERE cpn_id = ${req.body.cpn_id}` : ``;
  const sql = `SELECT c.*,b.branchname,b.branch_no,b.branch_id FROM company as c  LEFT JOIN branch as b ON c.branch_id = b.branch_id ${cpn_id}`;
  connection.query(sql, (err, results, fields) => {
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

app.get("/api/users/:id", jwtValidate, (req, res) => {
  const { id } = req.params;
  const sqlwhere = `${sqlget} WHERE personid = ${id}`;
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

app.post("/api/plususers", jwtValidate, (req, res) => {
  const postparam = req.body;
  const { outlanderNo } = postparam;
  const validate = `SELECT * FROM persons WHERE outlanderNo ='${outlanderNo}'`;
  connection.query(validate, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Input Valid", msg: err });
    }
    const index = results.findIndex((e) => e.outlanderNo === outlanderNo);
    let text = "";
    for (const x in postparam) {
      if (x === "personid" || x === "member_group" || x === "company_id") {
        text += `${postparam[x]},`;
      } else {
        text += `'${postparam[x]}',`;
      }
    }
    text = text.slice(0, -1);
    const sql = `INSERT INTO persons(${Object.keys(
      postparam
    )})VALUES (${text}) `;

    if (index < 0) {
      connection.query(sql, (err, results, fields) => {
        if (err) {
          return res.status(500).json({ message: "Input Valid", msg: err });
        }

        res.status(200).json({
          status: "ok",
          message:
            "Insert ID: " +
            outlanderNo +
            " Name: " +
            postparam.firstnameth +
            " Successful",
        });
      });
    } else {
      res.status(200).json({
        message: `รหัส : ${outlanderNo} นี้มีอยู่แล้ว`,
      });
    }
  });
});

app.put("/api/upuser/:id", jwtValidate, function (req, res) {
  const ids = req.params.id;
  const upparam = req.body;
  const { outlanderNo } = upparam;
  let text = "";
  for (const x in upparam) {
    if (x === "personid" || x === "member_group" || x === "company_id") {
      text += `${x}=${upparam[x]},`;
    } else {
      text += `${x}='${upparam[x]}',`;
    }
  }
  text = text.slice(0, -1);
  const sql = `UPDATE persons SET ${text} WHERE personid = ${ids}`;
  // return res.json(sql);
  const checkid_out = `SELECT * FROM persons WHERE outlanderNo = '${outlanderNo}'`;
  const updateq = `UPDATE persons SET outlanderNo  = ' ' WHERE personid = ${ids}`;
  connection.query(updateq, (err, results, fields) => {
    if (err) return res.status(500).json(err);
    connection.query(checkid_out, (err, results, fields) => {
      if (err) return res.status(500).json({ message: "Database Not Connect" });
      const index = results.findIndex((e) => e.outlanderNo === outlanderNo);
      if (index >= 0) return res.json(`รหัส : ${outlanderNo} นี้มีอยู่แล้ว`);
      connection.query(sql, (err, results, fields) => {
        if (err)
          return res.status(500).json({ message: "Database Not Connect " });
        res.status(200).json({
          status:
            "Update ID: " +
            outlanderNo +
            " Name: " +
            upparam.firstnameth +
            " Successful",
        });
      });
    });
  });
});

app.post("/api/upcom", jwtValidate, (req, res) => {
  const postparam = req.body;
  const { c_iden, cpn_n } = postparam;
  const validate = `SELECT * FROM company WHERE c_iden ='${c_iden}'`;
  connection.query(validate, (err, results, fields) => {
    if (err) return res.status(500).json(err);
    const index = results.findIndex((e) => e.c_iden === c_iden);
    if (index >= 0)
      return res
        .status(400)
        .json({ message: `บริษัทเลขที่ : ${c_iden}  มีอยู่แล้ว` });
    let text = "";
    for (const x in postparam) {
      if (x === "member_group") {
        text += `${postparam[x]},`;
      } else {
        text += `'${postparam[x]}',`;
      }
    }
    text = text.slice(0, -1);
    const sql = `INSERT INTO company(${Object.keys(
      postparam
    )})VALUES (${text}) `;
    connection.query(sql, (err, results, fields) => {
      if (err) return res.status(500).json(err);
      res.status(200).json({
        status: "ok",
        message: "Insert ID: " + c_iden + " Name: " + cpn_n + " Successful",
      });
    });
  });
});

app.put("/api/ecom/:id", jwtValidate, (req, res) => {
  const ids = req.params.id;
  const upparam = req.body;
  const { c_iden, cpn_n } = upparam;
  let text = "";
  for (const x in upparam) {
    if (x === "member_group") {
      text += `${x}=${upparam[x]},`;
    } else {
      text += `${x}='${upparam[x]}',`;
    }
  }
  text = text.slice(0, -1);
  const sql = `UPDATE company SET ${text} WHERE cpn_id = ${ids}`;
  // return res.json(sql);
  const checkid = `SELECT * FROM company WHERE c_iden = '${c_iden}'`;
  const updateq = `UPDATE company SET c_iden  = ' ' WHERE cpn_id = ${ids}`;
  connection.query(updateq, (err, results, fields) => {
    if (err) return res.status(500).json(err);
    connection.query(checkid, (err, results, fields) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Database Not Connect", msg: err });
      const index = results.findIndex((e) => e.outlanderNo === outlanderNo);
      if (index >= 0) return res.json(`บริษัทเลขที่ : ${c_iden} นี้มีอยู่แล้ว`);
      connection.query(sql, (err, results, fields) => {
        if (err)
          return res.status(500).json({ message: "Database Not Connect " });
        res.status(200).json({
          status:
            "Update รหัสบริษัท: " + c_iden + " Name: " + cpn_n + " Successful",
        });
      });
    });
  });
});

app.post("/api/members", jwtValidate, (req, res) => {
  const postmember = req.body.members;
  const postpermis = req.body.permis;
  const { username } = postmember;
  const validate = `SELECT * FROM members WHERE username ='${username}'`;
  connection.query(validate, (err, resultsva, fields) => {
    const index = resultsva.findIndex((e) => e.username === username);
    if (index >= 0)
      return res.status(400).json({ message: `username : ${username}  ซ้ำ` });
    if (err) return res.status(500).json(err);
    let text = "";
    for (const x in postpermis) {
      text += `${postpermis[x]},`;
    }
    text = text.slice(0, -1);
    const permis = `INSERT INTO permission(${Object.keys(
      postpermis
    )})VALUES (${text}) `;
    connection.query(permis, (err, resultsper, fields) => {
      let str = "";
      if (err) return res.status(500).json(err);
      for (const x in postmember) {
        if (x === "piority") {
          str += `${resultsper.insertId},`;
        } else {
          str += `'${postmember[x]}',`;
        }
      }
      str = str.slice(0, -1);
      const sql = `INSERT INTO members(${Object.keys(
        postmember
      )})VALUES(${str})`;
      // return res.json(sql);
      connection.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({
          status: "ok",
          message: `Add Username: ${username}  Successful`,
        });
      });
    });
  });
});

app.delete("/api/del", jwtValidate, (req, res) => {
  // const del = Object.keys(req.body);
  const ids = req.body;
  let id = "";
  let a = "";
  for (const x in ids) {
    id += `${ids[x]}`;
    a += `${x}`;
  }
  // return res.json(a);
  switch (a) {
    case "mem_id":
      const sql = `SELECT * FROM members WHERE mem_id = ${id}`;
      // return res.json(sql);
      connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: err });
        const index = results.findIndex((e) => e.mem_id === id);
        if (index >= 0)
          return res.status(400).json({ message: `ID: ${id} Notfound in DB` });
        const { member_name, piority } = results[0];
        connection.query(
          `DELETE FROM permission WHERE per_id= ${piority}`,
          (err) => {
            if (err) return res.status(500).json({ message: err });
            res
              .status(200)
              .json({ message: `User : ${member_name} has been delete` });
          }
        );
      });

      break;
    case "person_id":
      connection.query(
        `DELETE FROM persons WHERE ${a}= ${id}`,
        (err, results) => {
          if (err) return res.status(500).json({ message: err });
          res.status(200).json({ message: `PersonID: ${id} has been delete` });
        }
      );
      break;
    case "cpn_id":
      connection.query(
        `DELETE FROM company WHERE ${a}= ${id}`,
        (err, results) => {
          if (err) return res.status(500).json({ message: err });
          res.status(200).json({ message: `CompanyID: ${id} has been delete` });
        }
      );
      break;
    default:
      res.json({ message: `no data` });
      break;
  }
});

app.listen(enva.PORT, function () {
  console.log(`Server Listen on port ${enva.PORT}`);
});
