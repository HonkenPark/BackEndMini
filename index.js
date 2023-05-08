const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 3001;

const { spawn } = require('child_process');

function runPythonFile(fileName) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [fileName]);
    
    let result = '';
    process.stdout.on('data', (data) => {
      result += data.toString();
      console.log(result)
    });

    process.stderr.on('data', (err) => {
      console.log('1')
      reject(err.toString());
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.log('2')
        reject(`Failed with code ${code}`);
      }
      resolve(result);
    });
  });
}

const sslServerOptions = {
  key: fs.readFileSync('D:\\data\\selfCert\\server.key'),
  cert: fs.readFileSync('D:\\data\\selfCert\\server.crt')
};

app.get('/', function(req, res) {
  res.send('<h1>Lime Notifier Backend Server</h1>');
})

app.get('/hotdeal', async (req, res) => {
  try {
    const result = await runPythonFile('./python/hotdeal.py');
    res.send({result});
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
})

app.get('/naver', function(req, res) {
  res.send('<a href=\'https://naver.com\'>Naver Response</a>');
})

app.get('/kakao', function(req, res) {
  res.send('Kakao Response !!');
})

app.get('/flight', async (req, res) => {
  try {
    const result = await runPythonFile('./python/flight.py');
    res.send({result});
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
})

https.createServer(sslServerOptions, app).listen(port, ()=>{
  console.log(`Lime Notifier Server is running on port ${port}`);
})

// app.listen(3001);