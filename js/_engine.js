var Engine = (function(global) {

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    canvas.id = 'canvas';
    doc.body.appendChild(canvas);

    function main() {

        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        lastTime = now;

        win.requestAnimationFrame(main);
    }

    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    function updateEntities(dt) {
        gameProperties.update(dt);
        if(!gameProperties.pauseGame) {
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
            });
            player.update();
        }
        collectibleManager.update();
    }

    function render() {

        renderBackground();
        renderGameInfo();
        renderEntities();
        renderScreens();

    }

    function renderBackground() {
        /* Clear the canvas so that any images drawn at the top of the canvas
         * are cleared before the next 'screen' is rendered so that they are
         * no longer visible
         */
        ctx.clearRect(0 , 0 , canvas.width, canvas.height);

        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
            if(gameProperties) {
                gameProperties.renderColouredTilesForRow(row-1);
            }
        }
    }

    function renderGameInfo() {
        gameProperties.render();
    }

    function renderEntities() {

        collectibleManager.currentCollectibles.forEach(function(collectible) {
            collectible.render();
        });

        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    function renderScreens() {
        pauseScreen.render();
        infoScreen.render();
        infoItem.render();
    }

    function reset() {
        // no-op
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
        'images/blank-tile.png',
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

})(this);
