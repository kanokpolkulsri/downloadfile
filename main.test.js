const MAIN = require('./main')

/* change test location here */
let location = ""

describe('SUBFUNCTION CASES', () => {
    it("unique name: protocol", () => {
        expect(MAIN.uniqueName("ftp://speedtest.tele2.net/5MB.zip")).toContain("ftp")
    })
    it("unique name: name", () => {
        expect(MAIN.uniqueName("ftp://speedtest.tele2.net/5MB.zip")).toContain("speedtesttele2net5MBzip")
    })
    it("unique name: type of file", () => {
        expect(MAIN.uniqueName("ftp://speedtest.tele2.net/5MB.zip")).toContain(".zip")
    })
    it("configurable location: exists & mkdir", () => {
        expect(() => {MAIN.isLocationExists("/config/fake/path/")}).toThrow()
    })
    it("configurable location: syntax", () => {
        expect(() => {MAIN.isLocationSyntax("/config/fake/path")}).toBeTruthy()
    })
    it("configurable location: delete file(s)", () => {
        expect(() => {MAIN.deleteLoadingFile("/config/fake/path/")}).toThrow()
    })
})

describe('DOWNLOAD CASES', () => {
    it("http", () => {
        let source = "http://tineye.com/images/widgets/mona.jpg"
        return MAIN.download(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
        })
    }, 30000)
    it("https", () => {
        let source = "https://unsplash.com/photos/AaEQmoufHLk/download?force=true"
        return MAIN.download(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
        })
    }, 30000)
    it("ftp: case 1", () => {
        let source = "ftp://speedtest.tele2.net/5MB.zip"
        return MAIN.download(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
        })
    }, 30000)
    it("ftp: case 2", () => {
        let source = "ftp://ftp.denx.de/pub/u-boot/u-boot-2011.12.tar.bz2"
        return MAIN.download(source, location).then(data => {
            expect(data).toEqual("<success>: " + source)
        })
    }, 30000)
    
    
})

/* PROCESS */
process.on('SIGINT',  () => {
    deleteLoadingFile(Input.location)
    process.exit()
})
