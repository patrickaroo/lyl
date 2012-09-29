(function (cp) {
    // Debugging tools
    //cp.debug.active = true;
    //cp.debug.showCollisions = true;

    // List of scripts to load relative to js/objects
    cp.load.loadFiles = [
        'game/player'
    ];

    // Width, height, and game run logic
    cp.core.init(1024, 768, function () {
        // Keyboard key configuration
        cp.input.bind('arrowUp', 'up');
        cp.input.bind('arrowDown', 'down');
        cp.input.bind('arrowLeft', 'left');
        cp.input.bind('arrowRight', 'right');

        cp.game.spawn('Player');
    });
}(cp));