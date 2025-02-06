const path = require("path");
const cron = require("node-cron");
const { exec } = require("child_process");

const express = require("express");
const cors = require("cors");
const app = express();

let corsOptions = {
  origin: "*",
  credential: true,
};

const TelegramBotAPI = require("telegram-bot-api");
const { spawn } = require("child_process");

function runPythonFile(fileName, params) {
  return new Promise((resolve, reject) => {
    const process = spawn("python", [fileName].concat(params), {
      env: { PYTHONIOENCODING: "utf-8" },
    });

    let result = "";
    process.stdout.on("data", (data) => {
      result += data.toString();
    });

    process.stderr.on("data", (err) => {
      reject(err.toString());
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(`Failed with code ${code}`);
      }
      resolve(result);
    });
  });
}

function ImAlive() {
  const api = new TelegramBotAPI({
    token: "",
  });

  api
    .sendMessage({
      chat_id: "",
      text: "LimeNotifier Backend Server is running well👍",
    })
    .then((response) => {
      console.log("Message sent!");
    })
    .catch((error) => {
      console.log(error);
      console.log("Error sending message!");
    });
}

app.get("/", function (req, res) {
  res.set({ "access-control-allow-origin": "*" });
  res.send("<h1>Lime Notifier Backend Server</h1>");
});

app.get("/hotdeal", async (req, res) => {
  try {
    const result = await runPythonFile("./python/hotdeal.py", "");
    res.set({ "access-control-allow-origin": "*" });
    res.send({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/naver", function (req, res) {
  res.set({ "access-control-allow-origin": "*" });
  res.send("<a href='https://naver.com'>Naver Response</a>");
});

app.get("/kakao", function (req, res) {
  res.set({ "access-control-allow-origin": "*" });
  res.send("Kakao Response !!");
});

app.get("/currency", async (req, res) => {
  let path = "./python/currency.py";
  let param = [
    req.query.url,
    req.query.authkey,
    req.query.searchdate,
    req.query.data,
  ];

  try {
    const result = await runPythonFile(path, param);
    res.set({ "access-control-allow-origin": "*" });
    res.send({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/flight", async (req, res) => {
  try {
    const result = await runPythonFile("./python/flight.py", "");
    res.set({ "access-control-allow-origin": "*" });
    res.send({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/sendTelegramMsg", (req, res) => {
  const token = req.query.token;
  const chatId = req.query.chatId;
  const message = req.query.message;

  const api = new TelegramBotAPI({
    token: token,
  });

  api
    .sendMessage({
      chat_id: chatId,
      text: message,
    })
    .then((response) => {
      res.send("Message sent!");
    })
    .catch((error) => {
      console.log(error);
      res.send("Error sending message!");
    });
});

// 특정 시간에 실행될 cron 작업 정의
cron.schedule("10 0 * * *", () => {
  // 쉘 명령어 실행
  const scriptPath = path.join(__dirname, "script", "slp_login.sh");
  exec(scriptPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
    }
  });
});

cron.schedule("30 10 * * *", () => {
  ImAlive();
});

cron.schedule("30 22 * * *", () => {
  ImAlive();
});

app.use(cors(corsOptions));
app.listen(3001);
