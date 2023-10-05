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
  database: enva.DB_NAME,
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
      if (err)
        return res
          .status(500)
          .json({ status: "Error", message: "Database Not Connect " });
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
  const sql = `SELECT * FROM members WHERE username = '${user}'`;
  connection.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Database Not Connect", msg: err });
    const index = results.findIndex((e) => e.username === user);
    if (!user || index < 0)
      return res.status(400).json({ status: "Error", message: "User Invalid" });
    const data = results[0];

    if (!bcrypt.compareSync(data.password, hash))
      return res
        .status(400)
        .json({ status: "Error", message: "Password Invalid" });
    const accessToken = jwtGenerate(data);
    const refresh_token = jwtRefreshTokenGenerate(data);
    const sqltoken = `UPDATE members SET refreshtoken='${refresh_token}' WHERE mem_id= ${data.mem_id}`;
    // return res.json(sqltoken);
    connection.query(sqltoken, res, (err, row) => {
      const refreshToken = bcrypt.hashSync(refresh_token, salt);
      const hashread = bcrypt.hashSync(data.m_read.toString(), salt);
      const hashadd = bcrypt.hashSync(data.m_add.toString(), salt);
      const hashedit = bcrypt.hashSync(data.m_edit.toString(), salt);
      const hashdel = bcrypt.hashSync(data.m_del.toString(), salt);
      const admin = bcrypt.hashSync(data.m_admin.toString(), salt);
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
          group: data.member_group,
          read: hashread,
          add: hashadd,
          edit: hashedit,
          del: hashdel,
          role: admin,
        },
      });
    });
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
  const filePath = `usr/expressdocker/files/${fliename}`;
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
  const reqname = req.body.firstname;
  uploadFile.mv(`/files/${reqname}`, (err) => {
    if (err) {
      return res.status(500).json({ message: "Doesn't Upload", msg: { err } });
    }
    res.status(200).json({
      status: "ok",
      message: `Has been upload ${reqname}`,
      filename: reqname,
    });
  });
});

//upload file

// jwtValidate,
// My SQL Server
///////////////////////// GET /////////////////////////
app.post("/api/users", jwtValidate, (req, res) => {
  if (req.body.member_group) return res.status();
  const group = req.body.member_group
    ? `WHERE p.member_group = ${req.body.member_group}`
    : ``;

  const sqlget = `SELECT p.*, c.* FROM persons as p LEFT JOIN company as c ON p.company_id = c.cpn_id ${group}`;
  connection.query(sqlget, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Server OFFLINE" });
    }
    res.status(200).send({
      status: "ok",
      data: results,
    });
  });
});

app.post("/api/members", jwtValidate, (req, res) => {
  const group = req.body.member_group
    ? `WHERE member_group = ${req.body.member_group} and m_admin = 0`
    : ``;
  const sql = `SELECT mem_id, username , member_name, member_lastname, email, tel, m_add, m_del, m_edit, m_read FROM members  ${group}`;
  // return console.log(sql);
  connection.query(sql, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Server OFFLINE" });
    }
    res.status(200).send({
      status: "ok",
      data: results,
    });
  });
});

app.post("/api/company", jwtValidate, (req, res) => {
  const group = req.body.member_group
    ? `WHERE c.member_group = ${req.body.member_group}`
    : ``;
  // const cpn_id = req.body.cpn_id ? `WHERE cpn_id = ${req.body.cpn_id}` : ``;
  const sql = `SELECT c.*,b.branchname,b.branch_no,b.branch_id FROM company as c  LEFT JOIN branch as b ON c.branch_id = b.branch_id ${group}`;
  // console.log(sql);
  connection.query(sql, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Server OFFLINE" });
    }
    res.status(200).send({
      status: "ok",
      data: results,
    });
  });
});
///////////////////////// GET /////////////////////////
app.post("/api/plususers", jwtValidate, (req, res) => {
  const postparam = req.body;
  const { outlanderNo } = postparam;
  // return res.json(postparam);
  const validate = `SELECT * FROM persons WHERE outlanderNo ='${outlanderNo}'`;
  connection.query(validate, (err, results, fields) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database Not Connect or Input Valid", msg: err });
    }
    const index = results.findIndex((e) => e.outlanderNo === outlanderNo);
    if (index >= 0)
      return res
        .status(200)
        .json({ status: "ok", message: `รหัส : ${outlanderNo} นี้มีอยู่แล้ว` });
    let text = "";
    for (const x in postparam) {
      if (x === "person_id" || x === "member_group" || x === "company_id") {
        if (x === "member_group") {
          text += `10,`;
        } else {
          text += `${postparam[x]},`;
        }
      } else {
        text += `'${postparam[x]}',`;
      }
    }
    text = text.slice(0, -1);
    const sql = `INSERT INTO persons(${Object.keys(
      postparam
    )})VALUES (${text}) `;

    connection.query(sql, (err, results, fields) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "Error", message: "Input Valid", msg: err });
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
  });
});

app.put("/api/upuser", jwtValidate, function (req, res) {
  const upparam = req.body;
  // return console.log(upparam);
  const { outlanderNo, person_id } = upparam;
  let text = "";
  for (const x in upparam) {
    if (x === "person_id" || x === "member_group" || x === "company_id") {
      text += `${x}=${upparam[x]},`;
    } else {
      text += `${x}='${upparam[x]}',`;
    }
  }
  text = text.slice(0, -1);
  const sql = `UPDATE persons SET ${text} WHERE person_id = ${person_id}`;
  // return res.json(sql);
  const checkid_out = `SELECT * FROM persons WHERE outlanderNo = '${outlanderNo}'`;
  connection.query(checkid_out, (err, results, fields) => {
    if (err)
      return res
        .status(500)
        .json({ status: "Error", message: "Database Not Connect" });
    const index = results.findIndex((e) => e.outlanderNo === outlanderNo);
    if (index > 0) return res.json(`รหัส : ${outlanderNo} นี้มีอยู่แล้ว`);
    connection.query(sql, (err, results, fields) => {
      if (err)
        return res
          .status(500)
          .json({ status: "Error", message: "Database Not Connect " });
      res.status(200).json({
        status: "ok",
        message:
          "Update ID: " +
          outlanderNo +
          " Name: " +
          upparam.firstnameth +
          " Successful",
      });
    });
  });
});

app.post("/api/upcom", jwtValidate, (req, res) => {
  const postcompany = req.body;
  const username = req.headers.username ? req.headers.username : "";
  const { c_iden, cpn_n } = postcompany;
  const validate = `SELECT * FROM company WHERE c_iden ='${c_iden}'`;
  connection.query(validate, (err, results, fields) => {
    if (err)
      return res
        .status(500)
        .json({ status: "Error", message: "Database Not Connect " });
    const index = results.findIndex((e) => e.c_iden === c_iden);
    if (index >= 0)
      return res.status(400).json({
        status: "Error",
        message: `เลขประจำตัวบริษัท: ${c_iden}  มีอยู่แล้ว`,
      });
    let text = "";
    for (const x in postcompany) {
      if (x === "member_group") {
        text += `${postcompany[x]},`;
      } else {
        text += `'${postcompany[x]}',`;
      }
    }
    text = text.slice(0, -1);
    const sql = `INSERT INTO company(${Object.keys(
      postcompany
    )})VALUES (${text}) `;
    // return res.json(sql);
    connection.query(sql, (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ status: "Error", message: "Database Not Connect " });
      if (username !== "") {
        const str = `UPDATE members SET company_id = ${results.insertId} WHERE username = "${username}"`;
        console.log(str);
        connection.query(str, (err, ress) => {
          if (err)
            return res
              .status(500)
              .json({ status: "Error", message: "Database Not Connect " });
          return res.status(200).json({
            status: "ok",
            companyNo: results.insertId,
            message: "Insert ID: " + c_iden + " Name: " + cpn_n + " Successful",
          });
        });
      } else {
        res
          .status(200)
          .json({ status: "ok", message: `บริษัท: ${cpn_n} เพิ่มสำเร็จแล้ว` });
      }
    });
  });
});

app.put("/api/ecom", jwtValidate, (req, res) => {
  const upparam = req.body;
  const { c_iden, cpn_n, cpn_id } = upparam;
  let text = "";
  for (const x in upparam) {
    if (x === "member_group" || x === "cpn_id") {
      if (x === "cpn_id") {
        text += ``;
      } else {
        text += `${x}=${upparam[x]},`;
      }
    } else {
      text += `${x}='${upparam[x]}',`;
    }
  }
  text = text.slice(0, -1);
  const sql = `UPDATE company SET ${text} WHERE cpn_id = ${cpn_id}`;
  // return res.json(sql);
  const checkid = `SELECT * FROM company WHERE c_iden = '${c_iden}'`;
  const updateq = `UPDATE company SET c_iden  = ' ' WHERE cpn_id = ${cpn_id}`;
  connection.query(updateq, (err, results, fields) => {
    if (err)
      return res
        .status(500)
        .json({ status: "Error", message: "Database Not Connect " });
    connection.query(checkid, (err, results, fields) => {
      if (err)
        return res
          .status(500)
          .json({ status: "Error", message: "Database Not Connect " });
      const index = results.findIndex((e) => e.outlanderNo === outlanderNo);
      if (index >= 0) return res.json(`บริษัทเลขที่ : ${c_iden} นี้มีอยู่แล้ว`);
      connection.query(sql, (err, results, fields) => {
        if (err)
          return res
            .status(500)
            .json({ status: "Error", message: "Database Not Connect " });
        res.status(200).json({
          status: "ok",
          message: ` เลขประจำตัวบริษัท: ${c_iden} Name: ${cpn_n} แก้ไขสำเร็จ`,
        });
      });
    });
  });
});

app.post("/api/addmembers", jwtValidate, (req, res) => {
  const postmember = req.body;
  const { username } = postmember;
  const validate = `SELECT * FROM members WHERE username ='${username}'`;
  connection.query(validate, (err, resultsva, fields) => {
    const index = resultsva.findIndex((e) => e.username === username);
    if (index >= 0)
      return res
        .status(400)
        .json({ status: "Error", message: `username : ${username}  ซ้ำ` });
    if (err)
      return res
        .status(500)
        .json({ status: "Error", message: "Database Not Connect " });
    let str = "";
    for (const x in postmember) {
      if (
        x === "member_group" ||
        x === "m_read" ||
        x === "m_add" ||
        x === "m_edit"
      ) {
        str += `${postmember[x]},`;
      } else {
        str += `"${postmember[x]}",`;
      }
    }
    str = str.slice(0, -1);
    const sql = `INSERT INTO members(${Object.keys(
      postmember
    )},m_admin,m_root)VALUES(${str},0,0)`;
    connection.query(sql, (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ status: "Error", message: "Database Not Connect " });
      res.status(200).json({
        status: "ok",
        message: `Add Username: ${username}  Successful`,
      });
    });
  });
});
app.put("/api/emembers", (req, res) => {
  const postmember = req.body;
  const { mem_id, username, member_name } = postmember;
  let text = "";
  for (const x in postmember) {
    if (
      x === "member_group" ||
      x === "mem_id" ||
      x === "m_read" ||
      x === "m_add" ||
      x === "m_edit"
    ) {
      if (x === "mem_id") {
        text += ``;
      } else {
        text += `${x}=${postmember[x]},`;
      }
    } else {
      text += `${x}='${postmember[x]}',`;
    }
  }
  text = text.slice(0, -1);
  const sql = `UPDATE members SET ${text} WHERE mem_id = ${mem_id}`;
  const checkid = `SELECT * FROM members WHERE username = '${username}'`;
  connection.query(checkid, (err, results, fields) => {
    if (err)
      return res
        .status(500)
        .json({ status: "Error", message: "Database Not Connect " });
    const index = results.findIndex((e) => e.username === username);
    if (index > 0) return res.json(`ผู้ดูแลระบบ : ${username} นี้มีอยู่แล้ว`);
    connection.query(sql, (err, results, fields) => {
      if (err)
        return res
          .status(500)
          .json({ status: "Error", message: "Database Not Connect " });
      res.status(200).json({
        status: "ok",
        message: `ผู้ดูแลระบบ: ${username} Name: ${member_name} Successful`,
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
      connection.query(`DELETE FROM members WHERE ${a}= ${id}`, (err) => {
        if (err)
          return res
            .status(500)
            .json({ status: "Error", message: "Database Not Connect " });
        res
          .status(200)
          .json({ status: "ok", message: `User : ${id} has been delete` });
      });
      break;
    case "person_id":
      connection.query(
        `DELETE FROM persons WHERE ${a}= ${id}`,
        (err, results) => {
          if (err)
            return res
              .status(500)
              .json({ status: "Error", message: "Database Not Connect " });
          res
            .status(200)
            .json({ status: "ok", message: `PersonID: ${id} has been delete` });
        }
      );
      break;
    case "cpn_id":
      connection.query(
        `DELETE FROM company WHERE ${a}= ${id}`,
        (err, results) => {
          if (err)
            return res
              .status(500)
              .json({ status: "Error", message: "Database Not Connect " });
          res.status(200).json({
            status: "ok",
            message: `CompanyID: ${id} has been delete`,
          });
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
