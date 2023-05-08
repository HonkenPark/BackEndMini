const express = require('express');
const app = express();

const { spawn } = require('child_process');

const https = require('https');
const url = "https://www.kayak.co.kr/flights/ICN-SPN/2023-07-29/2023-08-02/2adults/children-11?sort=bestflight_a"; // GET 요청을 보낼 URL

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

app.listen(3001);