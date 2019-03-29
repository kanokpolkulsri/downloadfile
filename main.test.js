const MAIN = require('./main')
const Fs = require('fs')

/* change test local location here */
let location = "/Users/tonplamm/Desktop/agoda/"

describe('DOWNLOAD CASES', () => {

    let deleteFile = (filePath) => {
        Fs.unlinkSync(filePath)
    }

    it("http", () => {
        let source = "http://tineye.com/images/widgets/mona.jpg"
        let filePath = location + "http_tineyecomimageswidgetsmonajpg.jpg"
        return MAIN.test(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
            deleteFile(filePath)
        })
    }, 10000)
    it("https", () => {
        let source = "https://docs.uproc.io/pdf/resumen_del_servicio_ES.pdf"
        let filePath = location + "https_docsuprociopdfresumendelservicioESpdf.pdf"
        return MAIN.test(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
            deleteFile(filePath)
        })
    }, 10000)
    it("ftp", () => {
        let source = "ftp://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip"
        let filePath = location + "ftp_anonymousmiemail40gmailcomspeedtesttele2net100KBzip.zip"
        return MAIN.test(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
            deleteFile(filePath)
        })
    }, 10000)
    it("sftp", () => {
        let source = "sftp://demo:password@test.rebex.net/readme.txt"
        let filePath = location + "sftp_demopasswordtestrebexnetreadmetxt.txt"
        return MAIN.test(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
            deleteFile(filePath)
        })
    }, 10000)
    it("scp", () => {
        let source = "scp://demo:password@test.rebex.net/readme.txt"
        let filePath = location + "scp_demopasswordtestrebexnetreadmetxt.txt"
        return MAIN.test(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
            deleteFile(filePath)
        })
    }, 10000)
    it("ssh", () => {
        let source = "ssh://demo:password@test.rebex.net/readme.txt"
        let filePath = location + "ssh_demopasswordtestrebexnetreadmetxt.txt"
        return MAIN.test(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
            deleteFile(filePath)
        })
    }, 10000)
})
