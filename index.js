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
const port = enva.PORT;
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const request = require("request");
const data = require("./temp.json");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
app.use(fileUpload());
app.use("/files", express.static(__dirname + "/files"));

const connection = mysql.createPool({
  host: enva.DB_HOST,
  user: enva.DB_USER,
  password: enva.DB_PASSWORD,
  database: enva.DB_NAME,
});

const currentFile = (req, res, next) => {
  const company = req.body.cpn_n;
  const per =
    req.body.person !== undefined
      ? `${req.body.person.outlanderNo}-${req.body.person.firstname}`
      : "";
  const mem =
    req.body.members !== undefined
      ? `${req.body.members.member_name}-${req.body.members.member_lastname}`
      : "";
  let arc = [],
    arm = [],
    arp = [];

  try {
    fs.readdirSync(`./files`).forEach((file) => {
      arc.push(file);
    });
    const c = arc.filter((e) => e === company).length;
    if (c !== undefined) req.noc = c;
    if (c > 0) {
      if (mem !== undefined || mem !== "") {
        fs.readdirSync(`./files/${company}/members`).forEach((file) => {
          arm.push(file);
        });
        const m = arm.filter((e) => e === mem).length;
        if (m !== undefined) req.nom = m;
      }
      if (per !== undefined || per !== "") {
        fs.readdirSync(`./files/${company}/persons`).forEach((file) => {
          arp.push(file);
        });
        const p = arp.filter((e) => e === per).length;
        if (p !== undefined) req.nop = p;
      }
    }
    next();
  } catch (err) {
    res.status(403).json({ message: err });
  }
};
const file = (req, res, next) => {
  const company = req.body.cpn_n !== undefined ? req.body.cpn_n : "";
  const per =
    req.body.person !== undefined
      ? `${req.body.person.outlanderNo}-${req.body.person.firstname}`
      : "";
  const mem =
    req.body.members !== undefined
      ? `${req.body.members.member_name}-${req.body.members.member_lastname}`
      : "";
  try {
    if (req.noc <= 0 && company !== "") {
      fs.mkdirSync(path.join(`./files`, company));
      fs.mkdirSync(path.join(`./files/${company}`, "members"));
      fs.mkdirSync(path.join(`./files/${company}`, "persons"));
      req.pathcom = `./files/${company}`;
    }
    if (req.nom <= 0 && mem !== "") {
      fs.mkdirSync(path.join(`./files/${company}/members`, mem));
      req.pathmem = `./files/${company}/${mem}`;
    }
    if (req.nop <= 0 && per !== "") {
      fs.mkdirSync(path.join(`./files/${company}/persons`, per));
      req.pathper = `./files/${company}/${per}`;
    }
    next();
  } catch (err) {
    res.status(403).json({ message: "err" });
  }
};

const deletefile = (req, res, next) => {
  const request = `${req.body.firstnameth}-${req.body.outlanderNo}`;
  let status = "";
  try {
    if (req.no === 0) {
      try {
        fs.rm(`./files/${request}`, { recursive: true }, (err) => {
          if (err) return err;
        });
        status = `Directoryfile name: ${request} Deleted`;
      } catch (err) {
        return err;
      }
    } else {
      status = `Directoryfile name: ${request} Not Deleted`;
    }

    req.successful = status;
    next();
  } catch (err) {
    return res.status(403).json(err);
  }
};

const Addcompany = (req, res, next) => {
  const postcompany =
    req.body.company !== undefined ? req.body.company : req.body;
  const username =
    req.headers.username !== undefined ? req.headers.username : "";
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
    try {
      connection.query(sql, (err, results) => {
        if (err) throw new Error("Database Not Connect!");
        if (username !== "") {
          const str = `UPDATE members SET company_id = ${results.insertId} WHERE username = "${username}"`;
          connection.query(str, (err, ress) => {
            if (err) throw new Error("Database Not Connect!");
            res.status(200).json({
              status: "ok",
              companyNo: results.insertId,
              companyName: cpn_n,
              message:
                "Insert ID: " + c_iden + " Name: " + cpn_n + " Successful",
            });
          });
        } else {
          res.status(200).json({
            status: "ok",
            message: `บริษัท: ${cpn_n} เพิ่มสำเร็จแล้ว`,
          });
        }
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  });
};

// app.post("/test", currentFile, file, (req, res, next) => {
//   res.json({
//     status: req.successful,
//     path: req.pathname,
//     pathdir: req.dirname,
//   });
// });
// app.post("/testdel", currentFile, deletefile, (req, res, next) => {
//   res.json(req.successful);
// });

app.post("/company", currentFile, file, (req, res, next) => {
  if (req.pathcom !== undefined || req.noc >= 0) {
    Addcompany(req, res, next);
  }
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
  const sql = `SELECT members.* ,c.cpn_id,c.cpn_n FROM members LEFT JOIN company as c ON members.company_id = c.cpn_id WHERE username = '${user}'`;
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
          companyName: data.cpn_n,
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
  const param = req.params;
  const { filename } = param;
  let array = [];
  let text = "";
  array = filename.split("_");
  for (const x in array) {
    text += `/${array[x]}`;
  }
  const filePath = `./files${text}`;
  res.download(filePath, (err) => {
    if (err) {
      res.json({
        message: "ไม่พบไฟล์ที่จะดาวน์โหลด ควรอัพโหลดไฟล์",
      });
    }
  });
});

///////////////////////// upload file  /////////////////////////
app.post("/api/upload", currentFile, (req, res, next) => {
  const uploadFile = req.files.file;
  const cpn = req.body.cpn_n;
  const per = req.body.person ? req.body.person : "";
  const mem = req.body.members ? req.body.members : "";
  const reqname = req.body.firstname;
  const ext = path.extname(uploadFile.name);
  try {
    if (per !== "" && per !== undefined) {
      uploadFile.mv(`./files/${cpn}/persons/${per}/${reqname}${ext}`, (err) => {
        if (err) return res.status(500).json({ message: err });
        res.status(200).json({
          status: "ok",
          message: `Has been upload ${reqname}`,
          filename: reqname,
        });
      });
    }
    if (mem !== "" && mem !== undefined) {
      uploadFile.mv(`./files/${cpn}/members/${mem}/${reqname}${ext}`, (err) => {
        if (err) return res.status(500).json({ message: err });
        res.status(200).json({
          status: "ok",
          message: `Has been upload ${reqname}`,
          filename: reqname,
        });
      });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
});
///////////////////////// upload file  /////////////////////////
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
  const sql = `SELECT c.*,b.branchname,b.branch_no,b.branch_id FROM company as c  LEFT JOIN branch as b ON c.branch_id = b.branch_id ${group}`;
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
app.post("/api/plususers", jwtValidate, currentFile, file, (req, res, next) => {
  const postparam = req.body.person ? req.body.person : req.body;
  const { outlanderNo } = postparam;
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
    if (req.pathper !== undefined || req.pathper !== "") {
      connection.query(sql, (err, results, fields) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "Error", message: "Input Valid", msg: err });
        }
        res.status(200).json({
          status: "ok",
          message: `Insert ID: ${outlanderNo} Name: ${postparam.firstnameth} Successful`,
        });
      });
    } else {
      res.json({ message: "Not Create Folder" });
    }
  });
});

app.put("/api/upuser", jwtValidate, function (req, res) {
  const upparam = req.body;
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

app.post("/api/upcom", jwtValidate, Addcompany, (req, res, next) => {});

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

app.post(
  "/api/addmembers",
  jwtValidate,
  currentFile,
  file,
  (req, res, next) => {
    const postmember = req.body.members;
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
      if (req.pathmem !== undefined || req.pathmem !== "") {
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
      }
    });
  }
);

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
  const ids = req.body;
  let id = "";
  let a = "";
  for (const x in ids) {
    id += `${ids[x]}`;
    a += `${x}`;
  }
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

app.post("/webhook", (req, res) => {
  const lineevent = req.body.events[0];
  if (lineevent === undefined) return res.sendStatus(200);
  console.log(lineevent);
  reply(lineevent);
  res.sendStatus(200);
});

const mailer = (mail) => {
  var config = {
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "noreply.renewlabour@gmail.com",
      pass: "lylv shsf zntp zkco",
    },
  };
  var transporter = nodemailer.createTransport(config);
  var defaultMail = {
    from: "no-reply <noreply@renewlabour.com>",
  };
  // use default setting
  mail = _.merge({}, defaultMail, mail);
  console.log(mail);

  // send email
  transporter.sendMail(mail, function (error, info) {
    if (error) return console.log(error);
    console.log("mail sent:", info.response);
  });
};
app.post("/activatecode", (req, res) => {
  const { username, mail } = req.body;
  console.log(req.body);
  const max = 9;
  let randomnumber = "";
  for (let x = 0; x < 6; x++) {
    randomnumber += Math.floor(Math.random() * max);
  }
  console.log(username);
  const sql = `UPDATE members SET activation_code = ${randomnumber} WHERE username = "${username}"`;
  console.log(sql);
  connection.query(sql, (err, results, fields) => {
    if (err) return res.status(500).json({ message: err });
    mailer({
      to: mail,
      subject: "Activation Code",
      text: `Code: ${randomnumber}`,
    });
    res.status(200).json({ status: "ok", message: "Email has been sent" });
  });
});
app.post("/activated", (req, res) => {
  const { username, code, email } = req.body;
  const sql = `SELECT activation_code FROM members WHERE username = "${username}"`;
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: err });
    console.log(result);
    if (result === "" || !result || result === undefined)
      return res.status(400).json({ message: "Code Invalid" });

    const { activation_code } = result[0];
    if (activation_code === code) {
      const sql = `UPDATE members SET email = "${email}" WHERE username = "${username}"`;
      connection.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: err });
        res.status(200).json({
          status: "ok",
          email,
          message: "ยืนยันอีเมล์ สำเร็จ",
        });
      });
    } else {
      res.status(400).json({ message: "Code Invalid" });
    }
  });
});

app.post("/webhook", (req, res) => {
  const lineevent = req.body.events[0];
  if (lineevent === undefined) return res.sendStatus(200);
  console.log(req.body.events);
  reply(lineevent);
  res.sendStatus(200);
});

const reply = (e) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer fg8kVZiNrpY5xsP3llJ0dU2qCPQEVDGpeK9W7hnO3V4W2KjeZf/L8u+FIkIUEr8fB6dH6jzeHR1gM4fKLhlAZ4pytK8z9quOjNKM07TMq4diYuf/FtxZoqCfUHHo60WCgoh9HTNmsI51z6ORo/eOKQdB04t89/1O/w1cDnyilFU=",
  };
  let body = JSON.stringify({
    replyToken: e.replyToken,
    messages: [
      {
        type: "text",
        text: `ขั้นตอนลงทะเบียน`,
      },
      {
        type: "text",
        text: "1. พิมพ์ชือบริษัท ตัวอย่าง '1-Renewlabour Co.,Ltd'",
      },
      {
        type: "text",
        text: "2. พิมพ์ email ที่ลงทะเบียนแล้ว ตัวอย่าง '2-example@renewlabour.com'",
      },
    ],
  });
  console.log({ headers, body });
  let temp;
  if (e.message.text === "ลงทะเบียน") {
    const newDatestart = Date.now();
    const newDateend = new Date(e.timestamp);
    let diff = newDateend - newDatestart;
    let dayLeft = Math.floor((newDateend % (1000 * 60 * 60)) / (1000 * 60));
    if (dayLeft === null || dayLeft === undefined || isNaN(dayLeft)) {
      console.log((dayLeft = "ไม่มี"));
    } else {
      temp = dayLeft;
      console.log("temp" + temp);
    }
    // post(headers, body);
  }
  if (e.message.text !== "ลงทะเบียน") {
    console.log("temp2" + temp);
  }
};

const post = (headers, body) => {
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body,
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

app.listen(port, function () {
  console.log(`Server Listen on port ${port}`);
});
