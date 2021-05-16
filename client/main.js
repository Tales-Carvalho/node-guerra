const socket = io.connect()

$.getJSON('data/territories.json', json => {
    for (t of json) {
        const $divWrapper = $('<div/>').attr('class', 'territory-info army-none').attr('id', t.id)
        $divWrapper.css('top', t.y + 'px')
        $divWrapper.css('left', t.x + 'px')
        $divWrapper.append($('<p/>').attr('class', 'territory-name').text(t.name))
        const $pControls = $('<p/>').attr('class', 'territory-controls')
        $pControls.append($('<button/>').attr('class', 'army-remove').text('-').on('click', () => {
            socket.emit('removeArmy', t.id)
        }))
        $pControls.append($('<span/>').attr('class', 'army-count').text('0'))
        $pControls.append($('<button/>').attr('class', 'army-add').text('+').on('click', () => {
            socket.emit('addArmy', t.id)
        }))
        $divWrapper.append($pControls)
        $('div#game-center').append($divWrapper)
    }
})

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
    // Players update
    $('#white-info>p.player-name').text(gameState.players.white == '' ? 'Unknown' : gameState.players.white)
    $('#blue-info>p.player-name').text(gameState.players.blue == '' ? 'Unknown' : gameState.players.blue)
    $('#red-info>p.player-name').text(gameState.players.red == '' ? 'Unknown' : gameState.players.red)
    $('#yellow-info>p.player-name').text(gameState.players.yellow == '' ? 'Unknown' : gameState.players.yellow)
    $('#green-info>p.player-name').text(gameState.players.green == '' ? 'Unknown' : gameState.players.green)
    $('#black-info>p.player-name').text(gameState.players.black == '' ? 'Unknown' : gameState.players.black)
    // Armies update
    $('.territory-info').each(() => {
        
    })
})
