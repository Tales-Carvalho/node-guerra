const socket = io.connect()

$.getJSON('data/territories.json', json => {
    for (const t of json) {
        const $divWrapper = $('<div/>').attr('class', 'territory-info army-none').attr('id', t.id)
        $divWrapper.css('top', t.y + 'px')
        $divWrapper.css('left', t.x + 'px')
        $divWrapper.append($('<p/>').attr('class', 'territory-name').text(t.name))
        const $pControls = $('<p/>').attr('class', 'territory-controls')
        $pControls.append($('<button/>').attr('class', 'army-control army-remove').text('-').on('click', () => {
            socket.emit('removeArmy', t.id)
        }))
        $pControls.append($('<span/>').attr('class', 'army-count').text('0'))
        $pControls.append($('<button/>').attr('class', 'army-control army-add').text('+').on('click', () => {
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

$('button#objective-btn').on('click', (e) => {
    socket.emit('requestObjective', (response) => {
        window.alert('Your objective is:\n' + response)
    })
})

socket.on('gameState', gameState => {
    // Players update
    ['white', 'blue', 'red', 'yellow', 'green', 'black'].forEach(c => {
        // Player name update (text of player-name inside color-info)
        $('#' + c + '-info p.player-name').text(gameState.players[c].nick == '' ? '-----' : gameState.players[c].nick)
        // Player counts update (text of spans inside color-info)
        $('#' + c + '-info span.player-armies-value').text(gameState.players[c].armies)
        $('#' + c + '-info span.player-territories-value').text(gameState.players[c].territories)
        $('#' + c + '-info span.player-cards-value').text(gameState.players[c].cards)
    })
    // Armies update
    Object.keys(gameState.territories).forEach(t => {
        // Color update (class of territory id)
        $('#' + t).attr('class', 'territory-info army-' + gameState.territories[t].color)
        // Count update (text of span)
        $('#' + t + ' span.army-count').text(gameState.territories[t].count)
    })
})
