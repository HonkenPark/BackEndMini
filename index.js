const express = require('express');
const cors = require('cors');
const app = express();

let corsOptions = {
  origin: '*',
  credential: true
}


const { spawn } = require('child_process');

function runPythonFile(fileName) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [fileName], {
      env: { PYTHONIOENCODING: 'utf-8' }
    });
    
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
    res.set({'access-control-allow-origin':'*'});
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

app.use(cors(corsOptions));
app.listen(3001);
