(function(window){

    window.Enemy = function(speed) {
        var height = 83;
        var width = 101;
        var row = getRandom(1, 4);

        this.height = height;
        this.width = width;
        this.x = getRandom(-1000, -10);
        this.y = height * getRandom(1, 4) - height;
        this.speed = speed;
        this.sprite = 'images/enemy-bug.png';
    };
    window.Enemy.prototype.update = function(dt) {
        if (this.x >= canvas.width) {
            this.x = getRandom(-1000, -10);
            this.y = this.height * (getRandom(1, 4)) - this.height;
        }
        this.x += dt * (this.speed * 100);
    };
    window.Enemy.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

}(this));

(function(window){

    window.Player = function(rows, columns){
        var height = 83;
        var width = 101;
        var startX = width * ((columns - 1) / 2)  ;
        var startY = height * rows - (height * 2);

        document.addEventListener('keyup', keyupHandler);

        function touches(piece1, piece2) {
            var piece1Area = {
                x: [piece1.x, piece1.x + piece1.width],
                y: [piece1.y, piece1.y + piece1.height]
            };
            var piece2Area = {
                x: [piece2.x, piece2.x + piece2.width],
                y: [piece2.y, piece2.y + piece2.height]
            };
            if
            (
                ((piece1Area.y[0] === piece2Area.y[0] && piece1Area.y[1] === piece2Area.y[1]) && (piece1Area.x[1] > piece2Area.x[0] && piece1Area.x[1] < piece2Area.x[1])) ||
                //((piece1Area.y[0] === piece2Area.y[0] && piece1Area.y[1] === piece2Area.y[1]) && (piece1Area.x[0] > piece2Area.x[0] && piece1Area.x[0] < piece2Area.x[1])) ||
                ((piece1Area.x[0] === piece2Area.x[0] && piece1Area.x[1] === piece2Area.x[1]) && (piece1Area.y[0] === piece2Area.y[0] && piece1Area.y[1] === piece2Area.y[1]))
            ) {
                return true;
            }
        }

        return {
            start: { x: startX, y: startY },
            height: height,
            width: width,
            x: startX,
            y: startY,
            sprite: 'images/char-boy.png',
            update: function() {
                enemies.forEach(function(enemy) {
                    if ( touches(enemy, this) ) {
                        this.x = startX;
                        this.y = startY;
                        Engine.adjustScore(-500);
                    }
                }.bind(this));

                coins = coins.filter(function(coin) {
                    if ( touches(coin, this) ) {
                        Engine.adjustScore(1000);
                    }
                    return !touches(coin, this);
                }.bind(this));
            },
            render: function() {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            },
            handleInput: function(key) {
                if (key === 'up') {
                    this.y -= height;
                    if (this.y < 0) {
                        Engine.nextLevel();
                    }
                }
                else if (key === 'down') {
                    if (this.y !== startY) {
                        this.y += height;
                    }
                }
                else if (key === 'left') {
                    if (this.x - width >= 0) {
                        this.x -= width;
                    }
                }
                else if (key === 'right') {
                    if (this.x + width <= canvas.width - width) {
                        this.x += width;
                    }
                }
            }
        };
    };

}(this));

(function(window){

    window.Coin = function() {
        var height = 83;
        var width = 101;
        var row = getRandom(1, 4);
        var col = getRandom(1, 6);

        this.height = height;
        this.width = width;
        this.x = width * (col - 1);
        this.y = height * row - height;
        this.sprite = 'images/Gem-Blue.png';
    };
    window.Coin.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

}(this));
