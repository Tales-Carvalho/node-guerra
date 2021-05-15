const http = require('http')
const fs = require('fs')

// HTTP Handling

const response = (req, res) => {
    let file = ''
    
    if (req.url === '/')
        file = __dirname + '/index.html'
    else
        file = __dirname + req.url

    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404)
            return res.end('File not found.')
        }
        res.writeHead(200)
        res.end(data)
    })
}

const app = http.createServer(response)
app.listen(3000)
console.log('Listening in http://localhost:3000')

// Game internal variables

const players = {
    white: '',
    blue: '',
    red: '',
    yellow: '',
    green: '',
    black: ''
}

const gameState = {
    // TODO: info de exercitos em territorios, cartas de cada jogador, etc.
}

// Socket handling

const io = require('socket.io')(app)

io.on('connection', (socket) => {
    socket.on('join', (data, callback) => {
        console.log('join: ' + data.nick)
        callback(true)
    })
})
