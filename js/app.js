//                                  GLOBALS                                     //
//////////////////////////////////////////////////////////////////////////////////
var TILE_FULL_HEIGHT = 171;
var TILE_HEIGHT = 83;
var TILE_WIDTH = 101;

var CANVAS;
var SCREEN_COLUMNS = 9;
var SCREEN_MIDDLE_COLUMN = 5;
var SCREEN_ROWS = 9;
var SCREEN_MIDDLE_ROW = 5;

var GAME_OBJECTS = [];
var ENEMIES = [];
var ROCKS = [];
var GEMS = [];
var HEARTS = [];

var ENEMY_SPEED = [1, 3];
var MAX_GEMS = 10;

var LEVEL = 1;
var SCORE = 0;
var LIVES = 5;
var GEM_VALUE = 1000;
var PENALTY = 500;

var LOOP;
var LAST_TIME;
var PAUSED = false;
var GAME_OVER = false;

var WATER = 'images/water-block.png';
var STONE = 'images/stone-block.png';
var GRASS = 'images/grass-block.png';

var PLAYER_SPRITE = 'images/char-boy.png';
var CAT_GIRL = 'images/char-cat-girl.png';
var HORN_GIRL = 'images/char-horn-girl.png';
var PINK_GIRL = 'images/char-pink-girl.png';
var PRINCESS_GIRL = 'images/char-princess-girl.png';

var GEM_SPRITES = [
    'images/Gem-Blue.png',
    'images/Gem-Orange.png',
    'images/Gem-Green.png'
];
//                                    MAP                                       //
//////////////////////////////////////////////////////////////////////////////////
var MAP = [
    WATER,
    STONE,
    STONE,
    STONE,
    GRASS,
    STONE,
    STONE,
    STONE,
    GRASS
];
var STONE_AREAS = [[2,4],[6,8]];
//                                   CANVAS                                     //
//////////////////////////////////////////////////////////////////////////////////
var CANVAS = document.createElement('canvas');
var CTX = CANVAS.getContext('2d');

CANVAS.width = TILE_WIDTH * SCREEN_COLUMNS;
CANVAS.height = TILE_FULL_HEIGHT - TILE_HEIGHT + (TILE_HEIGHT * SCREEN_ROWS) - 50;
document.body.appendChild(CANVAS);
