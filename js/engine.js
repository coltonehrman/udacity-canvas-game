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
        this.dieSound = new Audio('sounds/splat.wav');
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
            this.dieSound.play();
            LIVES--;
            SCORE -= PENALTY;
            if (LIVES === 0) {
                GAME_OVER = true;
            }
            else {
                document.removeEventListener('keyup', keyupHandler);
                pause();
                setTimeout(function(){
                    document.addEventListener('keyup', keyupHandler);
                    restart(true);
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
        this.inMiddle = function() {
            return this.row === SCREEN_MIDDLE_ROW;
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
        this.row = getRandom.apply(this, this.area) - (DISPLAY_TOP - 1);
        this.x = (this.direction === 'right') ? getRandom(-2000, 100) : getRandom(CANVAS.width + 2000, CANVAS.width);
        this.speed = getRandom.apply(this, ENEMY_SPEED);
    };
    Enemy.prototype = Object.create(GAME_OBJECT);
    Enemy.prototype.getRow = function() {
        this.row = getRandom.apply(this, this.area) - (DISPLAY_TOP - 1);
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
        this.sound = new Audio('sounds/success.wav');
        this.taken = false;
        this.row = getRandom(2, MAP.length - 1) - (DISPLAY_TOP - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = 'images/Key.png';
        this.take = function() {
            this.taken = true;
            this.column = 0;
            this.row = 0;
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
                this.sound.play();
            }
        };
    };
    Key.prototype = Object.create(GAME_OBJECT);
    var KEY = new Key();
    //                                   GEM                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Gem = function(sprite) {
        this.sound = new Audio('sounds/ding-1.mp3');
        this.row = getRandom(2, MAP.length - 1) - (DISPLAY_TOP - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = sprite;
    };
    Gem.prototype = Object.create(GAME_OBJECT);
    Gem.prototype.update = function() {
        this.getX();
        this.getY();
        if ( this.touches(PLAYER) ) {
            this.sound.play();
            SCORE += GEM_VALUE;
            this.remove();
        }
    };
    //                                  HEART                                       //
    //////////////////////////////////////////////////////////////////////////////////
    var Heart = function() {
        this.sound = new Audio('sounds/life.wav');
        this.row = getRandom(2, MAP.length - 1) - (DISPLAY_TOP - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = 'images/Heart.png';
    };
    Heart.prototype = Object.create(GAME_OBJECT);
    Heart.prototype.update = function() {
        this.getX();
        this.getY();
        if ( this.touches(PLAYER) ) {
            this.sound.play();
            LIVES++;
            this.remove();
        }
    };
    //                                  ROCK                                        //
    //////////////////////////////////////////////////////////////////////////////////
    var Rock = function() {
        this.row = getRandom(2, MAP.length - 1) - (DISPLAY_TOP - 1);
        this.column = getRandom(1, SCREEN_COLUMNS);
        this.sprite = 'images/Rock.png';
    };
    Rock.prototype = Object.create(GAME_OBJECT);
    Rock.prototype.update = function() {
        this.getX();
        this.getY();
        if ( this.touches(PLAYER) ) {
            new Audio('sounds/hitrock.wav').play();
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
            new Audio('sounds/gameover.mp3').play();
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
        new Audio('sounds/nextlevel.wav').play();
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
        DISPLAY_TOP = MAP.length - SCREEN_ROWS + 1;
        PLAYER.backToStart();
        KEY.reset();
    }
    function restart(level) {
        if (!level) {
            ENEMY_SPEED = [1, 3];
            GAME_OVER = false;
            LIVES = 5;
            SCORE = 0;
            LEVEL = 1;
        }
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
        renderEntities();
        renderText();
    }
    function renderDisplay() {
        for (var row = (DISPLAY_TOP - 1), num = 0; num < SCREEN_ROWS + 1; row++, num++) {
            for (var col = 0; col < SCREEN_COLUMNS; col++) {
                if (MAP[row]) {
                    CTX.drawImage(Resources.get(MAP[row]), col * TILE_WIDTH, (num * TILE_HEIGHT) - 50);
                }
            }
        }
    }
    function renderText() {
        CTX.font = "20px 'Nunito'";
        CTX.fillText("Level: " + LEVEL, 10, 20);
        CTX.fillText("Score: " + SCORE, 10, 40);
        CTX.fillText("Lives: " + LIVES, CANVAS.width - 80, 20);
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
            var length = area[1] - area[0] + 1;
            var numEnemies;
            // if (LEVEL === 5) {QUANTIFIER = 2;}
            // if (LEVEL === 10) {QUANTIFIER = 3;}
            // if (LEVEL === 15) {QUANTIFIER = 4;}
            // if (LEVEL === 20) {QUANTIFIER = 5;}
            // if (LEVEL === 25) {QUANTIFIER = 6;}
            // if (LEVEL === 30) {QUANTIFIER = 7;}
            // if (LEVEL === 35) {QUANTIFIER = 8;}
            // if (LEVEL === 40) {QUANTIFIER = 9;}
            // if (LEVEL === 45) {QUANTIFIER = 10;}
            // if (LEVEL === 50) {QUANTIFIER = 11;}
            if (length === 1) {numEnemies = 1;}
            else if (length === 2) {numEnemies = 2;}
            else if (length === 3) {numEnemies = 3;}
            else if (length === 4) {numEnemies = 4;}
            else if (length === 5) {numEnemies = 5;}
            else {numEnemies = 6;}
            //numEnemies = length * QUANTIFIER;
            range(numEnemies, function(){
                var direction = (chance(50)) ? 'left' : 'right';
                ENEMIES.push( new Enemy(area, direction) );
            });
        });
    };
    //                                  MAKE GEMS                                   //
    //////////////////////////////////////////////////////////////////////////////////
    function makeGems() {
        range(getRandom(7, MAX_GEMS), function(){
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
        range(getRandom(5, 10), function(){
            ROCKS.push( new Rock() );
        });
        if ( chance(50) ) {
            range(getRandom(1, 10), function(){
                ROCKS.push( new Rock() );
            });
        }
    };
    //                                MOVE MAP UP                                   //
    //////////////////////////////////////////////////////////////////////////////////
    function moveMapUp() {
        DISPLAY_TOP--;
        ENEMIES.forEach(function(enemy){
            enemy.row++;
        });
        ROCKS.forEach(function(rock){
            rock.row++;
        });
        HEARTS.forEach(function(heart){
            heart.row++;
        });
        GEMS.forEach(function(gem){
            gem.row++;
        });
        KEY.row++;
    };
    //                               MOVE MAP DOWN                                  //
    //////////////////////////////////////////////////////////////////////////////////
    function moveMapDown() {
        DISPLAY_TOP++;
        ENEMIES.forEach(function(enemy){
            enemy.row--;
        });
        ROCKS.forEach(function(rock){
            rock.row--;
        });
        HEARTS.forEach(function(heart){
            heart.row--;
        });
        GEMS.forEach(function(gem){
            gem.row--;
        });
        KEY.row--;
    };
    //                                 HANDLE INPUT                                 //
    //////////////////////////////////////////////////////////////////////////////////
    function handleInput(key) {
        var moveBack = false;
        new Audio('sounds/move.ogg').play();
        if (key === 'up') {
            if ( (DISPLAY_TOP !== 1) && (PLAYER.inMiddle()) ) {
                moveMapUp();
                ROCKS.forEach(function(rock){
                    if (PLAYER.touches(rock)) {
                        new Audio('sounds/hitrock.wav').play();
                        moveBack = true;
                    }
                });
                (moveBack) ? moveMapDown() : '';
                moveBack = false;
            }
            else {
                PLAYER.setLast();
                PLAYER.row--;
                if (PLAYER.atTop()) {
                    if (KEY.taken) {
                        nextLevel();
                    }
                    else {
                        new Audio('sounds/fail.wav').play();
                        PLAYER.row++;
                    }
                }
            }
        }
        else if (key === 'down') {
            if ( (DISPLAY_TOP !== MAP.length - SCREEN_ROWS + 1) && (PLAYER.inMiddle()) ) {
                moveMapDown();
                KEY.update();
                GEMS.forEach(function(gem){
                    gem.update();
                });
                HEARTS.forEach(function(heart){
                    heart.update();
                });
                ROCKS.forEach(function(rock){
                    if (PLAYER.touches(rock)) {
                        new Audio('sounds/hitrock.wav').play();
                        moveBack = true;
                    }
                });
                (moveBack) ? moveMapUp() : '';
                moveBack = false;
            }
            else {
                if (PLAYER.row !== SCREEN_ROWS) {
                    PLAYER.setLast();
                    PLAYER.row++;
                }
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
