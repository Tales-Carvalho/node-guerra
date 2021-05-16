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
    },
    territories: {}
    // TODO: general game info: armies, cards, etc.
}

for (t of require('../data/territories.json')) {
    gameState.territories[t.id] = {
        count: 0,
        color: 'none'
    }
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

    socket.on('addArmy', territoryId => {
        if (gameState.territories[territoryId].color == socket.color || gameState.territories[territoryId].color == 'none') {
            gameState.territories[territoryId].count ++
            gameState.territories[territoryId].color = socket.color
            io.sockets.emit('gameState', gameState)
            console.log('Player ' + socket.color + ' adds an army to ' + territoryId)
        }
    })

    socket.on('removeArmy', territoryId => {
        if (gameState.territories[territoryId].count == 0) {
            return
        }
        if (gameState.territories[territoryId].color == socket.color) {
            gameState.territories[territoryId].count --
            if (gameState.territories[territoryId].count == 0) {
                gameState.territories[territoryId].color = 'none'
            }
            io.sockets.emit('gameState', gameState)
            console.log('Player ' + socket.color + ' removes an army from ' + territoryId)
        }
    })
})
