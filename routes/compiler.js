var express = require('express');
var router = express.Router();
const axios = require('axios')
const chalk = require('chalk');

const compilerClient = axios.create({
  baseURL: 'https://api.jdoodle.com/v1/execute',
  timeout: 5000,
  headers: {
    "accept-encoding": "*"
  }
})

/* POST execute compile code */
router.post('/', (req, res, next) => {
  const language = req.body['language']
  const script = req.body['script']
  const versionIndex = req.body['versionIndex']

  console.log(chalk.blue.bold('REQUEST https://api.jdoodle.com/v1/execute'))
  compilerClient.post('', {
    "clientId": process.env.CLIENT_ID,
    "clientSecret": process.env.CLIENT_SECRET,
    "script": script,
    "language": language,
    "versionIndex": versionIndex
  }).then((response) => {
    console.log(chalk.blue.bold(`RESPONSE: ${JSON.stringify(response.data)}`))
    res.status(201).send(response.data)
  }).catch((error) => {
    console.error(chalk.red.bold(`ERROR: ${error}`))
    res.status(500)
  })

})



module.exports = router;
