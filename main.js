const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const Input = require('./input')
const Client = require('ftp')
const url = require('url')

let SOURCES = Input.sources
let LOCATION = Input.location

/* FUNCTION */
uniqueName = (source) => {
    let typeOfFile = Path.basename(source).split(".")[1] === undefined ? "" : "." + Path.basename(source).split(".")[1]
    let name = source.split("://")[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"")
    let protocol = source.split("://")[0] + "_"
    let status = "(loading)_"
    return (status + protocol + name + typeOfFile)
}

deleteLoadingFile = () => {
    try{
        let files = Fs.readdirSync(LOCATION)
        if(files.length > 0){
            for(let tmp in files){
                if(files[tmp].includes("(loading)")){
                    Fs.unlinkSync(LOCATION + files[tmp])
                }
            }
        }
    }catch(err){
        throw err
    }
}

setLocation = () => {
    LOCATION = LOCATION[LOCATION.length - 1] === "/" ? LOCATION : LOCATION + "/"
    if (!Fs.existsSync(LOCATION)){
        Fs.mkdirSync(LOCATION)
    }
}

getProtocol = (source) => {
    let supportProtocol = ["http", "https", "ftp", "scp"]
    let protocol = source.split(":")[0]
    if(supportProtocol.indexOf(protocol) !== -1)
        return protocol
    else
        return "local"
}

downloadHttp = (source) => { 
    return new Promise((resolve, reject) => {
        let path = LOCATION + uniqueName(source)
        let writer = Fs.createWriteStream(path) 
        Axios({url: source, method: 'GET', responseType: 'stream'})
        .then(response => {
            response.data.pipe(writer)
            let responsePath = response.data._readableState.pipes.path
            writer.on('finish', () => {
                Fs.rename(responsePath, responsePath.replace("(loading)_", ""), () => {
                    resolve("<success>: " + source)
                })
            })
        })
        .catch(err => {
            Fs.unlinkSync(path)
            resolve("<error>: " + source)
            throw err
        })
    })
}

checkCredential = (file) => {
    if (file.indexOf("@") !== -1) {
        var substring = file.split("@")[0].split("://")[1];
        return substring.indexOf("/") !== -1;
    } else {
        return false;
    }
}

parseUrl = (file) => {
    let parsed = url.parse(file);
    let host = parsed.host
    let port = parsed.port
    let auth = parsed.auth
    let remoteFile = parsed.path

    if (checkCredential(file)) {
        auth = file.split("@")[0].split("://")[1]
        parsed = url.parse(file.replace(auth, ""))
        host = parsed.host
        port = parsed.port
        remoteFile = parsed.path
    }

    let username = auth && auth.indexOf(":") !== -1 ? auth.split(":")[0] : ""
    let password = auth && auth.indexOf(":") !== -1 ? auth.split(":")[1] : ""
    if (!auth) {
        if (file.indexOf("@") !== -1) {
            let data = file.split("@")[0].split("/")
            auth = data[data.length - 1]
            username = auth && auth.indexOf(":") !== -1 ? auth.split(":")[0] : ""
            password = auth && auth.indexOf(":") !== -1 ? auth.split(":")[1] : ""
        }
    }

    return {
        host: host,
        port: port,
        auth: auth,
        username: username,
        password: password,
        remoteFile: remoteFile
    }
}

getConfigFtp = (source) => {
    let parsed = parseUrl(source)
    let config = {
        host: parsed.host,
        port: parsed.port,
        user: parsed.username,
        password: parsed.password,
        remoteFile: parsed.remoteFile
    }
    return config
}

downloadFtp = (source) => {
    return new Promise((resolve, reject) => {
        let path = LOCATION + uniqueName(source)
        let config = getConfigFtp(source)
        let c = new Client()
        c.on('ready', () => {
            c.get(config.remoteFile, (err, stream) => {
                if (err){
                    Fs.unlinkSync(path)
                    resolve("<error>: " + source)
                    throw err;
                }
                stream.pipe(Fs.createWriteStream(path))
                stream.once('close', function() {
                    Fs.rename(path, path.replace("(loading)_", ""), () => {
                        resolve("<success>: " + source)
                    })
                    c.end()
                })
            })
        })
        c.connect(config)
    })
}

downloadScp = (source) => {
    return new Promise((resolve, reject) => {
        console.log("building downloadFtp")
        resolve("<success>: " + source)
    })
}

downloadLocal = (source) => {
    return new Promise((resolve, reject) => {
        console.log("building downloadFtp")
        resolve("<success>: " + source)
    })
}

download = (protocol, source) => {

    if(protocol == "http" || protocol == "https"){
        return downloadHttp(source)
    }else if(protocol == "ftp"){
        return downloadFtp(source)
    }else if(protocol == "scp"){
        return downloadScp(source)
    }else if(protocol == "local"){
        return downloadLocal(source)
    }

}

/* MAIN */
main = () => {
    setLocation()

    let listDownload = []

    for(let subsource in SOURCES){
        let source = SOURCES[subsource]
        let protocol = getProtocol(source)
        listDownload.push(download(protocol, source))
    }

    Promise.all(listDownload).then(res => {
        console.log(res)
        deleteLoadingFile()
    })
}

if(require.main === module){
    main()
}

module.exports = {uniqueName, setLocation, deleteLoadingFile}