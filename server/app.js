const http = require('http')
const fs = require('fs')

// HTTP Handling

const response = (req, res) => {
    let file = ''
    
    if (req.url === '/')
        file = process.cwd() + '/index.html'
    else
        file = process.cwd() + '/' + req.url

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

const gameState = {
    players: {
        white: '',
        blue: '',
        red: '',
        yellow: '',
        green: '',
        black: ''
    }
    // TODO: general game info: armies, cards, etc.
}

const objectives = { // TODO: on game start, get a random objective for each player
    white: '',
    blue: '',
    red: '',
    yellow: '',
    green: '',
    black: ''
}

// Socket handling

const io = require('socket.io')(app)

io.on('connection', (socket) => {
    socket.on('join', (loginData, callback) => {
        // TODO: validate color and nick
        if (gameState.players[loginData.color] == '') {
            socket.color = loginData.color
            socket.nick = loginData.nick
            gameState.players[loginData.color] = loginData.nick
            io.sockets.emit('gameState', gameState)
            console.log('Player connected: ' + loginData.nick + ' (' + loginData.color + ')')
            callback(true)
        }
        else {
            console.log(loginData.nick + ' could not join because ' + loginData.color + ' was already picked.')
            callback(false)
        }
        console.log(JSON.stringify(gameState))
    })

    socket.on('disconnect', () => {
        if (gameState.players[socket.color]) // Catch case that socket.color is undefined
            gameState.players[socket.color] = ''
        io.sockets.emit('gameState', gameState)
        console.log('Player disconnected: ' + socket.nick + ' (' + socket.color + ')')
        console.log(JSON.stringify(gameState))
    })
})
