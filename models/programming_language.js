class Version {
    constructor(name, index) {
        this.name = name
        this.index = index
    }
}

class ProgrammingLanguage {
    constructor(name, languageCode, versions) {
        this.name = name
        this.languageCode = languageCode
        this.versions = versions
    }

    toMap() {
        return {
            'name': this.name,
            'languageCode':this.languageCode,
            'versions': this.versions.map((element) => element.name)
        }
    }
}

module.exports = {
    Version, ProgrammingLanguage
}