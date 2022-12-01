var express = require('express');
var router = express.Router();
const axios = require('axios')
const chalk = require('chalk');
const { PLClient } = require('../database/programming_language_client')

const plClient = new PLClient()

const compilerClient = axios.create({
  baseURL: 'https://api.jdoodle.com/v1/execute',
  timeout: 5000,
  headers: {
    "accept-encoding": "*"
  }
})

/* POST execute compile code */
router.post('/execute', async (req, res) => {
  const languageName = req.body['language']
  const script = req.body['script']
  const versionName = req.body['version']

  const findLanguage = plClient.findLanguage(languageName)
  if (findLanguage) {
    const languageCode = findLanguage.languageCode
    const selectVersion = plClient.findVersionIndex(findLanguage, versionName)

    if (selectVersion) {
      const versionIndex = selectVersion.index
      console.log(chalk.blue.bold('REQUEST https://api.jdoodle.com/v1/execute'))

      await compilerClient.post('', {
        "clientId": process.env.CLIENT_ID,
        "clientSecret": process.env.CLIENT_SECRET,
        "script": script,
        "language": languageCode,
        "versionIndex": versionIndex
      }).then((response) => {
        console.log(chalk.blue.bold(`RESPONSE: ${JSON.stringify(response.data)}`))
        res.status(201).send(response.data)
      }).catch((error) => {
        console.error(chalk.red.bold(`ERROR: ${error}`))
        res.status(500).send('Can\'t compile code')
      })
    } else {
      res.status(404).send('Not found any match version')
    }
  } else {
    res.status(404).send('Not found any match programming language')
  }
})

/* GET list programming langugae and version */
router.get('/get-programming-languages', (req, res) => {
  console.log(chalk.blue.bold('get programming languages'))
  res.status(200).send({
    'result': plClient.languages.map((e) => e.toMap())
  })
})



module.exports = router;
