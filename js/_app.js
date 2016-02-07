(function(w){

    var GameItem = function() {
        this.TILE_WIDTH = 101;
        this.TILE_HEIGHT = 83;
        this.atTop: function() {
            return this.row === 1;
        },
        render: function() {
            CTX.drawImage(Resources.get(this.sprite), this.x, this.y);
        },
        update: function() {
            this.getX();
            this.getY();
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


            return touches;
        }
    };

    var RenderableItem = function(x, y, sprite) {
        GameItem.call(this);
        this.x = x;
        this.y = y;
        this.sprite = sprite || 'images/blank-tile.png';
    };
    RenderableItem.inheritsFrom(GameItem);


    var MovableItem = function(row, column, sprite) {
        this.startingRow = row;
        this.startingColumn = column;
        this.halfWidth = this.TILE_WIDTH / 2;

        this.row = row;
        this.column = column;
        this.setX();
        this.setY();

        RenderableItem.call(this, this.x, this.y, sprite);
    };
    MovableItem.inheritsFrom(RenderableItem);
    MovableItem.prototype.setX = function() { this.x = this.TILE_WIDTH * (this.column - 1); };
    MovableItem.prototype.setY = function() { this.y = this.TILE_HEIGHT * (this.row - 1) - TILE_HEIGHT; };
    MovableItem.prototype.midPoint = function() { return this.x + (this.TILE_WIDTH / 2); };
    MovableItem.prototype.leftSide = function() { return this.midPoint() - this.halfWidth; };
    MovableItem.prototype.rightSide = function() { return this.midPoint() + this.halfWidth; };
    MovableItem.prototype.onColumn = function() { return ( this.x !== 0 ) ? Math.floor(this.x / this.HORIZONTAL_TILE_WIDTH) : return 0; };
    MovableItem.prototype.resetPosition = function() {
        this.row = this.startingRow;
        this.column = this.startingColumn;
    };
    MovableItem.prototype.collidesWith = function(item) {
        if ( this.row === item.row ) {
            if ( this.column === other.column ) {
                return true;
            }
            else {
                if ( item.direction === 'left') {
                    if ( this.rightSide() > item.leftSide() && this.rightSide() < item.rightSide() ) {
                        return true;
                    }
                    else if ( this.leftSide() <= item.leftSide() + 20 && this.rightSide() >= item.rightSide() ) {
                        return true;
                    }
                }
                else {
                    if ( this.leftSide() < item.rightSide() && this.leftSide() > item.leftSide() ) {
                        return true;
                    }
                    else if ( this.rightSide() >= item.rightSide() - 20 && this.leftSide() <= item.leftSide() ) {
                        return true;
                    }
                }
            }
            return false;
        }
    };


    var Player = function() {
        MovableItem.call(this, 7, 4);
    };
    Player.inheritsFrom(MovableItem);
    Player.prototype.setCharacter = function(sprite) { this.sprite = sprite; };
    Player.prototype.update = function() {
        this._checkEnemyCollisions();
        this._checkCollectibleCollisions();
        this._checkPlayerLocation();
    };
    Player.prototype._checkEnemyCollisions = function() {
        allEnemies.forEach(function(enemy){
            if ( enemy.collidesWith(this) ) {
                gameProperties.playerCollidedWithEnemy();
            }
        }.bind(this));
    };
    Player.prototype._checkCollectibleCollisions = function () {
        var collectibles = collectibleManager.currentCollectibles;
        collectibles.forEach(function(collectible){
            if ( collectible.collidesWith(this) ) {
                gameProperties.playerCollectedItem(this.row, this.column, collectible.points);
                collectibleManager.resetCollectible();
            }
        }.bind(this));
    };
    Player.prototype.handleInput = function(input) {
        switch (input) {
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
    Player.prototype._hasReachedTopRow = function() { return this.row === 1; };
    Player.prototype._moveLeft = function() { this.column = ( this.column !== 1 ) ? this.column - 1 : this.column; };
    Player.prototype._moveRight = function() { this.column = ( this.column !== 7 ) ? this.column + 1 : this.column; };
    Player.prototype._moveDown = function() { this.row = ( this.row !== 7 ) ? this.row + 1 : this.row; };
    Player.prototype._moveUp = function() {
        if ( this._hasReachedTopRow() ) {
            gameProperties.playerReachedTopRow(this.column);
            this.resetPosition();
        }
        else {
            this.row--;
        }
    };

    var Collectible = function(row, column, type, sprite) {
        MovableItem.call(this, row, column, sprite);
        this.sprite = sprite;
        this.points = points;
    };
    Collectible.inheritsFrom(MovableItem);


    var CollectibleManager = function(usableGameRows, usableGameColumns) {
        GameItem.call(this);

        this.rows = usableGameRows;
        this.columns = usableGameColumns;

        this.availableCollectibles = [
            {sprite: 'images/gem-blue.png', points: 25},
            {sprite: 'images/gem-orange.png', points: 50},
            {sprite: 'images/gem-green.png', points: 75}
        ];

        this.currentCollectibles = [];
    };
    CollectibleManager.inheritsFrom(GameItem);
    CollectibleManager.prototype.resetCollectible = function() {
        var collectibleSelection = Math.floor(Math.random() * this.availableCollectibles.length);
        var sprite = this.availableCollectibles[collectibleSelection].sprite;
        var points = this.availableCollectibles[collectibleSelection].points;
        var x = Math.floor(Math.random() * this.columns) * this.HORIZONTAL_TILE_WIDTH;
        var y = (Math.floor(Math.random() * this.rows) + 1) * this.VISIBLE_VERTICAL_TILE_HEIGHT;

        if(this.currentCollectibles.length != 0) {
           this.currentCollectibles.pop();
        }
        this.currentCollectibles.push(new Collectible(x, y, points, sprite));
    };

    /**
     * If there is no collectible in the array and the collectibles mode is on create a new collectible.
     */
    CollectibleManager.prototype.update = function() {
        if(gameProperties.collectiblesOn && this.currentCollectibles.length == 0) {
            this.resetCollectible();
        }
    };

    /**
     * Remove any collectibles in the collectibles array.
     */
    CollectibleManager.prototype.removeCollectibles = function () {
        this.currentCollectibles = [];
    };


}(window));
