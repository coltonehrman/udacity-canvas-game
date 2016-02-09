(function(w){

    var GameItem = function() {
        this.TILE_WIDTH = 101;
        this.TILE_HEIGHT = 83;
        this.halfWidth = this.TILE_WIDTH / 2;
    };


    var RenderableItem = function(x, y, sprite) {
        GameItem.call(this);
        this.x = x;
        this.y = y;
        this.sprite = sprite;
    };
    RenderableItem.inheritsFrom(GameItem);
    RenderableItem.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };


    var MovableItem = function(row, column, width, sprite) {
        RenderableItem.call(this, null, null, sprite);
        this.row = this.startingRow = row;
        this.column = this.startingColumn = column;
        this.offsetY = 50;
        this.width = width;
        this.setXY();
    };
    MovableItem.inheritsFrom(RenderableItem);
    MovableItem.prototype.setX = function() {
        this.x = this.TILE_WIDTH * (this.column - 1);
    };
    MovableItem.prototype.setY = function() {
        this.y = (this.TILE_HEIGHT * (this.row - 1) - this.TILE_HEIGHT) + this.offsetY;
    };
    MovableItem.prototype.setXY = function() {
        this.setX();
        this.setY();
    };
    MovableItem.prototype._midPoint = function() {
        return this.x + (this.TILE_WIDTH / 2);
    };
    MovableItem.prototype._leftSide = function() {
        return ( this.width ) ? this._midPoint() - (this.width / 2) : this.x;
    };
    MovableItem.prototype._rightSide = function() {
        return ( this.width ) ? this._midPoint() + (this.width / 2) : this.x + this.TILE_WIDTH;
    };
    MovableItem.prototype.resetPosition = function() {
        this.row = this.startingRow;
        this.column = this.startingColumn;
        this.setXY();
    };
    MovableItem.prototype.collidesWith = function(item) {
        if ( this.row === item.row ) {
            if ( this.column === item.column ) {
                return true;
            }
            else {
                if ( item.direction === 'left' ) {
                    if ( this._rightSide() >= item._leftSide() && this._rightSide() <= item._rightSide() ) {
                        return true;
                    }
                    else if ( this._leftSide() <= item._midPoint() && this._rightSide() >= item._rightSide() ) {
                        return true;
                    }
                }
                else if ( item.direction === 'right' ) {
                    if ( this._leftSide() <= item._rightSide() && this._leftSide() >= item._leftSide() ) {
                        return true;
                    }
                    else if ( this._rightSide() >= item._midPoint() && this._leftSide() <= item._leftSide() ) {
                        return true;
                    }
                }
            }
        }
        return false;
    };


    var Player = function() {
        MovableItem.call(this, this._startRow(), this._startColumn(), this._width);
        this._setLastPosition();
        this.sound = 'sounds/move.ogg';
    };
    Player.inheritsFrom(MovableItem);
    Player.prototype._startRow = function() {
        return gameProperties.SCREEN_ROWS;
    };
    Player.prototype._startColumn = function() {
        return gameProperties.SCREEN_MIDDLE_COLUMN;
    };
    Player.prototype._width = 66;
    Player.prototype.setCharacter = function(sprite) {
        this.sprite = sprite;
    };
    Player.prototype.update = function() {
        this.setXY();
        this._checkCollectibleCollisions();
        this._checkRockCollisions();
        this._checkEnemyCollisions();
    };
    Player.prototype._setLastPosition = function() {
        this.lastRow = this.row;
        this.lastColumn = this.column;
    };
    Player.prototype._goToLastPosition = function() {
        this.row = this.lastRow;
        this.column = this.lastColumn;
    };
    Player.prototype._checkEnemyCollisions = function() {
        allEnemies.forEach(function(enemy){
            if ( this.collidesWith(enemy) ) {
                gameProperties.playerCollidedWithEnemy(this.row, this.column, enemy.points);
            }
        }.bind(this));
    };
    Player.prototype._checkCollectibleCollisions = function() {
        var collectibles = collectibleManager.currentCollectibles;
        collectibles.forEach(function(collectible, index){
            if ( this.collidesWith(collectible) ) {
                collectibleManager.currentCollectibles.splice(index, 1);
                collectible.sound.play();
                switch ( collectible.type ) {
                    case 'gem':
                        gameProperties.playerCollectedGem(this.row, this.column, collectible.points);
                        break;
                    case 'heart':
                        gameProperties.lives++;
                        break;
                    case 'key':
                        collectibleManager.keyTaken = true;
                        break;
                }
            }
        }.bind(this));
    };
    Player.prototype._checkRockCollisions = function() {
        var rocks = rockManager.currentRocks;
        rocks.forEach(function(rock){
            if ( this.collidesWith(rock) ) {
                this._goToLastPosition();
                this.setXY();
            }
        }.bind(this));
    };
    Player.prototype.handleInput = function(input) {
        switch ( input ) {
            case 'left':
                this._moveLeft();
                break;
            case 'up':
                this._moveUp();
                break;
            case 'right':
                this._moveRight();
                break;
            case 'down':
                this._moveDown();
                break;
        }
    };
    Player.prototype._reachTopRow = function() {
        return this.row - 1 === 1;
    };
    Player.prototype._moveLeft = function() {
        new Audio(this.sound).play();
        if ( this.column !== 1 ) {
            this._setLastPosition();
            this.column--;
        }
    };
    Player.prototype._moveRight = function() {
        new Audio(this.sound).play();
        if ( this.column !== gameProperties.SCREEN_COLUMNS ) {
            this._setLastPosition();
            this.column++;
        }
    };
    Player.prototype._moveDown = function() {
        new Audio(this.sound).play();
        if ( this.row !== gameProperties.SCREEN_ROWS ) {
            this._setLastPosition();
            this.row++;
        }
    };
    Player.prototype._moveUp = function() {
      console.log(this._reachTopRow());
        if ( this._reachTopRow() ) {
            if ( collectibleManager.keyTaken ) {
                this.row--;
                gameProperties.playerReachedTopRow(this.column);
            }
            else {
                new Audio(gameProperties.sounds.missingKey).play();
            }
        }
        else {
            new Audio(this.sound).play();
            this._setLastPosition();
            this.row--;
        }
    };


    var Enemy = function() {
        MovableItem.call(this, this.generateRow(), null, null);
        this._getDirection();
        this.x = this._getXPosition();
        this.setSpeed();
        this.sprite = 'images/enemy-bug-face-' + this.direction + '.png'
    };
    Enemy.inheritsFrom(MovableItem);
    Enemy.prototype.points = -100;
    Enemy.prototype.generateRow = function() { return _.getRandom(2, gameProperties.SCREEN_ROWS - 1); };
    Enemy.prototype._getXPosition = function() { return ( this.direction === 'right' ) ? _.getRandom(-1000, -100) : _.getRandom(909 + 100, 909 + 1000); };
    Enemy.prototype._getDirection = function() { this.direction = ( _.chance(50) ) ? 'right' : 'left' };
    Enemy.prototype.update = function(dt) {
        if ( this.direction === 'right' ) {
            if ( this.x > ctx.canvas.width ) {
                this.reset();
            }
            this.x += (this.speed * 100) * dt;
        }
        else if ( this.direction === 'left' ){
            if ( this.x < -101 ) {
                this.reset();
            }
            this.x -= (this.speed * 100) * dt;
        }
    };
    Enemy.prototype.reset = function() {
        this._getDirection();
        this.resetPosition();
        this.setSpeed();
        this.sprite = 'images/enemy-bug-face-' + this.direction + '.png';
    };
    Enemy.prototype.resetPosition = function() {
        this.x = this._getXPosition();
        this.row = this.generateRow();
        this.setY();
    };
    Enemy.prototype.setSpeed = function() { this.speed = _.getRandom(1, 4); };


    var Collectible = function(row, column, type, sound, points, sprite) {
        MovableItem.call(this, row, column, null, sprite);
        this.type = type;
        this.sound = sound;
        this.points = points;
    };
    Collectible.inheritsFrom(MovableItem);


    var CollectibleManager = function() {
        GameItem.call(this);
        this.keyTaken = false;
        this.gem = {
            sound: 'sounds/ding-1.mp3',
            many: [5, 10],
            kinds: [
                {sprite: 'images/Gem-Blue.png', points: 25},
                {sprite: 'images/Gem-Orange.png', points: 50},
                {sprite: 'images/Gem-Green.png', points: 75}
            ]
        };
        this.heart = {
            sound: 'sounds/life.wav',
            sprite: 'images/Heart.png'
        };
        this.key = {
            sound: 'sounds/success.wav',
            sprite: 'images/Key.png'
        };
        this.currentCollectibles = [];
        this.makeCollectibles();
    };
    CollectibleManager.inheritsFrom(GameItem);
    CollectibleManager.prototype.removeCollectibles = function () { this.currentCollectibles = []; };
    CollectibleManager.prototype.makeCollectibles = function() {
        this._makeGems();
        this._makeHearts();
        this._makeKey();
    };
    CollectibleManager.prototype._makeGems = function () {
        var gem = this.gem;
        _.loop(_.getRandom.apply(null, gem.many), function(){
            var row = this._getRow();
            var column = this._getColumn();
            var sound = new Audio(gem.sound);
            sound.volume = 0.15;
            var _kind = gem.kinds[_.getRandom(0, gem.kinds.length - 1)];
            this.currentCollectibles.push(new Collectible(row, column, 'gem', sound, _kind.points, _kind.sprite));
        }.bind(this));
    };
    CollectibleManager.prototype._makeHearts = function () {
        var row;
        var column;
        var sound;

        if ( gameProperties.lives <= 10 && _.chance(15) ) {
            row = this._getRow();
            column = this._getColumn();
            sound = new Audio(this.heart.sound);
            this.currentCollectibles.push(new Collectible(row, column, 'heart', sound, null, this.heart.sprite));
        }
        if ( gameProperties.lives === 1 && _.chance(85) ) {
            row = this._getRow();
            column = this._getColumn();
            sound = new Audio(this.heart.sound);
            this.currentCollectibles.push(new Collectible(row, column, 'heart', sound, null, this.heart.sprite));
        }
    };
    CollectibleManager.prototype._makeKey = function () {
        var row = this._getRow();
        var column = this._getColumn();
        var sound = new Audio(this.key.sound);
        this.currentCollectibles.push(new Collectible(row, column, 'key', sound, null, this.key.sprite));
    };
    CollectibleManager.prototype.dropKey = function (row, column) {
        var sound = new Audio(this.key.sound);
        this.currentCollectibles.push(new Collectible(row, column, 'key', sound, null, this.key.sprite));
        this.keyTaken = false;
    };
    CollectibleManager.prototype._getRow = function() {
        return  _.getRandom(2, gameProperties.SCREEN_ROWS - 1);
    };
    CollectibleManager.prototype._getColumn = function() {
        return  _.getRandom(1, gameProperties.SCREEN_COLUMNS);
    };
    CollectibleManager.prototype.resetCollectibles = function() {
        this.removeCollectibles();
        this.keyTaken = false;
        this.makeCollectibles();
    };


    var Rock = function(row, column) {
        MovableItem.call(this, row, column, null, 'images/Rock.png');
    };
    Rock.inheritsFrom(MovableItem);


    var RockManager = function() {
        GameItem.call(this);
        this.currentRocks = [];
        this.makeRocks();
    };
    RockManager.inheritsFrom(GameItem);
    RockManager.prototype.removeRocks = function () { this.currentRocks = []; };
    RockManager.prototype.makeRocks = function() {
        var row;
        var column;
        _.loop(_.getRandom(7, 10), function(){
            row = this._getRow();
            column = this._getColumn();
            this.currentRocks.push(new Rock(row, column));
        }.bind(this));
    };
    RockManager.prototype._getRow = function() {
        return  _.getRandom(2, gameProperties.SCREEN_ROWS - 1);
    };
    RockManager.prototype._getColumn = function() {
        return  _.getRandom(1, gameProperties.SCREEN_COLUMNS);
    };
    RockManager.prototype.resetRocks = function() {
        this.removeRocks();
        this.makeRocks();
    };


    var ShowPoints = function(row, column, points) {
        this.row = row;
        this.column = column;
        this.points = points;
        this.counter = 100;
        GameItem.call(this);
    };
    ShowPoints.inheritsFrom(GameItem);
    ShowPoints.prototype.render = function(offset) {
        ctx.font = '25px Nunito, sans-serif';
        ctx.textAlign = 'center';
        var pointsText = this.points;

        if ( this.points < 0 ) {
            ctx.fillStyle = 'red';
        }
        else {
            pointsText = '+' + this.points;
            ctx.fillStyle = 'green';
        }

        if ( this.counter > 0 ) {
            ctx.globalAlpha = this.counter / 50;
        }
        else {
            ctx.globalAlpha = 0;
        }

        var x = this.column * this.TILE_WIDTH - (this.TILE_WIDTH / 2);
        var y = (this.TILE_HEIGHT * (this.row - 1) - this.TILE_HEIGHT) + this.counter;

        if ( offset ) {
            x -= offset;
            y -= offset;
        }

        ctx.fillText(pointsText, x, y);
        ctx.globalAlpha = 1;
    };
    ShowPoints.prototype.update = function(dt) {
        this.counter -= this.counter * dt;
        if ( this.counter < 1 ) {
            this.counter = 0;
        }
    };

    var Screen = function() {
        this.globalAlpha = 1;
    };
    Screen.prototype.renderOverlay = function() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = 'black';
        ctx.fillRect(20, 75, ctx.canvas.width - 40, ctx.canvas.height - 95);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 75, ctx.canvas.width - 40, ctx.canvas.height - 95);
    };
    Screen.prototype.drawTitle = function(title, x, y) {
        ctx.textAlign = 'center';
        ctx.font = '36px Nunito, sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText(title, x + 3, y + 3);

        ctx.fillStyle = 'grey';
        ctx.fillText(title, x, y);
    };


    var PauseScreen = function() {
        this.alpha = 0.85;
    };
    PauseScreen.inheritsFrom(Screen);
    PauseScreen.prototype.render = function() {
        if ( gameProperties.pauseGame ) {
            this.renderOverlay();
            this.drawTitle('SELECT A CHARACTER', ctx.canvas.width / 2, 125);
            gameProperties.drawCharacterSelect(100, 175, 150);
        }
    };


    var GameProperties = function() {
        GameItem.call(this);

        this.SCREEN_COLUMNS = 9;
        this.SCREEN_ROWS = 7;
        this.SCREEN_MIDDLE_COLUMN = Math.ceil(this.SCREEN_COLUMNS / 2);
        this.SCREEN_MIDDLE_ROW = Math.ceil(this.SCREEN_ROWS / 2);

        this.pauseGame = true;
        this.lives = 5;
        this.currentGamePoints = 0;
        this.bestGamePoints = 0;
        this.showInfo = false;
        this.showPoints = [];
        this.canResetRocks = true;

        this.characterSelection = 0;
        this.characterImages = [
            'images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png'
        ];

        this.sounds = {
            music: new Audio('sounds/background-music.wav'),
            died: new Audio('sounds/splat.wav'),
            nextLevel: new Audio('sounds/nextlevel.wav'),
            gameOver: new Audio('sounds/gameover.mp3'),
            missingKey: 'sounds/fail.wav'
        };
        this.sounds.died.volume = 0.5;
        this.sounds.music.addEventListener('ended', function(){
            this.play();
        }, false);
    };
    GameProperties.inheritsFrom(GameItem);
    GameProperties.prototype.reset = function() {
        if ( this.currentGamePoints > this.bestGamePoints ) {
            this.bestGamePoints = this.currentGamePoints;
        }
        this.currentGamePoints = 0;
        this.lives = 5;
        this.canResetRocks = true;
        player.resetPosition();
        collectibleManager.resetCollectibles();
        rockManager.resetRocks();
    };
    GameProperties.prototype.playerReachedTopRow = function(column) {
        this.sounds.nextLevel.play();
        if ( collectibleManager.currentCollectibles.length === 0 ) {
            this.addPoints(1, column, 100);
        }
        rockManager.resetRocks();
        player.resetPosition();
        collectibleManager.resetCollectibles();
        this.canResetRocks = true;
    };
    GameProperties.prototype.playerCollidedWithEnemy = function(row, column, points) {
        this.sounds.died.play();
        this.lives--;
        this.addPoints(row, column, points);

        if ( collectibleManager.keyTaken ) {
            collectibleManager.dropKey(row, column);
        }
        player.resetPosition();
    };
    GameProperties.prototype.playerCollectedGem = function(row, column, points) {
        this.addPoints(row, column, points);
    };
    GameProperties.prototype.addPoints = function(row, column, points) {
        this.currentGamePoints += points;
        if ( this.currentGamePoints > this.bestGamePoints ) {
            this.bestGamePoints = this.currentGamePoints;
        }
        this.showPoints.push(new ShowPoints(row, column, points));
    };
    GameProperties.prototype.update = function(dt) {
        this.showPoints.forEach(function(showPoint, index){
            if ( showPoint.counter <= 0 ) {
                this.showPoints.splice(index, 1);
            }
            showPoint.update(dt);
        }.bind(this));
        if ( this.pauseGame ) {
            //this.sounds.music.pause();
            player.setCharacter(this.getSelectedCharacter());
        }
        else {
            //this.sounds.music.play();
        }
        if ( this.lives === 0 ) {
            this.sounds.gameOver.play();
            this.reset();
            this.pauseGame = true;
        }
    };
    GameProperties.prototype.render = function() {
        this._renderNewPoints();
        this._renderGamePoints();
        this._renderLives();
        this._renderKey();
    };
    GameProperties.prototype._renderNewPoints = function() {
        var OFFSET_INCREMENT = 30;
        var offset = OFFSET_INCREMENT;
        var lastColumn;
        var lastRow;

        this.showPoints.forEach(function(showPoint){
            if ( lastRow === showPoint.row && lastColumn == showPoint.column ) {
                showPoint.render(offset);
                offset += OFFSET_INCREMENT;
            }
            else {
                offset = OFFSET_INCREMENT;
                showPoint.render();
            }
            lastColumn = showPoint.column;
            lastRow = showPoint.row;
        });
    };
    GameProperties.prototype._renderGamePoints = function() {
        var yCoordinate = 40;
        var canvasMiddle = ctx.canvas.width / 2;

        ctx.fillStyle = 'white';
        ctx.font = '26px Nunito, sans-serif';

        ctx.textAlign = 'center';
        ctx.fillText(this.currentGamePoints + ' pts', ctx.measureText(this.currentGamePoints + ' pts').width - 25, yCoordinate);

        ctx.fillText(this.bestGamePoints + ' pts', canvasMiddle, yCoordinate);
        ctx.font = '10px Nunito, sans-serif';
        ctx.fillText('High Score', canvasMiddle, 15);
    };
    GameProperties.prototype._renderLives = function() {
        var xCoordinate = ctx.canvas.width - 75;
        var heart = Resources.get('images/Heart.png');

        _.loop(this.lives, function(){
            ctx.drawImage(heart, xCoordinate, 10, 30, 45);
            xCoordinate -= 25;
        });
    };
    GameProperties.prototype._renderKey = function() {
        var xCoordinate = ctx.canvas.width - 35;
        var key = Resources.get('images/Key.png');

        if ( collectibleManager.keyTaken ) {
            ctx.drawImage(key, xCoordinate, 5, 30, 50);
        }
    };
    GameProperties.prototype.drawCharacterSelect = function(x, y, spacingInterval) {
        ctx.drawImage(Resources.get('images/Selector.png'), this.characterSelection * spacingInterval + x, y);

        this.characterImages.forEach(function(characterImage, index){
            ctx.drawImage(Resources.get(characterImage), index * spacingInterval + x, y);
        });
    };
    GameProperties.prototype.getSelectedCharacter = function() {
        return this.characterImages[this.characterSelection];
    };
    GameProperties.prototype.handleInput = function(input) {
        switch ( input ) {
            case 'left':
                if ( this.characterSelection > 0 ) {
                    this.characterSelection--;
                }
                break;
            case 'right':
                if ( this.characterSelection < this.characterImages.length - 1 ) {
                    this.characterSelection++;
                }
                break;
            case 'one':
                if ( this.canResetRocks && player.row === this.SCREEN_ROWS )
                    rockManager.resetRocks();
                    this.canResetRocks = false;
                break;

        }
    };

    w.gameProperties = new GameProperties();

    w.pauseScreen = new PauseScreen();

    w.player = new Player();

    w.allEnemies = [
      new Enemy(),
      new Enemy(),
      new Enemy(),
      new Enemy(),
      new Enemy(),
      new Enemy()
    ];

    w.collectibleManager = new CollectibleManager();

    w.rockManager = new RockManager();

    document.addEventListener('keyup', function(e){
        var escapeKey = 27;
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            49: 'one',
            50: 'two',
            51: 'three'
        };
        gameProperties.pauseGame = ( e.keyCode === escapeKey ) ? !gameProperties.pauseGame : gameProperties.pauseGame;
        ( gameProperties.pauseGame ) ? gameProperties.handleInput(allowedKeys[e.keyCode]) : player.handleInput(allowedKeys[e.keyCode]);
    });

}(window));
