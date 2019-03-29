const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const Input = require('./input')
const Client = require('ftp')
const scpClient = require('scp2')
const url = require('url')
const SSH2Utils = require('ssh2-utils')
const ssh = new SSH2Utils()
Axios.defaults.adapter = require('axios/lib/adapters/http')

let SOURCES = ""
let LOCATION = ""
let supportProtocol = ["http", "https", "ftp", "scp", "sftp", "ssh"]

/* FUNCTION */
uniqueName = (source) => {
    let typeOfFile = Path.basename(source).split(".")[1] === undefined ? "" : "." + Path.basename(source).split(".")[1]
    let name = source.split("://")[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?@]/g,"")
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
            process.exit()
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
    let protocol = source.split(":")[0]
    if(supportProtocol.indexOf(protocol) !== -1)
        return protocol
    else
        return undefined
}

/* FUNCTION WITH DOWNLOAD */
checkCredential = (file) => {
    if (file.indexOf("@") !== -1) {
        var substring = file.split("@")[0].split("://")[1]
        return substring.indexOf("/") !== -1
    } else {
        return false
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

getConfigScp = (source) => {
    let parsed = parseUrl(source)
    let config = {
        host: parsed.host,
        username: parsed.username,
        password: parsed.password,
        path: parsed.remoteFile
    }
    return config
}

downloadScp = (source) => {
    return new Promise((resolve, reject) => {
        let path = LOCATION + uniqueName(source)
        let config = getConfigScp(source)
        scpClient.scp(config, path, (err) => {
            if(err){
                    Fs.unlinkSync(path)
                    resolve("<error>: " + source)
                    throw err;
            }else{
                Fs.rename(path, path.replace("(loading)_", ""), () => {
                    resolve("<success>: " + source)
                })
            }
        })
    })
}

getConfigSsh = (source) => {
    let parsed = parseUrl(source)
    let configServer = {
        host: parsed.host,
        username: parsed.username,
        password: parsed.password
    }
    let configRemotePath = parsed.remoteFile
    let config = []
    config.push(configServer, configRemotePath)
    return config
}

downloadSsh = (source) => {
    return new Promise((resolve, reject) => {
        let path = LOCATION + uniqueName(source)
        let config = getConfigSsh(source)
        let configServer = config[0]
        let configRemotePath = config[1]
        ssh.getFile(configServer, configRemotePath, path, function(err){
            if(err){
                Fs.unlinkSync(path)
                resolve("<error>: " + source)
                throw err;
            }else{
                Fs.rename(path, path.replace("(loading)_", ""), () => {
                    resolve("<success>: " + source)
                })
            }
        })
    })
}

downloadLocal = (source) => {
    return new Promise((resolve, reject) => {
        resolve("<no support>: " + source)
    })
}

download = (protocol, source) => {
    if(protocol == "http" || protocol == "https"){
        return downloadHttp(source)
    }else if(protocol == "ftp"){
        return downloadFtp(source)
    }else if(protocol == "scp" || protocol == "sftp"){
        return downloadScp(source)
    }else if(protocol == "ssh"){
        return downloadSsh(source)
    }else if(protocol == undefined){
        return downloadLocal(source)
    }

}

test = (source, location) => {
    LOCATION = location
    let protocol = getProtocol(source)
    return download(protocol, source)
}

/* MAIN */
main = () => {
    let listDownload = []
    SOURCES = Input.sources
    LOCATION = Input.location

    setLocation()

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

module.exports = {test}