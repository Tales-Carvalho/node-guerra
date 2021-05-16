const socket = io.connect()

$('form#login').on('submit', (e) => {
    e.preventDefault()
    const data = {}
    $('form#login').serializeArray().forEach((d) => data[d.name] = d.value)
    
    if (data.nick == '') {
        window.alert('Type a nickname')
        return
    }

    if (data.color == '') {
        window.alert('Select a color')
        return
    }
    
    socket.emit('join', data, (response) => {
        if (response) {
            $('div#player-login').hide()
            $('div#game-board').show()
        }
        else {
            window.alert('Color was already picked')
        }
    })
})

socket.on('gameState', gameState => {
    // TODO: update board and players area
    console.log(gameState)
})
