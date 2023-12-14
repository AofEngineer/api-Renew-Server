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
const cron = require("node-cron");

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
  const body = req.body;

  const company = body.member_group.toString();
  const per =
    body.person !== undefined
      ? body.person.outlanderNo !== undefined
        ? body.person.outlanderNo
        : body.person
      : "";
  const mem =
    body.members !== undefined
      ? body.members.member_name !== undefined
        ? `${body.members.member_name}-${body.members.member_lastname}`
        : body.members
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
      req.pathcom = `./files/${company}`;
      if (mem !== undefined || mem !== "") {
        fs.readdirSync(`./files/${company}/members`).forEach((file) => {
          arm.push(file);
        });
        const m = arm.filter((e) => e === mem).length;
        if (m > 0) req.pathmem = `./files/${company}/${mem}`;
        if (m !== undefined) req.nom = m;
      }
      if (per !== undefined || per !== "") {
        fs.readdirSync(`./files/${company}/persons`).forEach((file) => {
          arp.push(file);
        });
        const p = arp.filter((e) => e === per).length;
        if (p > 0) req.pathper = `./files/${company}/${per}`;
        if (p !== undefined) req.nop = p;
      }
    }
    next();
  } catch (err) {
    res.status(403).json({ message: err });
  }
};

const file = async (req, res, next) => {
  const body = req.body;
  const company =
    body.member_group !== undefined ? body.member_group.toString() : "";
  const per =
    body.person !== undefined
      ? body.person.outlanderNo !== undefined
        ? body.person.outlanderNo
        : body.person
      : "";
  const mem =
    body.members !== undefined
      ? body.members.member_name !== undefined
        ? `${body.members.member_name}-${body.members.member_lastname}`
        : body.members
      : "";
  try {
    if (req.noc <= 0 && company !== "") {
      await fs.mkdirSync(path.join(`./files`, company));
      await fs.mkdirSync(path.join(`./files/${company}`, "members"));
      await fs.mkdirSync(path.join(`./files/${company}`, "persons"));
      req.pathcom = `./files/${company}`;
      req.noc = 1;
    } else if (req.nom <= 0 && mem !== "") {
      await fs.mkdirSync(path.join(`./files/${company}/members`, mem));
      req.pathmem = `./files/${company}/${mem}`;
      req.nom = 1;
    } else if (req.nop <= 0 && per !== "") {
      await fs.mkdirSync(path.join(`./files/${company}/persons`, per));
      req.pathper = `./files/${company}/${per}`;
      req.nop = 1;
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
              message: `บริษัท: ${cpn_n} เพิ่มสำเร็จแล้ว`,
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

app.post("/testdel", currentFile, deletefile, (req, res, next) => {
  res.json(req.successful);
});

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
      expiresIn: "1d",
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
      expiresIn: "7d",
      algorithm: "HS256",
    }
  );
  return refreshToken;
};

const jwtValidate = (req, res, next) => {
  // try {
  //   if (!req.headers.authorization) return res.sendStatus(401);
  //   const token = req.headers.authorization;
  //   jwt.verify(token, enva.ACCESS_TOKEN_SECRET, (err, decoded) => {
  //     if (err) throw err;
  //   });
  next();
  // } catch (error) {
  //   console.log("tokent expire or error");
  //   return res.status(403).json({ message: "Error" });
  // }
};

const jwtRefreshTokenValidate = (req, res, next) => {
  try {
    const refreshToken = req.headers["refreshtoken"]
      ? req.headers["refreshtoken"]
      : "";
    const decodetoken = jwt.decode(
      req.headers.authorization,
      enva.ACCESS_TOKEN_SECRET
    );
    const sql = `SELECT * FROM members WHERE mem_id = '${decodetoken.id}'`;
    connection.query(sql, (err, results) => {
      if (err) alert(500, "Error", "Not Connect data", res);
      const boo = bcrypt.compareSync(results[0].refreshtoken, refreshToken);
      if (!boo) alert(404, "Error", "Token not match", res);
      const token = results[0].refreshtoken;
      jwt.verify(token, enva.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) alert(500, "Error", "Token not Valid", res);
        req.user = decoded;
        req.user.token = token;
        delete req.user.exp;
        delete req.user.iat;
      });
      next();
    });
  } catch (error) {
    const message = "Login Expire Please login againt ";
    alert(403, "Error", message, res);
  }
};

const alert = (status, sta, message, res) => {
  return res.status(status).json({ status: sta, message: message });
};
app.post("/login", (req, res) => {
  const { user, hash } = req.body;
  const sql = `SELECT members.* ,c.cpn_id,c.cpn_n FROM members LEFT JOIN company as c ON members.company_id = c.cpn_id WHERE username = '${user}'`;
  connection.query(sql, (err, results) => {
    if (err) alert(500, "Error", "Not Connect data", res);
    const index = results.findIndex((e) => e.username === user);
    if (!user || index < 0)
      return res.status(400).json({ status: "Error", message: "User Invalid" });
    const data = results[0];
    if (!bcrypt.compareSync(data.password, hash))
      alert(400, "Error", "Password Invalid", res);
    const accessToken = jwtGenerate(data);
    const refresh_token = jwtRefreshTokenGenerate(data);
    const sqltoken = `UPDATE members SET refreshtoken='${refresh_token}' WHERE mem_id= ${data.mem_id}`;
    connection.query(sqltoken, res, (err, row) => {
      const refreshToken = bcrypt.hashSync(refresh_token, salt);
      const hashread = bcrypt.hashSync(data.m_read.toString(), salt);
      const hashadd = bcrypt.hashSync(data.m_add.toString(), salt);
      const hashedit = bcrypt.hashSync(data.m_edit.toString(), salt);
      const hashdel = bcrypt.hashSync(data.m_del.toString(), salt);
      const admin = bcrypt.hashSync(data.m_admin.toString(), salt);
      if (err) alert(500, "Error", "Not Connect data", res);
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
          picpath: data.m_picpath,
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
  res.json({
    status: "ok",
    accesstoken: access_token,
  });
});
app.get("/files/:filepath", (req, res, next) => {
  const param = req.params;
  const { filepath } = param;
  let array = [];
  let text = "";
  array = filepath.split("_");
  for (const x in array) {
    text += `/${array[x]}`;
  }
  const filePath = `./files${text}`;
  try {
    fs.readFileSync(filePath);
  } catch (err) {
    res.status(404).json("image not found");
  }
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
app.post("/api/upload", currentFile, file, (req, res, next) => {
  const body = req.body;
  const uploadFile = req.files.file;
  const cpn = body.member_group.toString();
  const per = body.person !== undefined ? body.person : "";
  const mem = body.members ? body.members : "";
  const reqname = body.firstname;
  const ext = path.extname(uploadFile.name);
  try {
    if (per !== "" && per !== undefined && req.nop > 0 && ext !== ".jpg") {
      const path = `./files/${cpn}/persons/${per}/${reqname}${ext}`;
      uploadFile.mv(path, (err) => {
        if (err) return res.status(500).json({ message: `${err}` });
        res.status(200).json({
          status: "ok",
          message: `File: ${reqname}${ext} อัพโหลดสำเร็จ`,
          filename: reqname,
        });
      });
    } else if (
      mem !== "" &&
      mem !== undefined &&
      req.nom > 0 &&
      ext !== ".jpg"
    ) {
      const path = `./files/${cpn}/members/${mem}/${reqname}${ext}`;
      console.log(path);
      uploadFile.mv(path, (err) => {
        if (err) return res.status(500).json({ message: `${err}` });
        res.status(200).json({
          status: "ok",
          message: `File: ${reqname}${ext} อัพโหลดสำเร็จ`,
          filename: reqname,
        });
      });
    } else if (
      cpn !== "" &&
      cpn !== undefined &&
      req.noc > 0 &&
      ext !== ".jpg"
    ) {
      const path = `./files/${cpn}/${reqname}${ext}`;
      uploadFile.mv(path, (err) => {
        if (err) return res.status(500).json({ message: `${err}` });
        res.status(200).json({
          status: "ok",
          message: `File: ${reqname}${ext} อัพโหลดสำเร็จ`,
          filename: reqname,
        });
      });
    } else if (ext === ".jpg") {
      const path = `./files/${reqname}${ext}`;
      uploadFile.mv(path, (err) => {
        if (err) return res.status(500).json({ message: `${err}` });
        res.status(200).json({
          status: "ok",
          message: `File: ${reqname}${ext} อัพโหลดสำเร็จ`,
          filename: reqname,
        });
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: `File: ${reqname}${ext} อัพโหลดไม่สำเร็จ` });
  }
});
///////////////////////// upload file  /////////////////////////
///////////////////////// GET /////////////////////////
// jwtValidate,
app.get("/api/users", (req, res) => {
  // console.log(req.body.member_group);
  console.log(req.query.member_group);
  // console.log(req);
  // console.log(req.body.member_group);
  if (!req.query.member_group) return res.send(400);
  const group = req.query.member_group
    ? `WHERE member_group = ${req.query.member_group}`
    : ``;
  const sqlget = `SELECT * FROM persons ${group}`;
  connection.query(sqlget, (err, results, fields) => {
    if (err) return alert(500, "Error", "Not Connect data", res);
    // return res
    //   .status(500)
    //   .json({ message: "Database Not Connect or Server OFFLINE" });

    for (const x in results) {
      results[x].id = results[x].id;
      results[x].fullName = `${results[x].firstname} ${results[x].lastname}`;
      results[x].email = "";
      results[x].allStatus = { ...calDate(results[x]) };
    }
    res.send({
      data: results,
    });
  });
});

app.post("/api/members", jwtValidate, (req, res) => {
  const group = req.body.member_group
    ? `WHERE member_group = ${req.body.member_group} and m_admin = 0`
    : ``;
  const sql = `SELECT mem_id, username , member_name, member_lastname, email, tel, m_add, m_del, m_edit, m_read,m_picpath FROM members  ${group}`;
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
        text += `${postparam[x]},`;
      } else {
        text += `'${postparam[x]}',`;
      }
    }
    text = text.slice(0, -1);
    const sql = `INSERT INTO persons(${Object.keys(
      postparam
    )})VALUES (${text}) `;
    // console.log(sql);
    if (req.pathper !== undefined || req.pathper !== "") {
      connection.query(sql, (err, results, fields) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "Error", message: "Input Valid" });
        }
        res.status(200).json({
          status: "ok",
          message: `เพิ่มแรงงาน: ${postparam.firstnameth} สำเร็จ`,
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
  console.log(postmember);
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
  let str;
  if (mem_id !== undefined) {
    str = `mem_id = ${mem_id}`;
  } else {
    str = `username = "${username}"`;
  }
  const sql = `UPDATE members SET ${text} WHERE ${str}`;
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

const mailer = (mail) => {
  var config = {
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "support@renewlabour.com",
      pass: "yxga pqmj hfcx pzyf",
    },
  };
  var transporter = nodemailer.createTransport(config);
  var defaultMail = {
    from: "no-reply <noreply@renewlabour.com>",
  };
  // use default setting
  mail = _.merge({}, defaultMail, mail);
  // console.log(mail);

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
  const sql = `UPDATE members SET activation_code = ${randomnumber} WHERE username = "${username}"`;
  connection.query(sql, (err, results, fields) => {
    if (err) return res.status(500).json({ message: err });
    mailer({
      to: mail,
      subject: "Activation Code",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>Activate Code</title> <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml>
      <![endif]--><style type="text/css">.rollover:hover .rollover-first { max-height:0px!important; display:none!important; } .rollover:hover .rollover-second { max-height:none!important; display:inline-block!important; } .rollover div { font-size:0px; } u + .body img ~ div div { display:none; } #outlook a { padding:0; } span.MsoHyperlink,span.MsoHyperlinkFollowed { color:inherit; mso-style-priority:99; } a.es-button { mso-style-priority:100!important; text-decoration:none!important; } a[x-apple-data-detectors] { color:inherit!important; text-decoration:none!important; font-size:inherit!important; font-family:inherit!important; font-weight:inherit!important; line-height:inherit!important; } .es-desk-hidden { display:none; float:left; overflow:hidden; width:0; max-height:0; line-height:0; mso-hide:all; } .es-button-border:hover > a.es-button { color:#ffffff!important; }
      @media only screen and (max-width:600px) {*[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important }
       .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important }
       .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover div, .es-m-txt-c .rollover div, .es-m-txt-l .rollover div { line-height:0!important; font-size:0!important } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:18px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important }
       .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .es-social td { padding-bottom:10px } .h-auto { height:auto!important }
       .es-text-7830, .es-text-7830 p, .es-text-7830 a, .es-text-7830 h1, .es-text-7830 h2, .es-text-7830 h3, .es-text-7830 h4, .es-text-7830 h5, .es-text-7830 h6, .es-text-7830 ul, .es-text-7830 ol, .es-text-7830 li, .es-text-7830 span, .es-text-7830 sup, .es-text-7830 sub, .es-text-7830 u, .es-text-7830 b, .es-text-7830 strong, .es-text-7830 em, .es-text-7830 i { font-size:24px!important } .es-text-2733, .es-text-2733 p, .es-text-2733 a, .es-text-2733 h1, .es-text-2733 h2, .es-text-2733 h3, .es-text-2733 h4, .es-text-2733 h5, .es-text-2733 h6, .es-text-2733 ul, .es-text-2733 ol, .es-text-2733 li, .es-text-2733 span, .es-text-2733 sup, .es-text-2733 sub, .es-text-2733 u, .es-text-2733 b, .es-text-2733 strong, .es-text-2733 em, .es-text-2733 i { font-size:24px!important }
       .es-text-8565, .es-text-8565 p, .es-text-8565 a, .es-text-8565 h1, .es-text-8565 h2, .es-text-8565 h3, .es-text-8565 h4, .es-text-8565 h5, .es-text-8565 h6, .es-text-8565 ul, .es-text-8565 ol, .es-text-8565 li, .es-text-8565 span, .es-text-8565 sup, .es-text-8565 sub, .es-text-8565 u, .es-text-8565 b, .es-text-8565 strong, .es-text-8565 em, .es-text-8565 i { font-size:24px!important } .es-text-3120, .es-text-3120 p, .es-text-3120 a, .es-text-3120 h1, .es-text-3120 h2, .es-text-3120 h3, .es-text-3120 h4, .es-text-3120 h5, .es-text-3120 h6, .es-text-3120 ul, .es-text-3120 ol, .es-text-3120 li, .es-text-3120 span, .es-text-3120 sup, .es-text-3120 sub, .es-text-3120 u, .es-text-3120 b, .es-text-3120 strong, .es-text-3120 em, .es-text-3120 i { font-size:24px!important }
       .es-text-8586, .es-text-8586 p, .es-text-8586 a, .es-text-8586 h1, .es-text-8586 h2, .es-text-8586 h3, .es-text-8586 h4, .es-text-8586 h5, .es-text-8586 h6, .es-text-8586 ul, .es-text-8586 ol, .es-text-8586 li, .es-text-8586 span, .es-text-8586 sup, .es-text-8586 sub, .es-text-8586 u, .es-text-8586 b, .es-text-8586 strong, .es-text-8586 em, .es-text-8586 i { font-size:36px!important } }</style>
       </head> <body class="body" style="width:100%;height:100%;padding:0;Margin:0"><div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#FFFFFF"> <!--<[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#ffffff"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-color:#FFFFFF"><tr><td valign="top" style="padding:0;Margin:0;padding-top:50px;padding-bottom:50px"><table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important"><tr>
      <td align="center" style="padding:0;Margin:0"><table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr><td align="left" bgcolor="#ffffff" style="padding:0;Margin:0;padding-right:20px;padding-left:20px"><table cellspacing="0" cellpadding="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right"><tr><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr>
      <td align="center" style="padding:0;Margin:0;padding-top:40px;padding-bottom:40px;font-size:0"><img class="adapt-img" src="https://l43e28m8xg.execute-api.ap-southeast-1.amazonaws.com/files/image_oxc.jpg" alt="" width="560" height="165" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></td> </tr><tr><td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h1 style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:40px;font-style:normal;font-weight:normal;line-height:36px;color:#333333">Activate Code</h1></td></tr><tr><td align="center" style="padding:20px;Margin:0;font-size:0"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" class="es-spacer" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr>
      <td style="padding:0;Margin:0;border-bottom:1px solid #333333;background:none;height:1px;width:100%;margin:0px"></td></tr></table></td></tr> <tr><td align="center" class="es-text-8586" style="padding:0;Margin:0;padding-top:40px;padding-bottom:40px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:54px;letter-spacing:0;color:#333333;font-size:36px">${randomnumber}</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>`,
    });
    res.status(200).json({ status: "ok", message: "Email has been sent" });
  });
});
app.post("/activated", (req, res) => {
  const { username, code, email } = req.body;
  const sql = `SELECT activation_code FROM members WHERE username = "${username}"`;
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: err });
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

const cal = (e) => {
  let t = "";
  if (e === "" || e === undefined) return t;
  const date = new Date(Date.now());
  var start = Math.floor((e % (1000 * 60 * 60)) / (1000 * 60));
  var end = Math.floor((date % (1000 * 60 * 60)) / (1000 * 60));
  t = end - start;
  return t;
};

app.post("/dashboard", (req, res) => {
  const { member_group } = req.body;
  member_group;
  dash(member_group, (data) => {
    const count = countStatus(data);
    const countM = countMonth(data);
    return res.status(200).json({ data, count, countM });
  });
});

const dash = (id, callback) => {
  const sql = `SELECT * FROM persons WHERE member_group = ${id}`;
  let arr = [];
  connection.query(sql, (err, result) => {
    if (err) console.log(err);
    for (const x in result) {
      arr.push((result[x] = { ...result[x], ...calDate(result[x]) }));
    }
    return callback(arr);
  });
};
const countMonth = (e) => {
  let Dash = { visaM: 0, passportM: 0, workpermitM: 0, ninetyM: 0 };
  let month = {
    Jan: Dash,
    Feb: Dash,
    Mar: Dash,
    Apr: Dash,
    May: Dash,
    Jun: Dash,
    Jul: Dash,
    Aug: Dash,
    Sep: Dash,
    Oct: Dash,
    Nov: Dash,
    Dec: Dash,
  };
  let arr = [];
  for (const x in e) {
    arr.push((e[x] = { ...e[x], ...dateMonth(e[x]) }));
  }
  const now = new Date(Date.now());
  const str = now.getFullYear().toString();
  for (const x in month) {
    let Dash = { visaM: 0, passportM: 0, workpermitM: 0, ninetyM: 0 };
    for (const y in month[x]) {
      let a = "";
      let b = "";
      a = `${x}/${str}`;
      c = (val) => val[y] === a;
      b = arr.filter(c).length;
      Dash[y] = b;
      month[x] = Dash;
    }
  }
  return month;
};

const dateMonth = (e) => {
  let months = { visaM: "", passportM: "", workpermitM: "", ninetyM: "" };
  months.visaM = Mons(e.visaexp);
  months.passportM = Mons(e.passportexp);
  months.workpermitM = Mons(e.workpermitexp);
  months.ninetyM = Mons(e.ninetyexp);
  return months;
};
const Mons = (event) => {
  let Month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const newdate = new Date(event);
  const month = Month[newdate.getMonth()];
  const year = newdate.getFullYear();
  const cal = `${month}/${year}`;
  if (event === "") return event;
  return cal;
};

const countStatus = (e) => {
  // 1 = expire, 2 = urgent, 3 = warning, 4 = normal, 5 = not data
  let co = { sum: {}, visa: {}, passport: {}, ninety: {}, workpermit: {} };
  let state = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  co.visa = { ...state };
  co.passport = { ...state };
  co.ninety = { ...state };
  co.workpermit = { ...state };
  co.sum = { total: "", ...state };
  for (const x in co) {
    for (const y in co[x]) {
      const no = parseInt(y);
      if (x === "sum") {
        const a = (val) => val.statusC.status === no;
        if (y === "total") {
          co[x][y] = e.length;
        } else {
          co[x][y] = e.filter(a).length;
        }
      } else {
        const a = (val) => val.statusC[x] === no;
        co[x][y] = e.filter(a).length;
      }
    }
  }
  return co;
};
// const allStatus = (e) => {
//   const { visaexp, workpermitexp, ninetyexp, passportexp } = e;
//   const status = { visa: "", passport: "", workpermit: "", ninety: "" };
//   e.dateC = { ...status };
//   e.allstatus = { ...status };
//   e.allstatus = calDate(e);
//   e.dateC.visaC = dateTime(visaexp);
//   e.dateC.workpermitC = dateTime(workpermitexp);
//   e.dateC.ninetyC = dateTime(ninetyexp);
//   e.dateC.passportC = dateTime(passportexp);

//   for (const x in e.dateC)
//     switch (true) {
//       case e.dateC[x] <= 0 && e.dateC[x] !== "":
//         e.allstatus[x] = "Expire";
//         break;
//       case e.dateC[x] > 0 && e.dateC[x] <= 7:
//         e.allstatus[x] = "Urgent";
//         break;
//       case e.dateC[x] >= 7 && e.dateC[x] <= 15:
//         e.allstatus[x] = "Warning";
//         break;
//       case e.dateC[x] > 15:
//         e.allstatus[x] = "Normal";
//         break;
//       default:
//         e.allstatus[x] = "ไม่มีวันที่";
//         break;
//     }
// };
app.post("/testcount", (req, res) => {
  const { member_group } = req.body;
  const sql = `SELECT * FROM persons WHERE member_group = ${member_group}`;
  connection.query(sql, (err, result) => {
    for (const x in result) {
      result[x].allstatus = { ...calDate(result[x]) };
    }
    res.json(result);
  });
});
const calDate = (res) => {
  const { visaexp, workpermitexp, ninetyexp, passportexp } = res;
  let obj = { status: 5, visa: "", passport: "", ninety: "", workpermit: "" };
  let obje = { visa: "", passport: "", ninety: "", workpermit: "" };
  let ob = {};
  ob.statusC = { ...obj };
  ob.textstatus = { ...obj };
  ob.dateC = { obje };
  ob.dateC.workpermit = dateTime(workpermitexp);
  ob.dateC.visa = dateTime(visaexp);
  ob.dateC.ninety = dateTime(ninetyexp);
  ob.dateC.passport = dateTime(passportexp);
  // 1 = Expire, 2 = Urgent, 3 = Warning, 4 = Normal, 5 = NoDate
  for (const x in ob.dateC) {
    if (x !== "status") {
      switch (true) {
        case ob.dateC[x] <= 0 && ob.dateC[x] !== "":
          ob.statusC.status = ob.statusC.status <= 1 ? ob.statusC.status : 1;
          ob.statusC[x] = 1;
          ob.textstatus.status =
            ob.statusC.status === 1 ? "Expire" : ob.textstatus.status;
          ob.textstatus[x] = "Expire";
          break;
        case ob.dateC[x] > 0 && ob.dateC[x] <= 7:
          ob.statusC.status = ob.statusC.status <= 2 ? ob.statusC.status : 2;
          ob.statusC[x] = 2;
          ob.textstatus.status =
            ob.statusC.status === 2 ? "Urgent" : ob.textstatus.status;
          ob.textstatus[x] = "Urgent";
          break;
        case ob.dateC[x] >= 7 && ob.dateC[x] <= 15:
          ob.statusC.status = ob.statusC.status <= 3 ? ob.statusC.status : 3;
          ob.statusC[x] = 3;
          ob.textstatus.status =
            ob.statusC.status === 3 ? "Warning" : ob.textstatus.status;
          ob.textstatus[x] = "Warning";
          break;
        case ob.dateC[x] > 15:
          ob.statusC.status = ob.statusC.status <= 4 ? ob.statusC.status : 4;
          ob.statusC[x] = 4;
          ob.textstatus.status =
            ob.statusC.status === 4 ? "Normal" : ob.textstatus.status;
          ob.textstatus[x] = "Normal";
          break;
        default:
          ob.statusC.status = ob.statusC.status <= 5 ? ob.statusC.status : 5;
          ob.statusC[x] = 5;
          ob.textstatus.status =
            ob.statusC.status === 5 ? "NoDate" : ob.textstatus.status;
          ob.textstatus[x] = "NoDate";
          break;
      }
    }
  }
  return ob;
};

const dateTime = (e) => {
  let date = new Date(e);
  let caldate =
    Math.floor(date / 86400e3) + 1 - Math.floor(new Date(Date.now()) / 86400e3);
  return (caldate = isNaN(caldate) ? "NoDate" : caldate);
};

app.post("/webhook", (req, res) => {
  if (req.body.events[0]) {
    if (req.body.events[0].type !== "message") return res.sendStatus(200);
    reply(req.body.events[0]);
  } else {
    return res.sendStatus(200);
  }
});

const reply = (e) => {
  console.log(e);
  const tm = getDataId(e);
  let body;
  switch (e.message.text) {
    case "ดูเว็บไซต์":
      body = JSON.stringify({
        replyToken: e.replyToken,
        messages: [
          {
            type: "text",
            text: `www.renewlabour.com`,
          },
        ],
      });
      post(body);
      break;
    case "ลงทะเบียน":
      if (tm.temp === undefined || tm.temp === "" || cal(tm) >= 5) {
        const t = cal(tm.temp) >= 5 ? cal(tm.temp) : cal(e.timestamp);
        if (t < 5) {
          tm.temp = e.timestamp;
          tm.time = Date(Date.now());
          editData(e, tm);
          body = JSON.stringify({
            replyToken: e.replyToken,
            messages: [
              {
                type: "text",
                text: `ขั้นตอนลงทะเบียน`,
              },
              {
                type: "text",
                text: `พิมพ์ Email ที่ลงทะเบียนแล้วให้ถูกต้อง\nตัวอย่าง\n"example@renewlabour.com"`,
              },
            ],
          });
          post(body);
        } else {
          tm.temp = "";
          tm.time = "";
          editData(e, tm);
        }
      }
      break;
    default:
      if (cal(tm.temp) >= 5 && tm.temp !== undefined && tm.temp !== "") {
        tm.temp = "";
        editData(e, tm);
        body = JSON.stringify({
          replyToken: e.replyToken,
          messages: [
            {
              type: "text",
              text: `กรุณาลงทะเบียนใหม่อีกครั้ง`,
            },
            {
              type: "text",
              text: `ขอบคุณครับ`,
            },
          ],
        });
        post(body);
      } else if (cal(tm.temp) <= 5 && tm.temp !== undefined && tm.temp !== "") {
        const mail = e.message.text;
        const sql = `SELECT email FROM members WHERE email = '${mail}'`;
        try {
          connection.query(sql, (err, result) => {
            if (result[0] !== undefined) {
              const update = `UPDATE members SET lineID='${e.source.userId}' WHERE email = '${mail}'`;
              connection.query(update, (err, result) => {
                tm.temp = "";
                tm.time = "";
                editData(e, tm);
                body = JSON.stringify({
                  replyToken: e.replyToken,
                  messages: [
                    {
                      type: "text",
                      text: `ลงทะเบียนเรียบร้อย`,
                    },
                    {
                      type: "text",
                      text: `ยินดีต้อนรับสู่ครอบครัว\nRenewlabour\nคุณจะได้รับการแจ้งเตือนการต่ออายุเอกสาร\nทุกวัน จ - ศ เวลา 08.00 น.`,
                    },
                    {
                      type: "text",
                      text: `ขอบคุณครับ`,
                    },
                  ],
                });
                post(body);
              });
            } else {
              tm.temp = "";
              editData(e, tm);
              body = JSON.stringify({
                replyToken: e.replyToken,
                messages: [
                  {
                    type: "text",
                    text: `อีเมล "${e.message.text}" ไม่มีในระบบ`,
                  },
                  {
                    type: "text",
                    text: `กรุณาลงทะเบียนใหม่อีกครั้ง`,
                  },
                  {
                    type: "text",
                    text: `ขอบคุณครับ`,
                  },
                ],
              });
              post(body);
            }
          });
        } catch (err) {
          body = JSON.stringify({
            replyToken: e.replyToken,
            messages: [
              {
                type: "text",
                text: `กรุณาลงทะเบียนใหม่อีกครั้ง`,
              },
              {
                type: "text",
                text: `ขอบคุณครับ`,
              },
            ],
          });
          post(body);
          tm.temp = "";
          editData(e, tm);
        }
      } else if (tm.time === "" || cal(tm.time) >= 720) {
        const t = cal(tm.time) >= 720 ? cal(tm.time) : cal(e.timestamp);
        if (t < 720) {
          const id = e.source.userId;
          getProfile(id, (call) => {
            const profile = JSON.parse(call);
            body = JSON.stringify({
              replyToken: e.replyToken,
              messages: [
                {
                  type: "text",
                  text: `สวัสดีครับ คุณ ${profile.displayName}`,
                },
                {
                  type: "text",
                  text: `มีอะไรให้ช่วยไหมครับ`,
                },
                {
                  type: "text",
                  text: `เมนูด้านล่างช่วยเหลือคุณได้ครับ`,
                },
              ],
            });
            post(body);
            tm.time = e.timestamp;
            editData(e, tm);
          });
        } else {
          tm.time = "";
          editData(e, tm);
        }
      }
      break;
  }
};
const headersLine = {
  "Content-Type": "application/json",
  Authorization:
    "Bearer O/lEacPcXVsvQwN6JpsAFp72N4dNdSzeF9PqGhRZxILm2iYVo07PtAkOpBdmtH+5og/K1sU6XhlUQuPVmWDbyCXhxw4RfL2h77yuXxHiBEHRk+p9TGvV+qsDj59Vc3ZGtNAJPRuz5iNca2BX/Ugu4wdB04t89/1O/w1cDnyilFU=",
};

cron.schedule(
  "0 11 * * 1-5",
  () => {
    const sql = `SELECT * FROM member_group`;
    connection.query(sql, (err, result) => {
      if (err) console.log(err);
      for (const x in result) {
        if (x !== "0") {
          dash(x, async (data) => {
            const count = await countStatus(data);
            connection.query(
              `SELECT lineID FROM members WHERE member_group = ${x}`,
              (err, ressult) => {
                postschedule(count, ressult);
              }
            );
          });
        }
      }
    });
  },
  {
    scheduled: true,
    timezone: "Asia/Bangkok",
  }
);
const postschedule = (e, line) => {
  for (const x in line) {
    if (line[x].lineID !== "") {
      const body = JSON.stringify({
        to: line[x].lineID,
        messages: [
          {
            type: "text",
            text: `จำนวนแรงงานที่มีอยู่ตอนนนี้ ${e.sum.total} คน\nexpire ${e.sum["1"]} คน\nurgent ${e.sum["2"]} คน\nwarning ${e.sum["3"]} คน\nสถานะปกติ ${e.sum["4"]} คน\nยังไม่ได้เพิ่มข้อมูล ${e.sum["5"]}`,
          },
        ],
      });
      request.post(
        {
          url: "https://api.line.me/v2/bot/message/push",
          headers: headersLine,
          body: body,
        },
        (err, result, body) => {
          console.log("status = " + result.statusCode);
        }
      );
    }
  }
};

const post = (body) => {
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headersLine,
      body: body,
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

const getProfile = (e, callback) => {
  const set = {
    url: `https://api.line.me/v2/bot/profile/${e}`,
    headers: headersLine,
  };
  request.get(set, (err, res, body) => {
    callback(body);
  });
};

const saveData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync("./temp.json", stringifyData);
};
const getData = () => {
  const jsonData = fs.readFileSync("./temp.json");
  return JSON.parse(jsonData);
};
const getdatas = (param) => {
  var exist = getData();
  console.log(param);
  const id = !param.source ? "" : param.source.userId;
  return exist.find((value) => value.id === id);
};
const getDataId = (param) => {
  var exist = getData();
  const id = !param.source ? "" : param.source.userId;
  const count = exist.filter((value) => value.id === id);
  if (count.length > 1) {
    delData(param);
  } else if (count.length >= 1) {
    return exist.find((value) => value.id === id);
  } else {
    createData(param);
  }
  return getdatas(param);
};

const createData = (param, body) => {
  var exist = getData();
  const newId = param.source.userId;
  let bo = { id: newId, temp: "", time: "" };
  exist.push(bo);
  saveData(exist);
};

const editData = (param, body) => {
  var exist = getData();
  const Id = param.source.userId;
  const index = exist.findIndex((value) => value.id === Id);
  exist[index] = { ...body };
  saveData(exist);
};

const delData = (param) => {
  var exist = getData();
  const Id = param.source.userId;
  const a = exist.find((value) => value.id === Id);
  let temps = [];
  for (const x in exist) {
    if (exist[x].id !== Id) {
      temps.push(exist[x]);
    }
  }
  temps.push(a);
  saveData(temps);
};

app.listen(port, function () {
  console.log(`Server Path: ${__dirname} Listen on port  : ${port}`);
});
