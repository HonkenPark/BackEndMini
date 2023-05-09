const express = require('express');
const cors = require('cors');
const axios = require('axios')
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
    });

    process.stderr.on('data', (err) => {
      reject(err.toString());
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(`Failed with code ${code}`);
      }
      resolve(result);
    });
  });
}

app.get('/', function(req, res) {
  res.set({'access-control-allow-origin':'*'});
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
  res.set({'access-control-allow-origin':'*'});
  res.send('<a href=\'https://naver.com\'>Naver Response</a>');
})

app.get('/kakao', function(req, res) {
  res.set({'access-control-allow-origin':'*'});
  res.send('Kakao Response !!');
})

app.get('/currency', function(req, res) {
  console.log(req.query.authkey);
  console.log(req.query.searchdate);
  console.log(req.query.data);

  axios.get(req.query.url, {
    params: {
      authkey: req.query.authkey,
      searchdate: req.query.searchdate,
      data: req.query.data
    }
  })
  .then(response => {
    console.log(response.data);
    res.set({'access-control-allow-origin':'*'});
    res.send(response.data);
  })
  .catch(error => {
    console.error(error);
  });
})

app.get('/flight', async (req, res) => {
  try {
    const result = await runPythonFile('./python/flight.py');
    res.set({'access-control-allow-origin':'*'});
    res.send({result});
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
})

app.use(cors(corsOptions));
app.listen(3001);
