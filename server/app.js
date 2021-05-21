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

const colors = ['white', 'blue', 'red', 'yellow', 'green', 'black']

const gameState = {
    players: {},
    territories: {}
    // TODO: general game info: armies, cards, etc.
}

for (c of colors) {
    gameState.players[c] = {
        nick: '',
        armies: 0,
        territories: 0,
        cards: 0
    }
}

for (t of require('../data/territories.json')) {
    gameState.territories[t.id] = {
        count: 0,
        color: 'none'
    }
}

const goals = {}

for (c of colors) {
    goals[c] = '' // TODO: on game start, get a random objective for each player
}

const playerCards = {}

for (c of colors) {
    playerCards[c] = []
}

const updatePlayerInfo = () => {
    for (c of colors) {
        gameState.players[c].armies = 0
        gameState.players[c].territories = 0
    }
    Object.values(gameState.territories).forEach(t => {
        if (t.color != 'none') {
            gameState.players[t.color].armies += t.count
            gameState.players[t.color].territories ++
        }
    })
}

// Socket handling

const io = require('socket.io')(app)

io.on('connection', (socket) => {
    socket.on('join', (loginData, callback) => {
        if (!colors.includes(loginData.color) || loginData.nick == '') {
            console.log(loginData.nick + ' (' + loginData.color + ') could not join because of invalid data.')
            callback(false)
        }
        if (gameState.players[loginData.color].nick == '') {
            socket.color = loginData.color
            socket.nick = loginData.nick
            gameState.players[loginData.color].nick = loginData.nick
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
        if (gameState.players[socket.color]) // Catches case that socket.color is undefined
            gameState.players[socket.color].nick = ''
        io.sockets.emit('gameState', gameState)
        console.log('Player disconnected: ' + socket.nick + ' (' + socket.color + ')')
        console.log(JSON.stringify(gameState))
    })

    socket.on('addArmy', territoryId => {
        if (gameState.territories[territoryId].color == socket.color || gameState.territories[territoryId].color == 'none') {
            gameState.territories[territoryId].count ++
            gameState.territories[territoryId].color = socket.color
            updatePlayerInfo()
            io.sockets.emit('gameState', gameState)
            console.log('Player ' + socket.color + ' adds an army to ' + territoryId)
            console.log(JSON.stringify(gameState))
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
            updatePlayerInfo()
            io.sockets.emit('gameState', gameState)
            console.log('Player ' + socket.color + ' removes an army from ' + territoryId)
            console.log(JSON.stringify(gameState))
        }
    })

    socket.on('requestObjective', callback => {
        callback(goals[socket.color])
    })
})
