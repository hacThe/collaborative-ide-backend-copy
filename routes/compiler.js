var express = require('express');
var router = express.Router();
const axios = require('axios')
const chalk = require('chalk');
const { Version, ProgrammingLanguage } = require('../models/programming_language')

const languages = [
  new ProgrammingLanguage('Java', 'java', [new Version('JDK 11.0.4', 3), new Version('JDK 17.0.1', 4)]),
  new ProgrammingLanguage('C', 'c', [new Version('GCC 9.1.0', 4), new Version('GCC 11.1.0', 5)]),
  new ProgrammingLanguage('C++', 'cpp', [new Version('GCC 9.1.0', 4), new Version('GCC 11.1.0', 5)]),
  new ProgrammingLanguage('C++ 14', 'cpp14', [new Version('g++ 14 GCC 9.1.0', 3), new Version('GCC 11.1.0', 4)]),
  new ProgrammingLanguage('C++ 17', 'cpp17', [new Version('g++ 17 GCC 9.1.0', 0), new Version('GCC 11.1.0', 1)]),
  new ProgrammingLanguage('Python 2', 'python2', [new Version('2.7.16', 2), new Version('2.7.18', 3)]),
  new ProgrammingLanguage('Python 3', 'python3', [new Version('3.7.4', 3), new Version('3.9.9', 4)]),
  new ProgrammingLanguage('GO Lang', 'go', [new Version('1.13.1', 3), new Version('1.17.3', 4)]),
  new ProgrammingLanguage('C#', 'csharp', [new Version('mono 6.0.0', 3), new Version('mono-6.12.0', 4)]),
  new ProgrammingLanguage('Swift', 'swift', [new Version('5.1', 3), new Version('5.5', 4)]),
  new ProgrammingLanguage('Dart', 'dart', [new Version('2.5.1', 3), new Version('2.14.4', 4)]),
  new ProgrammingLanguage('NodeJS', 'nodejs', [new Version('12.11.1', 3), new Version('17.1.0', 4)]),
  new ProgrammingLanguage('Kotlin', 'kotlin', [new Version('1.3.50 (JRE 11.0.4)', 2), new Version('1.6.0 (JRE 17.0.1+12)', 3)]),
]

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

  const findLanguage = languages.find((value) => value.name === languageName)
  if (findLanguage) {
    const languageCode = findLanguage.languageCode
    const selectVersion = findLanguage.versions.find((value) => value.name === versionName)

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
    'result': languages.map((e) => e.toMap())
  })
})



module.exports = router;
