(function(window){

    window.Engine = (function(window) {

        var document = window.document;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        var level = 1;
        var score = 0;

        var lastTime;
        var loop;
        var paused = false;

        var columns = 7;
        var rows = 7;
        var map = [
            'images/water-block.png',   // Top row is water
            'images/stone-block.png',   // Row 1 of 4 of stone
            'images/stone-block.png',   // Row 2 of 4 of stone
            'images/stone-block.png',   // Row 3 of 4 of stone
            'images/stone-block.png',   // Row 4 of 4 of stone
            'images/grass-block.png',   // Row 1 of 2 of grass
            'images/grass-block.png'    // Row 2 of 2 of grass
        ];

        canvas.width = 101 * columns;
        canvas.height = 171 - 83 + (83 * rows) - 50;
        document.body.appendChild(canvas);

        function main() {
            var now = Date.now();
            var dt = (now - lastTime) / 1000.0;

            update(dt);
            render();

            if (paused) {
                cancelAnimationFrame(loop);
            }
            else {
                lastTime = now;
                loop = requestAnimationFrame(main);
            }
        }

        function init() {
            window.player = new Player(map.length, columns);
            window.enemies = [];
            window.coins = [];
            range(6, function(){
                enemies.push(new Enemy(getRandom(1, 3)));
            });
            range(level, function(){
                coins.push(new Coin());
            });
            lastTime = Date.now();
            main();
        }

        function start() {
            paused = false;
            main();
        }

        function pause() {
            paused = true;
        }

        function nextLevel() {
            document.removeEventListener('keyup', window.keyupHandler);
            paused = true;
            level++;
            setTimeout(function(){
                player.x = player.start.x;
                player.y = player.start.y;
                document.addEventListener('keyup', window.keyupHandler);
                paused = false;
                init();
            }.bind(this), 1000);
        }

        function update(dt) {
            updateEntities(dt);
        }

        function updateEntities(dt) {
            enemies.forEach(function(enemy) {
                enemy.update(dt);
            });
            player.update();
        }

        function render() {

            var numRows = map.length;
            var numCols = columns;
            var row;
            var col;

            for (row = 0; row < numRows; row++) {
                for (col = 0; col < numCols; col++) {
                    ctx.drawImage(Resources.get(map[row]), col * 101, (row * 83) - 50);
                }
            }
            renderText();
            renderEntities();
        }

        function renderText() {
            ctx.font = "16px serif";
            ctx.fillText("Level: " + level, 5, 20);
            ctx.fillText("Score: " + score, 5, 40);
        }

        function renderEntities() {
            coins.forEach(function(coin) {
                coin.render();
            });
            enemies.forEach(function(enemy) {
                enemy.render();
            });
            player.render();
        }

        function reset() {

        }

        function get(variable) {
            return eval(variable);
        }

        function adjustScore(num) {
            score += num;
        }

        Resources.load([
            'images/stone-block.png',
            'images/water-block.png',
            'images/grass-block.png',
            'images/enemy-bug.png',
            'images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png',
            'images/Gem-Blue.png',
            'images/Gem-Green.png',
            'images/Gem-Orange.png',
            'images/Heart.png',
            'images/Key.png',
            'images/Rock.png',
            'images/Selector.png',
            'images/Star.png'
        ]);
        Resources.onReady(init);

        window.canvas = canvas;
        window.ctx = ctx;

        return {
            start: start,
            pause: pause,
            nextLevel: nextLevel,
            adjustScore: adjustScore,
            get: get
        };

    }(window));

}(this));
