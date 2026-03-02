require("dotenv/config");

const express = require('express');
const https = require('https');

const fs = require('fs');
const path = require('path');
const subroutine = require('child_process');

const app = express();

app.use(express.json());

app.post('/webhook', (request, response) => {
  console.log('Received webhook.');

  const scriptPath = path.resolve(__dirname, 'src', 'scripts ', 'listen_to_github_updates.sh');
  subroutine.exec(scriptPath, (error) => {
    if (error) {
      console.error(error);
      response.status(500).send();
    } else {
      console.log("Executed script.");
      response.status(200).send();
    }
  });
});

const port = process.env.WEBHOOK_PORT || "4001";
const options = {
  key: fs.readFileSync(process.env.HTTPS_KEY_PATH || "key.pem"),
  cert: fs.readFileSync(process.env.HTTPS_CERT_PATH || "cert.pem")
}

https
  .createServer(app, options)
  .listen(port, () => console.log("Listening webhooks on port", port));
