cordova.define("com.tsukurusha.cordova.screenorientation.screenOrientation", function(require, exports, module) { var exec = require("cordova/exec");
module.exports = {
    set: function ScreenOrientation(str, success, fail) {
        exec(success, fail, "ScreenOrientation", "set", [str]);
    }
};

});
