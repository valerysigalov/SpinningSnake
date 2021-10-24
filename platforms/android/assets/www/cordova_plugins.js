cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-game/www/game.js",
        "id": "cordova-plugin-game.game",
        "clobbers": [
            "window.game"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.splashscreen/www/splashscreen.js",
        "id": "org.apache.cordova.splashscreen.SplashScreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/com.tsukurusha.cordova.screenorientation/www/ScreenOrientation.js",
        "id": "com.tsukurusha.cordova.screenorientation.screenOrientation",
        "merges": [
            "navigator.screenOrientation"
        ]
    },
    {
        "file": "plugins/cordova-plugin-nativeaudio/www/nativeaudio.js",
        "id": "cordova-plugin-nativeaudio.nativeaudio",
        "clobbers": [
            "window.plugins.NativeAudio"
        ]
    },
    {
        "file": "plugins/cordova-plugin-network-information/www/network.js",
        "id": "cordova-plugin-network-information.network",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "file": "plugins/cordova-plugin-network-information/www/Connection.js",
        "id": "cordova-plugin-network-information.Connection",
        "clobbers": [
            "Connection"
        ]
    },
    {
        "file": "plugins/cordova-plugin-admobpro/www/AdMob.js",
        "id": "cordova-plugin-admobpro.AdMob",
        "clobbers": [
            "window.AdMob"
        ]
    },
    {
        "file": "plugins/cordova-plugin-appavailability/www/AppAvailability.js",
        "id": "cordova-plugin-appavailability.AppAvailability",
        "clobbers": [
            "appAvailability"
        ]
    },
    {
        "file": "plugins/cordova-plugin-facebookads/www/FacebookAds.js",
        "id": "cordova-plugin-facebookads.FacebookAds",
        "clobbers": [
            "window.FacebookAds"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.0.0",
    "cordova-plugin-game": "1.0.105",
    "org.apache.cordova.device": "0.3.0",
    "org.apache.cordova.splashscreen": "1.0.0",
    "com.tsukurusha.cordova.screenorientation": "0.2.1",
    "cordova-plugin-nativeaudio": "3.0.6",
    "cordova-plugin-network-information": "1.1.0",
    "cordova-plugin-admobpro": "2.10.0",
    "cordova-plugin-admob-facebook": "1.0.3",
    "cordova-plugin-appavailability": "0.4.2",
    "com.google.playservices": "21.0.0",
    "android.support.v4": "1.0.0",
    "cordova-plugin-extension": "1.2.3",
    "cordova-facebook-audnet-sdk": "4.7.0",
    "cordova-plugin-facebookads": "4.7.4"
}
// BOTTOM OF METADATA
});