(function() {
    //                               GAME OBJECT                                    //
    //////////////////////////////////////////////////////////////////////////////////
    var GAME_OBJECT = {
        atTop: function() {
            return this.row === 1;
        },
        render: function() {
            CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
        },
        update: function() {
            this.getX();
            this.getY();
        },
        getX: function() {
            this.x = TILE_WIDTH * (this.column - 1);
        },
        getY: function(x, y) {
            this.y = TILE_HEIGHT * (this.row - 1) - TILE_HEIGHT;
        },
        remove: function() {
            this.row = 0;
            this.column = 0;
            this.getX();
            this.getY();
        },
        touches: function(other) {
            var touches = false;
            var myLeftSide = this.x;
            var myRightSide = this.x + TILE_WIDTH;
            var otherLeftSide = other.x + 20;
            var otherRightSide = other.x + TILE_WIDTH - 20;

            if ( this.row === other.row ) {
                if ( this.column === other.column ) {
                    touches = true;
                }
                else {
                    if ( other.direction === 'left') {
                        if ( myRightSide > otherLeftSide && myRightSide < otherRightSide ) {
                            touches = true;
                        }
                        else if ( myLeftSide <= otherLeftSide + 20 && myRightSide >= otherRightSide) {
                            touches = true;
                        }
                    }
                    else {
                        if ( myLeftSide < otherRightSide && myLeftSide > otherLeftSide ) {
                            touches = true;
                        }
                        else if ( myRightSide >= otherRightSide - 20 && myLeftSide <= otherLeftSide) {
                            touches = true;
                        }
                    }
                }
            }
            return touches;
        }
    };
    //                                   PLAYER                                     //
    //////////////////////////////////////////////////////////////////////////////////
    var Player = function() {
        this.lastRow;
        this.lastColumn;
        this.row = SCREEN_ROWS;
        this.column = SCREEN_MIDDLE_COLUMN;
        this.sprite = PLAYER_SPRITE;
        this.update = function() {
            this.getX();
            this.getY();
            ENEMIES.forEach(function(enemy) {
                var touchesRock = false;
                if ( this.touches(enemy) ) {
                    ROCKS.forEach(function(rock){
                        if ( this.touches(rock) ) {
                            touchesRock = true;
                        }
                    }.bind(this));
                    if ( !touchesRock ) {
                        this.die();
                    }
                }
            }.bind(this));
        };
        this.die = function() {
            LIVES--;
            SCORE -= PENALTY;
            if (KEY.taken) {
                KEY.drop();
            }
            PLAYER.backToStart();
            if (LIVES === 0) {
                GAME_OVER = true;
            }
            else {
                document.removeEventListener('keyup', keyupHandler);
                pause();
                setTimeout(function(){
                    document.addEventListener('keyup', keyupHandler);
                    PAUSED = false;
                    main();
                }.bind(this), 1000);
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
    //                                   ENEMY                                      //
    //////////////////////////////////////////////////////////////////////////////////
    var Enemy = function(area, direction) {
        this.area = area;
        this.direction = direction;
        this.sprite = (this.direction === 'right') ? 'images/enemy-bug-face-right.png' : 'images/enemy-bug-face-left.png';
        this.row = getRandom.apply(this, this.area);
        this.x = (this.direction === 'right') ? getRandom(-2000, 100) : getRandom(CANVAS.width + 2000, CANVAS.width);
        this.speed = getRandom.apply(this, ENEMY_SPEED);
    };
    Enemy.prototype = Object.create(GAME_OBJECT);
    Enemy.prototype.getRow = function() {
        this.row = getRandom.apply(this, this.area);
    };
    Enemy.prototype.update = function(dt) {
        if (this.direction === 'right') {
            if (this.x >= (CANVAS.width)) {
                this.x = getRandom(-2000, -100);
                this.getRow();
            }
            this.x += dt * (this.speed * 100);
        }
        else {
            if (this.x <= -100) {
                this.x = getRandom(CANVAS.width + 2000, CANVAS.width);
                this.getRow();
            }
            this.x -= dt * (this.speed * 100);
        }
        this.getY();
    };
    //                                   KEY                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Key = function() {
        this.taken = false;
        this.row = getRandom(2, SCREEN_ROWS - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = 'images/Key.png';
        this.take = function() {
            this.taken = true;
            this.column = 0;
            this.row = 0;
        };
        this.drop = function() {
            this.taken = false;
            this.row = PLAYER.row;
            this.column = PLAYER.column;
        };
        this.reset = function() {
            this.taken = false;
            this.row = getRandom(2, SCREEN_ROWS - 1);
            this.column = getRandom(1, SCREEN_COLUMNS);
        };
        this.update = function() {
            this.getX();
            this.getY();
            if ( this.touches(PLAYER) ) {
                this.take();
            }
        };
    };
    Key.prototype = Object.create(GAME_OBJECT);
    var KEY = new Key();
    //                                   GEM                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Gem = function(sprite) {
        this.row = getRandom(2, SCREEN_ROWS - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = sprite;
    };
    Gem.prototype = Object.create(GAME_OBJECT);
    Gem.prototype.update = function() {
        this.getX();
        this.getY();
        if ( this.touches(PLAYER) ) {
            SCORE += GEM_VALUE;
            this.remove();
        }
    };
    //                                  HEART                                       //
    //////////////////////////////////////////////////////////////////////////////////
    var Heart = function() {
        this.row = getRandom(2, SCREEN_ROWS - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = 'images/Heart.png';
    };
    Heart.prototype = Object.create(GAME_OBJECT);
    Heart.prototype.update = function() {
        this.getX();
        this.getY();
        if ( this.touches(PLAYER) ) {
            LIVES++;
            this.remove();
        }
    };
    //                                  ROCK                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Rock = function() {
        this.row = getRandom(2, SCREEN_ROWS - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = 'images/Rock.png';
    };
    Rock.prototype = Object.create(GAME_OBJECT);
    Rock.prototype.update = function() {
        this.getX();
        this.getY();
        if ( this.touches(PLAYER) ) {
            PLAYER.row = PLAYER.lastRow;
            PLAYER.column = PLAYER.lastColumn;
            PLAYER.update();
        }
    };
    //                                    INIT                                      //
    //////////////////////////////////////////////////////////////////////////////////
    function init() {
        LAST_TIME = Date.now();
        makeEnemies();
        makeGems();
        makeHearts();
        makeRocks();
        main();
    }
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
    //                                   NEXT LEVEL                                 //
    //////////////////////////////////////////////////////////////////////////////////
    function nextLevel() {
        document.removeEventListener('keyup', keyupHandler);
        pause();
        setTimeout(function(){
            reset();
            LEVEL++;
            PLAYER.backToStart();
            document.addEventListener('keyup', keyupHandler);
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
        PLAYER.backToStart();
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
        PLAYER.update();
        KEY.update();
        ENEMIES.forEach(function(enemy) {
            enemy.update(dt);
        });
        GEMS.forEach(function(gem) {
            gem.update();
        });
        HEARTS.forEach(function(heart){
            heart.update();
        });
        ROCKS.forEach(function(rock) {
            rock.update();
        });
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
    //                                 MAKE ENEMIES                                 //
    //////////////////////////////////////////////////////////////////////////////////
    function makeEnemies() {
        if (LEVEL === 5) {ENEMY_SPEED = [2,4];}
        if (LEVEL === 10) {ENEMY_SPEED = [3,5];}
        if (LEVEL === 15) {ENEMY_SPEED = [4,6];}
        if (LEVEL === 20) {ENEMY_SPEED = [5,7];}
        if (LEVEL === 25) {ENEMY_SPEED = [6,8];}
        if (LEVEL === 30) {ENEMY_SPEED = [7,9];}
        if (LEVEL === 35) {ENEMY_SPEED = [8,10];}
        if (LEVEL === 40) {ENEMY_SPEED = [9,11];}
        if (LEVEL === 45) {ENEMY_SPEED = [10,12];}
        if (LEVEL === 50) {ENEMY_SPEED = [11,13];}
        STONE_AREAS.forEach(function(area){
            range(8, function(){
                var direction = (chance(50)) ? 'left' : 'right';
                ENEMIES.push( new Enemy(area, direction) );
            });
        });
    };
    //                                  MAKE GEMS                                   //
    //////////////////////////////////////////////////////////////////////////////////
    function makeGems() {
        range(getRandom(2, MAX_GEMS), function(){
            GEMS.push( new Gem( GEM_SPRITES[getRandom(0, 2)] ) );
        });
    };
    //                                MAKE HEARTS                                   //
    //////////////////////////////////////////////////////////////////////////////////
    function makeHearts() {
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
    };
    //                                MAKE ROCKS                                    //
    //////////////////////////////////////////////////////////////////////////////////
    function makeRocks() {
        range(getRandom(3, 5), function(){
            ROCKS.push( new Rock() );
        });
        if ( chance(50) ) {
            range(getRandom(2, 5), function(){
                ROCKS.push( new Rock() );
            });
        }
    };
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
    //                             KEY EVENT HANDLER                                //
    //////////////////////////////////////////////////////////////////////////////////
    document.addEventListener('keyup', keyupHandler);
    function keyupHandler(e) {
        var allowedKeys = {
            32: 'space',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        handleInput(allowedKeys[e.keyCode]);
    };
    //                               LOADING RESOURCES                              //
    //////////////////////////////////////////////////////////////////////////////////
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
