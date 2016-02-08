Function.prototype.inheritsFrom = function( parentFunctionOrObject ){
	this.prototype = ( typeof parentFunctionOrObject === 'function' ) ? Object.create(parentFunctionOrObject.prototype) : Object.create(parentFunctionOrObject);
	this.prototype.constructor = this;
	return this;
};

var Utils = function() {

    this.chance = function( percent ) {
        return Math.random() < (percent / 100);
    };

    this.getRandom = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

	this.loop = function(num, func) {
		for (var i = 0; i < num; i++) {
			func();
		}
	};

	this.inArray = function(arr, item) {
		return arr.indexOf(item) !== -1;
	};

};
var _ = new Utils();
