var sum = function() {
  var result = 0;
  for (var i = 0; i < arguments.length; i++){
    result += arguments[i];
  }
  return result;
}

Function.prototype.mybind = function(obj) {
  var fbind = this;
  var aArgs = [].slice.call(arguments).slice(1);
  console.log(obj)
  var boundFunc = function(object, args) {
    console.log(object);
    fbind.apply(object, args);
  };
  console.log(boundFunc(obj, aArgs))
  return boundFunc(obj, aArgs);
};

var cat = {
  names: ["a", "b", "c"]
};

var dog = {
  names: ["x", "e", "q"],

  getNames: function(index1, index2, index3) {
    return this.names[index1] + this.names[index2] + this.names[index3];
  }
};
//console.log(dog.getNames(0,1,2));

var catNames = dog.getNames.mybind(cat, 0, 1);
//console.log(cat.names)
console.log(catNames());
//console.log(catNames(2))