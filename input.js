/*  INSTRUCTION OF DECLARING VARIABLES  */
/*  
    sources:  Give full URL as "protocol://domainname/path"
    examples
        const sources = ["http://my.file.com/file", "ftp://other.file.com/other", "sftp://and.also.this/ending"]
        const sources = ["https://www.file.com/file/force?download=true", "ftp://download.bit/download/50MB.zip"]

    location: Give full path as "/Path/..subpath/" and the last letter of path must be "/"
    examples
        const location = "/Users/Kanokpol/Desktop/File/"
        const location = "/Users/Kulsri/Document/Agoda/Download/"
*/

let sources = ["ftp://anonymous:miemail%40gmail.com@speedtest.tele2.net/100KB.zip"]
let location = "/Users/tonplamm/Desktop/agoda/"

module.exports = {sources, location}