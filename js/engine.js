var Engine = (function(global) {

    var d = global.document;
    var w = global.window;
    var canvas = d.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var lastTime;

    canvas.width = 101 * gameProperties.SCREEN_COLUMNS;
    canvas.height = 171 + (83 * gameProperties.SCREEN_ROWS) - 75;
    canvas.id = 'canvas';
    d.body.appendChild(canvas);

    var map = d.createElement('canvas');
    mapCtx = map.getContext('2d');
    map.width = 101 * gameProperties.SCREEN_COLUMNS;
    map.height = 171 + (83 * gameProperties.SCREEN_ROWS) - 75;

    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        if ( !w.PAUSED ) {
            update(dt);
            render();
            lastTime = now;
            w.requestAnimationFrame(main);
        }
    }

    function init() {
        var rowImages = [
            'images/water-block.png',
            'images/stone-block.png',
            'images/stone-block.png',
            'images/stone-block.png',
            'images/stone-block.png',
            'images/stone-block.png',
            'images/grass-block.png'
        ];
        var row;
        var col;
        for (row = 0; row < gameProperties.SCREEN_ROWS; row++) {
            for (col = 0; col < gameProperties.SCREEN_COLUMNS; col++) {
                mapCtx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83 + 7);
            }
        }

        lastTime = Date.now();
        main();
    }

    function update(dt) {
        updateEntities(dt);
    }

    function updateEntities(dt) {
        gameProperties.update(dt);
        if ( !gameProperties.pauseGame ) {
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
            });
            player.update();
        }
    }

    function render() {
        renderBackground();
        renderEntities();
        renderGameInfo();
        renderScreens();
    }

    function renderBackground() {
        ctx.clearRect(0 , 0 , canvas.width, canvas.height);
        ctx.drawImage(map, 0, 0);
    }

    function renderGameInfo() {
        gameProperties.render();
    }

    function renderEntities() {
        var key;
        collectibleManager.currentCollectibles.forEach(function(collectible) {
            if ( collectible.type === 'key' ) {
                key = collectible;
            }
            collectible.render();
        });
        rockManager.currentRocks.forEach(function(rock){
            rock.render();
        });
        if ( key ) {
            key.render();
        }
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        player.render();
    }

    function renderScreens() {
        pauseScreen.render();
        // infoScreen.render();
        // infoItem.render();
    }

    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug-face-left.png',
        'images/enemy-bug-face-right.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem-Blue.png',
        'images/Gem-Orange.png',
        'images/Gem-Green.png',
        'images/Heart.png',
        'images/Rock.png',
        'images/Star.png',
        'images/Key.png',
        'images/Selector.png'
    ]);
    Resources.onReady(init);

    global.ctx = ctx;

})(this);
