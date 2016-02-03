(function() {
    //                               GAME OBJECT                                    //
    //////////////////////////////////////////////////////////////////////////////////
    var GAME_OBJECT = {
        touches: function(other) {
            var touches = false;
            var myLeftSide = this.x;
            var myRightSide = this.x + TILE_WIDTH;
            var otherLeftSide = other.x;
            var otherRightSide = other.x + TILE_WIDTH - 25;

            if ( this.row === other.row ) {
                if ( this.column === other.column ) {
                    touches = true;
                }
                else if ( myLeftSide < otherRightSide && myLeftSide > otherLeftSide ) {
                    touches = true;
                }
            }
            return touches;
        },
        render: function() {
            CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
        },
        update: function() {
            var coords = getCoords(this.row, this.column);
            this.x = coords.x;
            this.y = coords.y;
        }
    };
    //                                   PLAYER                                     //
    //////////////////////////////////////////////////////////////////////////////////
    var Player = function() {
        this.lastRow = SCREEN_ROWS;
        this.lastColumn = SCREEN_MIDDLE_COLUMN;
        this.row = SCREEN_ROWS;
        this.column = SCREEN_MIDDLE_COLUMN;
        this.sprite = PLAYER_SPRITE;
        this.update = function() {
            var coords = getCoords(this.row, this.column);
            var hitRock = false;
            ROCKS.forEach(function(rock){
                if ( this.touches(rock) ) {
                    hitRock = true;
                }
            }.bind(this));

            if ( this.touches(KEY) ) {
                KEY.grab();
            }

            GEMS = GEMS.filter(function(gem) {
                if ( this.touches(gem) ) {
                    SCORE += GEM_VALUE;
                }
                return !this.touches(gem);
            }.bind(this));

            HEARTS = HEARTS.filter(function(heart) {
                if ( this.touches(heart) ) {
                    LIVES++;
                }
                return !this.touches(heart);
            }.bind(this));

            if (!hitRock) {
                this.x = coords.x;
                this.y = coords.y;

                ENEMIES.forEach(function(enemy) {
                    if ( this.touches(enemy) ) {
                        this.die();
                    }
                }.bind(this));

            }
            else {
                this.row = this.lastRow;
                this.column = this.lastColumn;
                coords = getCoords(this.row, this.column);
                this.x = coords.x;
                this.y = coords.y;
            }
        };
        this.inMiddle = function() {
            return this.row === SCREEN_MIDDLE_ROW && this.column === SCREEN_MIDDLE_COLUMN;
        };
        this.atTop = function() {
            return this.row === 1;
        };
        this.atBottom = function() {
            return this.row === SCREEN_ROWS;
        };
        this.die = function() {
            LIVES--;
            SCORE -= PENALTY;
            this.backToStart();
            if (LIVES === 0) {
                GAME_OVER = true;
            }
        };
        this.setLast = function() {
            this.lastRow = this.row;
            this.lastColumn = this.column;
        };
        this.backToStart = function() {
            this.row = SCREEN_ROWS;
            this.column = SCREEN_MIDDLE_COLUMN;
        };
    };
    Player.prototype = Object.create(GAME_OBJECT);
    var PLAYER = new Player();
    //                             KEY EVENT HANDLER                                //
    //////////////////////////////////////////////////////////////////////////////////
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            32: 'space',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        console.log(e.keyCode);
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
    Enemy.prototype = Object.create(GAME_OBJECT);
    Enemy.prototype.update = function(dt) {
        var coords = getCoords(this.row);
        if (this.x >= (CANVAS.width + 100)) {
            this.x = getRandom(-1000, -100);
            this.row = getRandom(2, 5);
        }
        this.x += dt * (this.speed * 100);
        this.y = coords.y;
    };
    //                                   KEY                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Key = function() {
        this.taken = false;
        this.row = getRandom(2, 5);
        this.column = getRandom(1, 7);
        this.sprite = 'images/Key.png';
        this.grab = function() {
            this.taken = true;
            this.column = 0;
            this.row = 0;
        };
        this.reset = function() {
            this.taken = false;
            this.row = getRandom(2, 5);
            this.column = getRandom(1, 7);
        };
    };
    Key.prototype = Object.create(GAME_OBJECT);
    var KEY = new Key();
    //                                   GEM                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Gem = function() {
        this.row = getRandom(2, 5);
        this.column = getRandom(1, 7);
        this.sprite = 'images/Gem-Blue.png';
    };
    Gem.prototype = Object.create(GAME_OBJECT);
    //                                  HEART                                       //
    //////////////////////////////////////////////////////////////////////////////////
    var Heart = function() {
        this.row = getRandom(2, 5);
        this.column = getRandom(1, 7);
        this.sprite = 'images/Heart.png';
    };
    Heart.prototype = Object.create(GAME_OBJECT);
    //                                  ROCK                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Rock = function() {
        this.row = getRandom(2, 5);
        this.column = getRandom(1, 7);
        this.sprite = 'images/Rock.png';
    };
    Rock.prototype = Object.create(GAME_OBJECT);
    //                                   MAIN                                       //
    //////////////////////////////////////////////////////////////////////////////////
    function main() {
        var now = Date.now();
        var dt = (now - LAST_TIME) / 1000.0;

        update(dt);
        render();

        if (GAME_OVER) {
            CTX.font = '48px serif';
            CTX.fillStyle = '#fff';
            CTX.lineWidth = 5;
            CTX.strokeText("GAME OVER!", CANVAS.width / 2 - 150, CANVAS.height / 2 - 48);
            CTX.strokeText("HIT 'SPACE' TO RESTART!", CANVAS.width / 2 - 300, CANVAS.height / 2);
            CTX.fillText("GAME OVER!", CANVAS.width / 2 - 150, CANVAS.height / 2 - 48);
            CTX.fillText("HIT 'SPACE' TO RESTART!", CANVAS.width / 2 - 300, CANVAS.height / 2);
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
        if (LEVEL === 5) {ENEMY_SPEED = [2, 4];}
        if (LEVEL === 10) {ENEMY_SPEED = [3, 5];}
        if (LEVEL === 15) {ENEMY_SPEED = [4, 6];}
        if (LEVEL === 20) {ENEMY_SPEED = [5, 7];}
        if (LEVEL === 25) {ENEMY_SPEED = [6, 8];}
        if (LEVEL === 30) {ENEMY_SPEED = [7, 9];}
        if (LEVEL === 35) {ENEMY_SPEED = [8, 10];}
        if (LEVEL === 40) {ENEMY_SPEED = [9, 11];}
        range(getRandom(3, 6), function(){
            ENEMIES.push( new Enemy() );
        });
        range(getRandom(0, MAX_GEMS), function(){
            GEMS.push( new Gem() );
        });
        if (LIVES < 3) {
            if (chance(50)) {
                if (chance(25)) {
                    range(2, function(){
                        HEARTS.push( new Heart() );
                    });
                }
                else {
                    HEARTS.push( new Heart() );
                }
            }
            else {
                if (LIVES === 1) {
                    range(getRandom(1, 2), function(){
                        HEARTS.push( new Heart() );
                    });
                }
            }
        }
        else {
            if (chance(10)) {
                HEARTS.push( new Heart() );
            }
        }
        if (LEVEL >= 20) {
            range(getRandom(0, 1), function(){
                ROCKS.push( new Rock() );
            });
            if (LEVEL >= 50) {
                range(getRandom(1, 2), function(){
                    ROCKS.push( new Rock() );
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
        HEARTS = [];
        KEY.reset();
    }
    function restart() {
        ENEMY_SPEED = [1, 3];
        GAME_OVER = false;
        LIVES = 5;
        SCORE = 0;
        LEVEL = 1;
        reset();
        start();
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
        KEY.update();
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
        CTX.fillStyle = '#fff';
        CTX.fillText("Level: " + LEVEL, 5, 20);
        CTX.fillText("Score: " + SCORE, 5, 40);
        CTX.fillText("Lives: " + LIVES, CANVAS.width - 55, 20);
    }
    function renderEntities() {
        GEMS.forEach(function(gem) {
            gem.render();
        });
        ROCKS.forEach(function(rock) {
            rock.render();
        });
        HEARTS.forEach(function(heart) {
            heart.render();
        });
        ENEMIES.forEach(function(enemy) {
            enemy.render();
        });
        KEY.render();
        PLAYER.render();
    }
    //                                 HANDLE INPUT                                 //
    //////////////////////////////////////////////////////////////////////////////////
    function handleInput(key) {
        if (key === 'up') {
            PLAYER.setLast();
            PLAYER.row--;
            if (PLAYER.atTop()) {
                if (KEY.taken) {
                    nextLevel();
                }
                else {
                    PLAYER.row++;
                }
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
        else if (key === 'space') {
            if (GAME_OVER) {
                restart();
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
