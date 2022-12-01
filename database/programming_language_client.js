const { Version, ProgrammingLanguage } = require('../models/programming_language')

class PLClient {
    constructor() {
        if (PLClient._instance) {
            return PLClient._instance
        }
        PLClient._instance = this
    }

    languages = [
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

    findLanguage(languageName) {
        return this.languages.find((value) => value.name === languageName)
    }

    findVersionIndex(language, versionName) {
        return language.versions.find((value) => value.name === versionName)
    }
}

module.exports.PLClient = PLClient