"use strict";

var gapi = gapi || {};

var _playBoard;

var _showResults = 0;
var _leaderBoardId = 0;
var _syncLeaderBoard = 0;

var _playerId = 0;
var _playerProgress = 0;

var _adLoaded = false;
var _adPresent = false;

var _adIndex = 0;

gapi.setupClient = function(playBoard) {

    _playBoard = playBoard;

    game.setUp();

    game.onLoginSucceeded = function(result) {

        var playerDetail = result;

        _playerId = playerDetail['playerId'] + ' ' + playerDetail['playerDisplayName'];

        console.log('onLoginSucceeded: ' + _playerId);

        var playerBestTimeInt = localStorage.getItem(_playerId);
        var bestTimeInt = localStorage.getItem("bestTime");
        if ((playerBestTimeInt === null && bestTimeInt) ||
            (playerBestTimeInt && bestTimeInt &&
             bestTimeInt < playerBestTimeInt)) {
            // First player login, link local score to him or
            // local score is better than player's previous score
            game.submitScore(constants.LEAD_FASTEST_SNAKE_KILLER, bestTimeInt);
        } else if ((playerBestTimeInt && bestTimeInt === null) ||
                   (playerBestTimeInt && bestTimeInt &&
                    playerBestTimeInt < bestTimeInt)) {
            // Player has only previous score, link it to local score or
            // Player's previous score is better than local score
            localStorage.setItem("bestTime", playerBestTimeInt);
            game.submitScore(constants.LEAD_FASTEST_SNAKE_KILLER, playerBestTimeInt);
        }

        _playerProgress = _playerId + '_progress';
        var login = localStorage.getItem('login');
        var prevProgress = localStorage.getItem(_playerProgress);
        var localProgress = localStorage.getItem("levelProgress");
        if (prevProgress === null) prevProgress = 0;
        if (localProgress === null) localProgress = 0;
        prevProgress = parseInt(prevProgress);
        localProgress = parseInt(localProgress);
        if (login && login === 'yes') {
            // Player was offline, update his progress on the server.
            gapi.submitScore(constants.LEAD_GAME_PROGRESS, localProgress);
        } else {
            // Player was disconnected from the game server.
            // Report his highest progress.
            var totalProgress = Math.max(parseInt(prevProgress), parseInt(localProgress));
            if (totalProgress) {
                localStorage.setItem("levelProgress", totalProgress);
                gapi.submitScore(constants.LEAD_GAME_PROGRESS, totalProgress);
                // Set the new level
                _playBoard.setLevel();
                if (_playBoard.getGameStatus() === 0) {
                    _playBoard.placeFood();
                }
            }
        }
        // Synchronize scores with the game server first leaderboard
        _syncLeaderBoard = constants.LEAD_FASTEST_SNAKE_KILLER;
        game.getPlayerScore(constants.LEAD_FASTEST_SNAKE_KILLER);

        localStorage.setItem("login", 'yes');

        if (_showResults === constants.ACH_SHOW) {
            game.showAchievements();
        } else if (_showResults === constants.LEAD_SHOW) {
            game.showLeaderboard(_leaderBoardId);
        }

        _showResults = 0;
        _leaderBoardId = 0;
    };

    game.onLoginFailed = function(result) {

        var errorCode = result;
        var errorMessage = [ constants.COMM_ERROR,
                             constants.LOGIN_ERROR,
                             constants.CONFIG_ERROR,
                             constants.LIC_ERROR ];
        if (errorCode > -1 && errorCode < 4) {
            _playBoard.showMessage(errorMessage[errorCode], 0);
        }
        console.log('onLoginFailed');
        localStorage.setItem("login", 'no');
    };

    game.onLogout = function() {

        console.log('onLogout ' + _playerId);

        var bestTimeInt = localStorage.getItem("bestTime");
        if (bestTimeInt) {
            // Link best local score to the player
            localStorage.setItem(_playerId, bestTimeInt);
            // Remove best local score to prevent duplication
            localStorage.removeItem("bestTime");
            _playerId = 0;
        }
        var localProgress = localStorage.getItem("levelProgress");
        if (localProgress) {
            // Link local progress to the player
            localStorage.setItem(_playerProgress, localProgress);
            // Remove local progress to prevent duplication
            localStorage.removeItem("levelProgress");
            _playerProgress = 0;
            // Reset the level
            _playBoard.setLevel();
            // Start new game
            _playBoard.newGame();
        }
        localStorage.setItem("login", 'no');
    };

    game.onGetPlayerImageSucceeded = function(result) {

        var playerImageUrl = result;
        console.log('onGetPlayerImageSucceeded: ' + playerImageUrl);
    };

    game.onGetPlayerImageFailed = function() {

        console.log('onGetPlayerImageFailed');
    };

    game.onGetPlayerScoreSucceeded = function(result) {

        var playerScore = result;

        console.log('onGetPlayerScoreSucceeded: ' + _playerId + ' ' + playerScore);

        if (_syncLeaderBoard === constants.LEAD_FASTEST_SNAKE_KILLER) {
            var bestTimeInt = localStorage.getItem("bestTime");
            if (playerScore !== 0 && (bestTimeInt === null ||
                (bestTimeInt !== null && playerScore < bestTimeInt))) {
                // Take the best score from the game server
                localStorage.setItem("bestTime", playerScore);
                localStorage.setItem(_playerId, playerScore);
            }
            // Synchronize progress with the game server second leaderboard
            _syncLeaderBoard = constants.LEAD_GAME_PROGRESS;
            game.getPlayerScore(constants.LEAD_GAME_PROGRESS);
        } else if (_syncLeaderBoard === constants.LEAD_GAME_PROGRESS) {
            var localProgress = localStorage.getItem("levelProgress");
            if (playerScore !== 0 && (localProgress === null ||
                (localProgress !== null && playerScore > localProgress))) {
                // Take the highest progress from the game server
                localStorage.setItem("levelProgress", playerScore);
                localStorage.setItem(_playerProgress, playerScore);
                // Set the new level
                _playBoard.setLevel();
                if (_playBoard.getGameStatus() === 0) {
                    _playBoard.placeFood();
                }
            }
            _syncLeaderBoard = 0;
        }
    };

    game.onGetPlayerScoreFailed = function() {

        console.log('onGetPlayerScoreFailed');
    };

    game.onSubmitScoreSucceeded = function() {

        console.log('onSubmitScoreSucceeded');
    };

    game.onSubmitScoreFailed = function() {

        console.log('onSubmitScoreFailed');
    };

    game.onUnlockAchievementSucceeded = function() {

        console.log('onUnlockAchievementSucceeded');
    };

    game.onUnlockAchievementFailed = function() {

        console.log('onUnlockAchievementFailed');
    };

    game.onIncrementAchievementSucceeded = function() {

        console.log('onIncrementAchievementSucceeded');
    };

    game.onIncrementAchievementFailed = function() {

        console.log('onIncrementAchievementFailed');
    };

    game.onResetAchievementsSucceeded = function() {

        console.log('onResetAchievementsSucceeded');
    };

    game.onResetAchievementsFailed = function() {

        console.log('onResetAchievementsFailed');
    };

    var login = localStorage.getItem("login");
    if (login && login === 'yes') {
        game.login();
    }
};

gapi.setupAdMob = function() {

    if (!AdMob) {
        console.log('AdMob plugin is not ready');
        return;
    }

    document.addEventListener('onAdFailLoad', function(data) {
        _adLoaded = false;
        console.log('error: ' + data.error +
                    ', reason: ' + data.reason +
                    ', adNetwork: ' + data.adNetwork +
                    ', adType: ' + data.adType +
                    ', adEvent: ' + data.adEvent);
    });

    document.addEventListener('onAdLoaded', function(data) {
        _adLoaded = true;
        console.log('AdMob loaded');
    });

    document.addEventListener('onAdPresent', function(data) {
        console.log('AdMob shown');
    });

    document.addEventListener('onAdLeaveApp', function(data) {
        console.log('AdMob clicked');
    });

    document.addEventListener('onAdDismiss', function(data) {
        console.log('AdMob hidden');
    });

    gapi.createAdMob();
};

gapi.createAdMob = function() {

var _adBanners = [ constants.MEDIUM_RECTANGLE, 'MEDIUM_RECTANGLE',
                   constants.FULL_BANNER, 'FULL_BANNER',
                   constants.BANNER, 'BANNER',
                   constants.SMART_BANNER, 'SMART_BANNER' ];

    console.log('Trying to create ' + _adBanners[_adIndex + 1]);

    AdMob.createBanner( {
        adId: _adBanners[_adIndex],
        adSize: _adBanners[_adIndex + 1],
        overlap: true,
        position: AdMob.AD_POSITION.CENTER,
        autoShow: false,
        isTesting: false
    } );

    _adIndex += 2;
    if (_adIndex === _adBanners.length) _adIndex = 0;
};

gapi.destroyAdMob = function() {

    AdMob.removeBanner();
    _adIndex = 0;
};

gapi.showAdMob = function() {

    if (_adLoaded) {
        AdMob.showBanner(AdMob.AD_POSITION.CENTER);
        _adPresent = true;
    } else {
        gapi.createAdMob();
    }
};

gapi.hideAdMob = function() {

    if (_adPresent) {
        AdMob.hideBanner();
        _adPresent = false;
    }
};

gapi.initAdMob = function() {

    gapi.hideAdMob();
    gapi.destroyAdMob();
    gapi.createAdMob();
};

gapi.reconnect = function() {

    var login = localStorage.getItem("login");
    if (game.isLoggedIn()) {
        game.logout();
    }
    if (login && login === 'yes') {
        game.login();
        return 1;
    }
    return 0;
};

gapi.showAchievements = function() {

    if (game.isLoggedIn()) {
        game.showAchievements();
    } else {
        _showResults = constants.ACH_SHOW;
        game.login();
    }
};

gapi.showLeaderboard = function(leaderBoardId) {

    if (game.isLoggedIn()) {
        game.showLeaderboard(leaderBoardId);
    } else {
        _showResults = constants.LEAD_SHOW;
        _leaderBoardId = leaderBoardId;
        game.login();
    }
};

gapi.submitScore = function(leaderBoardId, score) {

    if (game.isLoggedIn()) {
        // Link the local score to the player
        if (leaderBoardId === constants.LEAD_FASTEST_SNAKE_KILLER) {
            localStorage.setItem(_playerId, score);
        } else {
            localStorage.setItem(_playerProgress, score);
        }
        game.submitScore(leaderBoardId, score);
    }
};
