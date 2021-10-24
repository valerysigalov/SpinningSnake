"use strict";

var constants = constants || {};

constants.PLATFORM = "replace";

constants.CONTROL = "replace";

if (constants.PLATFORM === "ios") {

	  constants.LEAD_FASTEST_SNAKE_KILLER = '1';
	  constants.LEAD_GAME_PROGRESS = '3';

	  constants.ACH_TRAINEE_SNAKE_KILLER = '0';
	  constants.ACH_NEWBIE_SNAKE_KILLER = '1';
	  constants.ACH_CASUAL_SNAKE_KILLER = '2';
	  constants.ACH_INTERMEDIATE_SNAKE_KILLER = '3';
	  constants.ACH_ADVANCED_SNAKE_KILLER = '4';
	  constants.ACH_PROFESSIONAL_SNAKE_KILLER = '5';
	  constants.ACH_INSANE_SNAKE_KILLER = '6';

    constants.BANNER = 'ca-app-pub-1596102340669672/3540833542';
    constants.FULL_BANNER = 'ca-app-pub-1596102340669672/5017566745';
    constants.INTERSTITIAL_ON_PAUSE = 'ca-app-pub-1596102340669672/5560793541';
    constants.MEDIUM_RECTANGLE = 'ca-app-pub-1596102340669672/7037526745';
    constants.SMART_BANNER = 'ca-app-pub-1596102340669672/9990993140';

    constants.LINK = "";

} else {

    if (constants.CONTROL === "swipe") {
        constants.ANDROID_CLIENT_ID = '551276867161';
        constants.LEAD_FASTEST_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQFQ';
        constants.LEAD_GAME_PROGRESS = 'CgkI2dyl1YUQEAIQHw';
        constants.LINK = "<br><br><a href=https://goo.gl/y206Ap style=\"color:#ea4335\">Check out video tutorial</a>";
        constants.BANNER = 'ca-app-pub-1596102340669672/2153139142';
        constants.FULL_BANNER = 'ca-app-pub-1596102340669672/1140737543';
        constants.INTERSTITIAL_ON_PAUSE = 'ca-app-pub-1596102340669672/4429267948';
        constants.MEDIUM_RECTANGLE = 'ca-app-pub-1596102340669672/9343818743';
        constants.SMART_BANNER = 'ca-app-pub-1596102340669672/5106605542';
    } else {
        constants.ANDROID_CLIENT_ID = '801660478213';
        constants.LEAD_FASTEST_SNAKE_KILLER = 'CgkIhcbAtaoXEAIQAA';
        constants.LEAD_GAME_PROGRESS = 'CgkIhcbAtaoXEAIQAQ';
        constants.LINK = "<br><br><a href=https://goo.gl/JPuIO4 style=\"color:#ea4335\">Check out video tutorial</a>";
        constants.BANNER = 'ca-app-pub-1596102340669672/5670357149';
        constants.FULL_BANNER = 'ca-app-pub-1596102340669672/7147090340';
        constants.INTERSTITIAL_ON_PAUSE = 'ca-app-pub-1596102340669672/4054023145';
        constants.MEDIUM_RECTANGLE = 'ca-app-pub-1596102340669672/8623823541';
        constants.SMART_BANNER = 'ca-app-pub-1596102340669672/1100556747';
    }

	  constants.ACH_TRAINEE_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQGA';
	  constants.ACH_NEWBIE_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQGQ';
	  constants.ACH_CASUAL_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQGg';
	  constants.ACH_INTERMEDIATE_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQGw';
	  constants.ACH_ADVANCED_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQHA';
	  constants.ACH_PROFESSIONAL_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQHQ';
	  constants.ACH_INSANE_SNAKE_KILLER = 'CgkI2dyl1YUQEAIQHg';
}

constants.BANNER_WIDTH = 300;
constants.BANNER_HEIGHT = 250;
constants.IMAGE_WIDTH = 180;
constants.IMAGE_HEIGHT = 180;
constants.TEXT_WIDTH = 300;
constants.TEXT_HEIGHT = 50;

constants.SHOW_BANNER = 5;
constants.BANNER_STEP = 10;

constants.AUDIO_FORMAT = '.wav';

constants.START_FOOD = 4;
constants.NEWBIE_FOOD = 0;
constants.CASUAL_FOOD = 1;
constants.INTERMEDIATE_FOOD = 2;
constants.ADVANCED_FOOD = 3;
constants.PROFESSIONAL_FOOD = 4;

constants.INSTR_TIME = 120;
constants.NEWBIE_TIME = 92;
constants.CASUAL_TIME = 60;
constants.INTERMEDIATE_TIME = 36;
constants.ADVANCED_TIME = 20;
constants.PROFESSIONAL_TIME = 12;

constants.NEWBIE_STEP = 4;
constants.CASUAL_STEP = 3;
constants.INTERMEDIATE_STEP = 2;
constants.ADVANCED_STEP = 1;
constants.PROFESSIONAL_STEP = 0;

constants.NEWBIE_SPEED = 320;
constants.CASUAL_SPEED = 280;
constants.INTERMEDIATE_SPEED = 240;
constants.ADVANCED_SPEED = 200;
constants.PROFESSIONAL_SPEED = 160;

constants.NEWBIE_LEVEL = 1;
constants.CASUAL_LEVEL = 9;
constants.INTERMEDIATE_LEVEL = 17;
constants.ADVANCED_LEVEL = 25;
constants.PROFESSIONAL_LEVEL = 33;
constants.FUTURE_LEVEL = 41;
constants.LEVEL_STEPS = 8;

constants.START_ROW = 7;

constants.ACH_SHOW  = 1;
constants.LEAD_SHOW = 2;

constants.RECORD = ". Fantastic!<br>New record!";
constants.LOCAL_RECORD = ". Fantastic!<br>New local record!";
constants.BEST = ". Well done!<br>Your record is ";
constants.LOSE = "Time is up!<br>Try again! You can do it!";
constants.EXIT = "Need a little break?<br>Tap back again to exit.";
constants.LEVEL = "Level ";
constants.TIME = " sec";
constants.TRAINING = "Training";
constants.TRAINING_COMP = "Congratulations!<br>Training completed!";
constants.EAT_YELLOW = "Eat YELLOW food";
constants.EAT_GREEN = "Eat GREEN food";
constants.EAT_RED = "Eat RED food";
constants.EAT_BLUE = "Eat BLUE food";
if (constants.CONTROL === "swipe") {
    constants.NAME = "<h2>Kill The Snake</h2>";
    constants.HELP = "SWIPE here to turn";
    constants.INSTR_RED = "Operate snake using <a style=\"color:#ea4335\">SWIPES</a><br><br>Match <a style=\"color:#ea4335\">FOOD</a> to <a style=\"color:#ea4335\">HEAD</a> color";
    constants.INSTR_BLUE = "Operate snake using <a style=\"color:#4285f4\">SWIPES</a><br><br>Match <a style=\"color:#4285f4\">FOOD</a> to <a style=\"color:#4285f4\">HEAD</a> color";
    constants.INSTR_GREEN = "Operate snake using <a style=\"color:#34a853\">SWIPES</a><br><br>Match <a style=\"color:#34a853\">FOOD</a> to <a style=\"color:#34a853\">HEAD</a> color";
    constants.INSTR_YELLOW = "Operate snake using <a style=\"color:#fbbc05\">SWIPES</a><br><br>Match <a style=\"color:#fbbc05\">FOOD</a> to <a style=\"color:#fbbc05\">HEAD</a> color";
    constants.AD_IMAGE = "red_left.svg";
    constants.AD_TEXT = "Got TAPS?<br>Try <a style=\"color:#ea4335\">Spinning Snake</a>";
    constants.AD_URL = "https://goo.gl/Fo3Ozz";
    constants.PKG_NAME = "com.game.spinningsnake";
} else {
    constants.NAME = "<h2>Spinning Snake</h2>";
    constants.HELP = "TAP here to turn";
    constants.INSTR_RED = "Operate snake using <a style=\"color:#ea4335\">TAPS</a><br><br>Match <a style=\"color:#ea4335\">FOOD</a> to <a style=\"color:#ea4335\">HEAD</a> color";
    constants.INSTR_BLUE = "Operate snake using <a style=\"color:#4285f4\">TAPS</a><br><br>Match <a style=\"color:#4285f4\">FOOD</a> to <a style=\"color:#4285f4\">HEAD</a> color";
    constants.INSTR_GREEN = "Operate snake using <a style=\"color:#34a853\">TAPS</a><br><br>Match <a style=\"color:#34a853\">FOOD</a> to <a style=\"color:#34a853\">HEAD</a> color";
    constants.INSTR_YELLOW = "Operate snake using <a style=\"color:#fbbc05\">TAPS</a><br><br>Match <a style=\"color:#fbbc05\">FOOD</a> to <a style=\"color:#fbbc05\">HEAD</a> color";
    constants.AD_IMAGE = "yellow_left.svg";
    constants.AD_TEXT = "Got SWIPES?<br>Try <a style=\"color:#ea4335\">Kill The Snake</a>";
    constants.AD_URL = "https://goo.gl/XXm7Zj";
    constants.PKG_NAME = "com.game.killthesnake";
}
constants.LOCAL_PROG = "Local progress ";
constants.LOCAL_REC = "Local record ";
constants.SNAKES = " points";
constants.CHECK_CONN = "Please check network connection.";

constants.NO_LEAD = "<small>Leaderboards are not supported<br>in Amazon version.</small>";

constants.COMM_ERROR = "<small>Communication error.<br>Please check network connection.</small>";
constants.LOGIN_ERROR = "<small>Cannot sign in.<br>Please check network connection.</small>";
constants.CONFIG_ERROR = "<small>Wrong configuration.<br>Please let developers know.</small>";
constants.LIC_ERROR = "<small>License check failed.<br>Please download from official stores.</small>";

constants.RGBA_WHITE = "rgba(255, 255, 255, 0.8)";
constants.RGB_RED = "rgb(234, 67, 53)";
constants.RGB_BLUE = "rgb(66, 133, 244)";
constants.RGB_GREEN = "rgb(52, 168, 83)";
constants.RGB_YELLOW = "rgb(251, 188, 5)";
constants.HEX_RED = "#ea4335";
constants.HEX_BLUE = "#4285f4";
constants.HEX_GREEN = "#34a853";
constants.HEX_YELLOW = "#fbbc05";
constants.HEX_WHITE = "#FFFFFF";
constants.HEX_GREY = "#EEEEEE";

constants.BTN_SIZE = 56; // Predefined size of floating button is 56px
