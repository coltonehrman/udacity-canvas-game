Function.prototype.inheritsFrom = function( parentFunctionOrObject ){
	this.prototype = ( typeof parentFunctionOrObject === 'function' ) ? Object.create(parentFunctionOrObject.prototype) : Object.create(parentFunctionOrObject);
	this.prototype.constructor = this;
	return this;
};

var Utils = function() {

    this.chance = function( percent ) {
        return Math.random() < (percent / 100);
    };

    this.getRandom = function() {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

};
var _ = new Utils();
