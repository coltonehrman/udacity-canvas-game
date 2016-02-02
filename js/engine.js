(function() {
    //                                   PLAYER                                     //
    //////////////////////////////////////////////////////////////////////////////////
    PLAYER = {
        lastRow: 0,
        lastColumn: 0,
        row: SCREEN_ROWS,
        column: SCREEN_MIDDLE_COLUMN,
        sprite: PLAYER_SPRITE,
        update: function() {
            var coords = getCoords(this.row, this.column);
            var hitRock = false;
            ROCKS.forEach(function(rock){
                if ( touches({ x: coords.x, y: coords.y }, rock) ) {
                    hitRock = true;;
                }
            });

            if (!hitRock) {
                this.x = coords.x;
                this.y = coords.y;

                ENEMIES.forEach(function(enemy) {
                    if ( touches(enemy, this) ) {
                        this.die();
                    }
                }.bind(this));

                GEMS = GEMS.filter(function(gem) {
                    if ( touches(gem, this) ) {
                        SCORE += GEM_VALUE;
                    }
                    return !touches(gem, this);
                }.bind(this));

                HEARTS = HEARTS.filter(function(heart) {
                    if ( touches(heart, this) ) {
                        LIVES++;
                    }
                    return !touches(heart, this);
                }.bind(this));
            }
            else {
                this.row = this.lastRow;
                this.column = this.lastColumn;
                coords = getCoords(this.row, this.column);
                this.x = coords.x;
                this.y = coords.y;
            }
        },
        render: function() {
            CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
        },
        inMiddle: function() {
            return this.row === SCREEN_MIDDLE_ROW && this.column === SCREEN_MIDDLE_COLUMN;
        },
        atTop: function() {
            return this.row === 1;
        },
        atBottom: function() {
            return this.row === SCREEN_ROWS;
        },
        die: function() {
            LIVES--;
            SCORE -= PENALTY;
            this.backToStart();
            if (LIVES === 0) {
                GAME_OVER = true;
            }
        },
        setLast: function() {
            this.lastRow = this.row;
            this.lastColumn = this.column;
        },
        backToStart: function() {
            this.row = SCREEN_ROWS;
            this.column = SCREEN_MIDDLE_COLUMN;
        }
    };
    //                             KEY EVENT HANDLER                                //
    //////////////////////////////////////////////////////////////////////////////////
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        handleInput(allowedKeys[e.keyCode]);
    });
    //                                   ENEMY                                      //
    //////////////////////////////////////////////////////////////////////////////////
    var Enemy = function() {
        this.x = getRandom(-1000, -100);
        this.row = getRandom(2, 5);
        this.speed = getRandom.apply(this, ENEMY_SPEED);
        this.sprite = 'images/enemy-bug.png';
    };
    Enemy.prototype.update = function(dt) {
        var coords = getCoords(this.row);
        if (this.x >= (CANVAS.width + 100)) {
            this.x = getRandom(-1000, -100);
            this.row = getRandom(2, 5);
        }
        this.x += dt * (this.speed * 100);
        this.y = coords.y;
    };
    Enemy.prototype.render = function() {
        CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
    //                                   GEM                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Gem = function() {
        this.row = getRandom(2, 5);
        this.column = getRandom(1, 7);
        this.sprite = 'images/Gem-Blue.png';
    };
    Gem.prototype.update = function() {
        var coords = getCoords(this.row, this.column);
        this.x = coords.x;
        this.y = coords.y;
    }
    Gem.prototype.render = function() {
        CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
    //                                  HEART                                       //
    //////////////////////////////////////////////////////////////////////////////////
    var Heart = function() {
        this.row = getRandom(2, 5);
        this.column = getRandom(1, 7);
        this.sprite = 'images/Heart.png';
    };
    Heart.prototype.update = function() {
        var coords = getCoords(this.row, this.column);
        this.x = coords.x;
        this.y = coords.y;
    };
    Heart.prototype.render = function() {
        CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
    //                                  ROCK                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Rock = function() {
        this.row = getRandom(2, 5);
        this.column = getRandom(1, 7);
        this.sprite = 'images/Rock.png';
    };
    Rock.prototype.update = function() {
        var coords = getCoords(this.row, this.column);
        this.x = coords.x;
        this.y = coords.y;
    };
    Rock.prototype.render = function() {
        CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
    //                                   MAIN                                       //
    //////////////////////////////////////////////////////////////////////////////////
    function main() {
        var now = Date.now();
        var dt = (now - LAST_TIME) / 1000.0;

        update(dt);
        render();

        if (GAME_OVER) {
            CTX.font = '48px serif';
            CTX.fillText("GAME OVER!", CANVAS.width / 2 - 150, CANVAS.height / 2);
        }
        else if (PAUSED) {
            cancelAnimationFrame(LOOP);
        }
        else {
            LAST_TIME = now;
            LOOP = requestAnimationFrame(main);
        }
    }
    //                                    INIT                                      //
    //////////////////////////////////////////////////////////////////////////////////
    function init() {
        var maxEnemies = (LEVEL > MAX_ENEMIES) ? MAX_ENEMIES : (LEVEL > 6) ? LEVEL : 6;
        range(getRandom(6, maxEnemies), function(){
            if (LEVEL === 5) {ENEMY_SPEED = [1, 4]}
            if (LEVEL === 10) {ENEMY_SPEED = [2, 5]}
            if (LEVEL === 15) {ENEMY_SPEED = [3, 6]}
            if (LEVEL === 20) {ENEMY_SPEED = [4, 7]}
            if (LEVEL === 25) {ENEMY_SPEED = [5, 8]}
            ENEMIES.push( new Enemy() );
        });
        range(getRandom(1, LEVEL), function(){
            GEMS.push( new Gem() );
        });
        if (LIVES < 3) {
            if (getRandom(1,3) === 2) {
                if (getRandom(1,5) === 3) {
                    range(2, function(){
                        HEARTS.push(new Heart());
                    });
                }
                else {
                    HEARTS.push(new Heart());
                }
            }
            else {
                if (LIVES === 1) {
                    range(getRandom(1, 2), function(){
                        HEARTS.push(new Heart());
                    });
                }
            }
        }
        else {
            if (getRandom(1, 10) === 5) {
                HEARTS.push(new Heart());
            }
        }
        if (LEVEL >= 5) {
            if (LEVEL < 15) {
                range(getRandom(0, 1), function(){
                    ROCKS.push(new Rock());
                });
            }
            else {
                range(getRandom(1, 2), function(){
                    ROCKS.push(new Rock());
                });
            }
        }
        LAST_TIME = Date.now();
        main();
    }
    //                                   NEXT LEVEL                                 //
    //////////////////////////////////////////////////////////////////////////////////
    function nextLevel() {
        document.removeEventListener('keyup', window.keyupHandler);
        pause();
        setTimeout(function(){
            reset();
            LEVEL++;
            PLAYER.backToStart();
            document.addEventListener('keyup', window.keyupHandler);
            start();
        }.bind(this), 1000);
    }
    //                                   START                                      //
    //////////////////////////////////////////////////////////////////////////////////
    function start() {
        PAUSED = false;
        init();
    }
    //                                   PAUSE                                      //
    //////////////////////////////////////////////////////////////////////////////////
    function pause() {
        PAUSED = true;
    }
    //                                   RESET                                      //
    //////////////////////////////////////////////////////////////////////////////////
    function reset() {
        ENEMIES = [];
        GEMS = [];
        ROCKS = [];
    }
    //                                   UPDATE                                     //
    //////////////////////////////////////////////////////////////////////////////////
    function update(dt) {
        updateEntities(dt);
    }
    function updateEntities(dt) {
        ROCKS.forEach(function(rock) {
            rock.update();
        });
        GEMS.forEach(function(gem) {
            gem.update();
        });
        HEARTS.forEach(function(heart){
            heart.update();
        });
        ENEMIES.forEach(function(enemy) {
            enemy.update(dt);
        });
        PLAYER.update();
    }
    //                                   RENDER                                     //
    //////////////////////////////////////////////////////////////////////////////////
    function render() {
        renderDisplay();
        renderText();
        renderEntities();
    }
    function renderDisplay() {
        for (var row = 0; row < SCREEN_ROWS; row++) {
            for (var col = 0; col < SCREEN_COLUMNS; col++) {
                CTX.drawImage(Resources.get(MAP[row]), col * TILE_WIDTH, (row * TILE_HEIGHT) - 50);
            }
        }
    }
    function renderText() {
        CTX.font = "16px serif";
        CTX.fillText("Level: " + LEVEL, 5, 20);
        CTX.fillText("Score: " + SCORE, 5, 40);
        CTX.fillText("Lives: " + LIVES, CANVAS.width - 55, 20);
    }
    function renderEntities() {
        ROCKS.forEach(function(rock) {
            rock.render();
        });
        HEARTS.forEach(function(heart) {
            heart.render();
        });
        GEMS.forEach(function(gem) {
            gem.render();
        });
        ENEMIES.forEach(function(enemy) {
            enemy.render();
        });
        PLAYER.render();
    }
    //                                 HANDLE INPUT                                 //
    //////////////////////////////////////////////////////////////////////////////////
    function handleInput(key) {
        if (key === 'up') {
            PLAYER.setLast();
            PLAYER.row--;
            if (PLAYER.atTop()) {
                nextLevel();
            }
        }
        else if (key === 'down') {
            if (PLAYER.row !== SCREEN_ROWS) {
                PLAYER.setLast();
                PLAYER.row++;
            }
        }
        else if (key === 'left') {
            if (PLAYER.column !== 1) {
                PLAYER.setLast();
                PLAYER.column--;
            }
        }
        else if (key === 'right') {
            if (PLAYER.column !== SCREEN_COLUMNS) {
                PLAYER.setLast();
                PLAYER.column++;
            }
        }
    }
    //                               HELPER FUNCTIONS                               //
    //////////////////////////////////////////////////////////////////////////////////
    function getCoords(row, column) {
        return {
            x: TILE_WIDTH * (column - 1),
            y: TILE_HEIGHT * (row - 1) - TILE_HEIGHT
        };
    }
    function touches(piece1, piece2) {
        var piece1Area = {
            x: [piece1.x, piece1.x + TILE_WIDTH],
            y: [piece1.y, piece1.y + TILE_HEIGHT]
        };
        var piece2Area = {
            x: [piece2.x, piece2.x + TILE_WIDTH],
            y: [piece2.y, piece2.y + TILE_HEIGHT]
        };
        if ( ((piece1Area.y[0] === piece2Area.y[0] && piece1Area.y[1] === piece2Area.y[1]) && (piece1Area.x[1] > piece2Area.x[0] && piece1Area.x[1] < piece2Area.x[1])) ||
             //((piece1Area.y[0] === piece2Area.y[0] && piece1Area.y[1] === piece2Area.y[1]) && (piece1Area.x[0] > piece2Area.x[0] && piece1Area.x[0] < piece2Area.x[1])) ||
             ((piece1Area.x[0] === piece2Area.x[0] && piece1Area.x[1] === piece2Area.x[1]) && (piece1Area.y[0] === piece2Area.y[0] && piece1Area.y[1] === piece2Area.y[1])) )
        {
            return true;
        }
    }
    //                               LOADING RESOURCES                              //
    //////////////////////////////////////////////////////////////////////////////////
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

}());
