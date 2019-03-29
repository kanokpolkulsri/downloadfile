/*  INSTRUCTION OF DECLARING VARIABLES  */
/*  
    sources:  Give full URL as "protocol://domainname/path"
    const sources = ["scp://demo:password@test.rebex.net/readme.txt", "ftp://download.bit/download/50MB.zip", "ssh://demo:password@test.rebex.net/readme.txt"]

    location: Give full path as "/Path/..subpath/" and the last letter of path must be "/"
    const location = "/Users/tonplamm/Desktop/agoda/"
*/

let sources = []
let location = ""

module.exports = {sources, location}