(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var _, lodash;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/stevezhu_lodash/server.js                                //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
_ = lodash = Npm.require('lodash');

///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("stevezhu:lodash", {
  lodash: lodash,
  _: _
});

})();
