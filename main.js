const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const Input = require('./input')
Axios.defaults.adapter = require('axios/lib/adapters/http')

/* FUNCTION */
uniqueName = (URL) => {
    let typeOfFile = Path.basename(URL).split(".")[1] === undefined ? "" : "." + Path.basename(URL).split(".")[1]
    let name = URL.split("://")[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"")
    let protocol = URL.split("://")[0] + "_"
    let time = (new Date()).getTime() + "_"
    let status = "(loading)_"
    return (status + time + protocol + name + typeOfFile)
}

download = async (URL, LOCATION) => {
    console.log("<downloading>: " + URL)
    let path = LOCATION + uniqueName(URL)
    let writer = Fs.createWriteStream(path)  
    return new Promise((resolve, reject) => {
        Axios({url: URL, method: 'GET', responseType: 'stream'})
        .then(response => {
            response.data.pipe(writer)
            let responsePath = response.data._readableState.pipes.path
            writer.on('finish', () => {
                Fs.rename(responsePath, responsePath.replace("(loading)_", ""), () => {
                    resolve("<success>: " + URL)
                })
            })
        })
        .catch(err => {
            Fs.unlinkSync(path)
            resolve("<error>: " + URL)
            throw err
        })
    })
}

deleteLoadingFile = (LOCATION) => {
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

isLocationExists = (LOCATION) => {
    try{
        if (!Fs.existsSync(LOCATION)){
            Fs.mkdirSync(LOCATION)
        }
    }catch(err){
        throw err
    }
    
}

isLocationSyntax = (LOCATION) => {
    return (LOCATION[LOCATION.length - 1] === "/")
}

/* PROCESS */
process.on('SIGINT',  () => {
    deleteLoadingFile(Input.location)
    process.exit()
})

/* MAIN */
main = () => {
    let SOURCES = Input.sources
    let LOCATION = Input.location
    let results = []
    try{
        if(isLocationSyntax(LOCATION)){
            isLocationExists(LOCATION)
            for(let subsource in SOURCES){
                results.push(download(SOURCES[subsource], LOCATION))
            }
            Promise.all(results).then(values => {
                deleteLoadingFile(LOCATION)
                console.log(values)
            })
        }else{
            console.log("Error: following the instrcution in input.js")
        }
    }catch(err){
        throw err
    }
}

if(require.main === module){
    main()
}

module.exports = {uniqueName, isLocationExists, isLocationSyntax, deleteLoadingFile, download}