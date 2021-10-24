var SNAKE = SNAKE || {};

SNAKE.addEventListener = (function() {
    if (window.addEventListener) {
        return function(obj, event, funct, evtCapturing) {
            obj.addEventListener(event, funct, evtCapturing);
        };
    } else if (window.attachEvent) {
        return function(obj, event, funct) {
            obj.attachEvent("on" + event, funct);
        };
    }
})();

SNAKE.removeEventListener = (function() {
    if (window.removeEventListener) {
        return function(obj, event, funct, evtCapturing) {
            obj.removeEventListener(event, funct, evtCapturing);
        };
    } else if (window.detachEvent) {
        return function(obj, event, funct) {
            obj.detachEvent("on" + event, funct);
        };
    }
})();

SNAKE.Snake = (function() {

    var SnakeBlock = function() {
        this.elm = null;
        this.row = -1;
        this.col = -1;
		this.prev = null;
        this.next = null;
    };

    return function(inputConfig) {

        if (!inputConfig || !inputConfig.field) {return;}

        var snakeBody = this,
            playBoard = inputConfig.field,
            numOfRows = inputConfig.row,
            numOfCols = inputConfig.col,
            snakeSize = 11,
            foodNum = 4,
            movesQueue = [],
            currentDirection = 1, // 0: up, 1: left, 2: down, 3: right
            columnShift = [0, -1, 0, 1],
            rowShift = [-1, 0, 1, 0],
            timerID,
            blocksPool,
            images = [],
            curImage = null,
            yellow = [ "yellow_up.svg", "yellow_left.svg", "yellow_down.svg", "yellow_right.svg" ],
            green = [ "green_up.svg", "green_left.svg", "green_down.svg", "green_right.svg" ],
            blue = [ "blue_up.svg", "blue_left.svg", "blue_down.svg", "blue_right.svg" ],
            red = [ "red_up.svg", "red_left.svg", "red_down.svg", "red_right.svg" ],
            head = [ yellow, green, blue, red ];

        var BlocksPool = function () {

            var head = null;
            var tail = null;

            function create() {

                return { snakeBlock:null, next:null };
            }

            this.add = function(block) {

                if (head === null) {
                    head = create();
                    tail = head;
                } else {
                    tail.next = create();
                    tail = tail.next;
                }
                tail.snakeBlock = block;
            };

            this.get = function() {

                if (head === null)
                    return null;
                var temp = head;
                head = head.next;
                return temp.snakeBlock;
            };
        };

        preloadImages();
        createBlocksPool();
        initElements();

        function createSnakeBlock() {

            var snakeBlock = new SnakeBlock();
            snakeBlock.elm = document.createElement("div");
            snakeBlock.elm.className = "snakeBlock";
            snakeBlock.elm.style.left = "-1000px";
            snakeBlock.elm.style.top = "-1000px";
            snakeBlock.elm.style.width = playBoard.getBlockWidth() + "px";
            snakeBlock.elm.style.height = playBoard.getBlockHeight() + "px";
            snakeBlock.elm.style.zIndex = 50;
            playBoard.getBoardContainer().appendChild(snakeBlock.elm);
            return snakeBlock;
        }

        function createBlocksPool() {

            blocksPool = new BlocksPool();
            var numOfBlocks = (playBoard.getNumOfRows() * playBoard.getNumOfColumns() +
                (snakeSize - foodNum)) / 2; // The maximum length the snake could grow
            for (var index = 0; index < numOfBlocks; index++) {
                var snakeBlock = createSnakeBlock();
                blocksPool.add(snakeBlock);
            }
        }

        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                do {
                    var j = Math.floor(Math.random() * (i + 1));
                    if (i === array.length - 1) { break; }
                } while (array[j] === array[i + 1])
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }

        function initElements() {

            snakeSize = 11;

            var snakeColors = [0,0,0,1,1,1,2,2,2,3,3,3];
            snakeColors = shuffleArray(snakeColors);

            var row = ((numOfRows - 5) - (numOfRows - 5) % 2) / 2;
            var col = ((numOfCols - 5) - (numOfCols - 5) % 2) / 2 + 3;

            createSnakeHead(snakeColors[1], row, col);
            col -= 1;
            addSnakeBlock(snakeColors[2], row, col);
            col -= 1;
            addSnakeBlock(snakeColors[3], row, col);
            row += 1;
            addSnakeBlock(snakeColors[4], row, col);
            row += 1;
            addSnakeBlock(snakeColors[5], row, col);
            col += 1;
            addSnakeBlock(snakeColors[6], row, col);
            col += 1;
            addSnakeBlock(snakeColors[7], row, col);
            row += 1;
            addSnakeBlock(snakeColors[8], row, col);
            row += 1;
            addSnakeBlock(snakeColors[9], row, col);
            col -= 1;
            addSnakeBlock(snakeColors[10], row, col);
            col -= 1;
            addSnakeBlock(snakeColors[11], row, col);
            setSnakeHeadImage();
            playBoard.placeFood();
        }

        function preloadImages() {

            for (var i = 0; i < head.length; i++) {
                images[i] = [];
                for (var j = 0; j < head[i].length; j++) {
                    images[i][j] = new Image();
                    images[i][j].src = "res/images/" + head[i][j];
                    images[i][j].width = playBoard.getBlockWidth();
                    images[i][j].height = playBoard.getBlockHeight();
                }
            }
        }

        function setSnakeHeadImage() {

            var snakeHead = snakeBody.snakeHead;
            if (snakeHead) {
                if (curImage) {
                    curImage.parentNode.removeChild(curImage);
                }
                var colorIndex = playBoard.getColorIndex(snakeHead.elm.style.backgroundColor);
                var image = images[colorIndex][currentDirection];
                snakeHead.elm.appendChild(image);
                curImage = image;
                if (snakeHead.next) {
                    snakeHead.next.elm.style.zIndex = 50;
                }
                snakeHead.elm.style.zIndex = 100;
            }
        }

        function createSnakeHead(index, row, col) {

            var snakeBlock = createBlock();
            snakeBlock.row = row;
            snakeBlock.col = col;
            snakeBlock.elm.style.left =  playBoard.getPlayFieldLeft() +
                snakeBlock.col * playBoard.getBlockWidth() + "px";
            snakeBlock.elm.style.top = playBoard.getPlayFieldTop() +
                snakeBlock.row * playBoard.getBlockHeight() + "px";
            snakeBlock.elm.style.backgroundColor = playBoard.getColor(index);
            snakeBody.snakeTail = snakeBlock;
            snakeBody.snakeHead = snakeBlock;
            playBoard.grid[row][col].stat += 1; // add snake block to the grid cell
        }

        function addSnakeBlock(index, row, col) {

            var newHead, oldHead;
            oldHead = snakeBody.snakeHead;
            newHead = createBlock();
            newHead.row = row;
            newHead.col = col;
            newHead.elm.style.left =  playBoard.getPlayFieldLeft() +
                newHead.col * playBoard.getBlockWidth() + "px";
            newHead.elm.style.top = playBoard.getPlayFieldTop() +
                newHead.row * playBoard.getBlockHeight() + "px";
            newHead.elm.style.backgroundColor = playBoard.getColor(index);
            oldHead.prev = newHead;
            newHead.next = oldHead;
            snakeBody.snakeHead = newHead;
            playBoard.grid[row][col].stat += 1; // add snake block to the grid cell
        }

        function createBlock() {

            return blocksPool.get();
        }

        function removeBlock() {

            var oldHead = snakeBody.snakeHead;
            snakeBody.snakeHead = oldHead.next;
            if (snakeBody.snakeHead)
                snakeBody.snakeHead.prev = null;
            playBoard.grid[oldHead.row][oldHead.col].stat -= 1; // remove snake head from the grid cell
            oldHead.row = -1;
            oldHead.col = -1;
            oldHead.prev = null;
            oldHead.next = null;
            oldHead.elm.style.left = "-1000px";
            oldHead.elm.style.top = "-1000px";
            oldHead.elm.style.zIndex = 50;
            blocksPool.add(oldHead);
        }

        function findBlock(row, col) {

            var snakeBlock = snakeBody.snakeHead;
            while (snakeBlock) {
                if (snakeBlock.row === row &&
                    snakeBlock.col === col)
                    return snakeBlock;
                snakeBlock = snakeBlock.next;
            }
            return snakeBlock;
        }

        function shiftColor() {

            var snakeBlock = snakeBody.snakeHead,
                snakeColor = snakeBlock.elm.style.backgroundColor;

            while (snakeBlock.next !== null) {
                snakeBlock.elm.style.backgroundColor = snakeBlock.next.elm.style.backgroundColor;
                snakeBlock = snakeBlock.next;
            }
            snakeBlock.elm.style.backgroundColor = snakeColor;
        }

        function setupDirection() {

            movesQueue = [];
            currentDirection = 1;
        }

        snakeBody.setupSnake = function() {

            setupDirection();
            initElements();
        };

        snakeBody.cleanupSnake = function() {

            while(snakeBody.snakeHead) {
                removeBlock();
            }
            if (curImage) {
                curImage.parentNode.removeChild(curImage);
                curImage = null;
            }
            snakeBody.snakeHead = null;
            snakeBody.snakeTail = null;
        };

        snakeBody.setDirection = function(direction) {

            if (playBoard.getGameStatus() === 1) {
                if (constants.CONTROL === "swipe") {
                    switch (direction) {
                        case 0:
                        case 38:
                            if (currentDirection !== 2) {
                                currentDirection = 0;
                                movesQueue.push(0);
                            }
                            break;
                        case 1:
                        case 37:
                            if (currentDirection !== 3) {
                                currentDirection = 1;
                                movesQueue.push(1);
                            }
                            break;
                        case 2:
                        case 40:
                            if (currentDirection !== 0) {
                                currentDirection = 2;
                                movesQueue.push(2);
                            }
                            break;
                        case 3:
                        case 39:
                            if (currentDirection !== 1) {
                                currentDirection = 3;
                                movesQueue.push(3);
                            }
                            break;
                    }
                } else {
                    var lastDirection = (movesQueue.length) ? movesQueue[movesQueue.length-1] : currentDirection;
                    switch (lastDirection) {
                        case 0:
                            currentDirection = 3;
                            movesQueue.push(3);
                            break;
                        case 1:
                            currentDirection = 0;
                            movesQueue.push(0);
                            break;
                        case 2:
                            currentDirection = 1;
                            movesQueue.push(1);
                            break;
                        case 3:
                            currentDirection = 2;
                            movesQueue.push(2);
                            break;
                    }
                }
            }
        };

		function move(row, col, direction) {

            var oldHead = snakeBody.snakeHead,
                oldTail = snakeBody.snakeTail;

            if (oldHead === null || oldTail === null || playBoard.getGameStatus() !== 1)
                return;

            var newHead, newTail = oldTail.prev;

			playBoard.grid[oldTail.row][oldTail.col].stat -= 1; // remove tail from grid cell

            if (row === -1 && col === -1) {
			    oldTail.col = (oldHead.col + playBoard.getNumOfColumns() +
                    columnShift[direction]) % playBoard.getNumOfColumns();
			    oldTail.row = (oldHead.row + playBoard.getNumOfRows() +
                    rowShift[direction]) % playBoard.getNumOfRows();
            } else {
                oldTail.col = col;
                oldTail.row = row;
            }

			oldTail.elm.style.left = playBoard.getPlayFieldLeft() +
                oldTail.col * playBoard.getBlockHeight() + "px";
			oldTail.elm.style.top = playBoard.getPlayFieldTop() +
                oldTail.row * playBoard.getBlockHeight() + "px";

			if (snakeSize === 1) {
                if (oldTail.row >= 0 && oldTail.row < playBoard.getNumOfRows() &&
                    oldTail.col >= 0 && oldTail.col < playBoard.getNumOfColumns())
                    playBoard.grid[oldTail.row][oldTail.col].stat += 1; // move tail to the next grid cell
			}
			else {
				newHead = oldTail;
				newHead.prev = null;
				newHead.next = oldHead;
				oldHead.prev = newHead;

				if (newTail.prev === null)
					newTail.prev = newHead;
				newTail.next = null;

                if (newHead.row >= 0 && newHead.row < playBoard.getNumOfRows() &&
                    newHead.col >= 0 && newHead.col < playBoard.getNumOfColumns()) {
                    playBoard.grid[newHead.row][newHead.col].stat += 1; // place new head to the grid cell
                }

				snakeBody.snakeHead = newHead;
				snakeBody.snakeTail = newTail;
             }
            shiftColor();
		}

        snakeBody.go = function(setTimer) {

            if (snakeBody.snakeHead === null || playBoard.getGameStatus() !== 1)
                return;

            var direction = (movesQueue.length) ? movesQueue.shift() : currentDirection;

            var col = (snakeBody.snakeHead.col + playBoard.getNumOfColumns() +
                       columnShift[direction]) % playBoard.getNumOfColumns(),
                row = (snakeBody.snakeHead.row + playBoard.getNumOfRows() +
                       rowShift[direction]) % playBoard.getNumOfRows();

            if (row < 0 || col < 0 || row === playBoard.getNumOfRows() ||
                col === playBoard.getNumOfColumns() ||
                playBoard.grid[row][col].stat === 0) {
				        move(-1, -1, direction);
            } else if (playBoard.grid[row][col].stat === -1) {
                if (eatFood(row, col, direction) === 1) {
                    return;
                }
            } else if (playBoard.grid[row][col].stat > 0) {
                move(-1, -1, direction);
            }
            setSnakeHeadImage();
            if (setTimer) {
                if (playBoard.setTimer() === 1) {
                    return;
                }
            }
            playBoard.changeFoodSize();
            timerID = setTimeout(function(){snakeBody.go(1);}, playBoard.getSnakeSpeed());
        };

        snakeBody.checkAhead = function(row, col) {

            if (((currentDirection === 0 || currentDirection === 2) &&
                 snakeBody.snakeHead.col === col) ||
                ((currentDirection === 1 || currentDirection === 3) &&
                 snakeBody.snakeHead.row === row))
                return 1;
            else
                return 0;
        };

        snakeBody.pauseGame = function() {

            clearTimeout(timerID);
        };

        snakeBody.getHeadColor = function() {

            return snakeBody.snakeHead.elm.style.backgroundColor;
        };

        function eatFood(row, col, direction) {

			      var oldHead = snakeBody.snakeHead;
            var foodColor = playBoard.getFoodColor(row, col);
            if (foodColor === oldHead.elm.style.backgroundColor) {
                if (snakeSize === 1) {
                    if (playBoard.setTimer() === 1) {
                        return 1;
                    }
                    playBoard.playbackSound('crunch', false);
                    playBoard.grid[row][col].stat = 1; // the food is replaced by snake head
                    playBoard.foodEaten(row, col, 1);
                    removeBlock();
                    snakeSize -= 1;
                    snakeBody.pauseGame();
                    playBoard.gameOver();
                    return 1;
                } else {
                    playBoard.playbackSound('crunch', false);
                    var headRow = oldHead.row;
                    var headCol = oldHead.col;
                    removeBlock();
                    snakeSize -= 1;
                    move(headRow, headCol, direction);
                    move(row, col, direction);
				            playBoard.grid[row][col].stat = 1; // the food is replaced by snake head
                    playBoard.foodEaten(row, col, 1);
                }
            } else {
                playBoard.playbackSound('fart', false);
                var newHead = createBlock();
                snakeSize += 1;
                newHead.col = col;
                newHead.row = row;
                newHead.elm.style.left = playBoard.getPlayFieldLeft() +
                    newHead.col * playBoard.getBlockHeight() + "px";
                newHead.elm.style.top = playBoard.getPlayFieldTop() +
                    newHead.row * playBoard.getBlockHeight() + "px";
                newHead.elm.style.backgroundColor = foodColor;
                oldHead.prev = newHead;
                newHead.next = oldHead;
                snakeBody.snakeHead = newHead;
				        playBoard.grid[row][col].stat = 1; // the food is replaced by snake head
                playBoard.foodEaten(row, col, 0);
            }
            return 0;
        }
    };
})();

SNAKE.Food = (function() {

    function getRandomPosition(n) {

        return Math.floor(Math.random()*n);
    }

    return function(inputConfig) {

        if (!inputConfig || !inputConfig.field) {return;}

        var snakeFood = this,
            playBoard = inputConfig.field,
            timerTick = 0,
            foodSize = [1.3, 1.6, 1.9, 1.6, 1.3, 1.0],
            headColor = [],
            colorDist = [1, 1, 1, 1];

        snakeFood.setTrainingMode = function() {

            timerTick = 5;
            snakeFood.changeFoodSize();
            headColor.splice(0, headColor.length);
            var color = playBoard.getHeadColor();
            for (var i = 0; i < playBoard.getNumOfRows(); i++) {
                for (var j = 0; j < playBoard.getNumOfColumns(); j++) {
                    if (playBoard.grid[i][j].elm.style.backgroundColor === color) {
                        headColor.push(i);
                        headColor.push(j);
                    }
                }
            }
        };

        snakeFood.changeFoodSize = function() {

            for (var index = 0; index < headColor.length; index += 2) {
                var x = headColor[index];
                var y = headColor[index + 1];

                var blockWidth = playBoard.getBlockWidth() / 2;
                var blockHeight = playBoard.getBlockHeight() / 2;
                var blockWidthNext = blockWidth * foodSize[timerTick];
                var blockHeightNext = blockHeight * foodSize[timerTick];

                var widthStr = playBoard.grid[x][y].elm.style.width;
                var heightStr = playBoard.grid[x][y].elm.style.height;
                var leftStr = playBoard.grid[x][y].elm.style.left;
                var topStr = playBoard.grid[x][y].elm.style.top;
                var width = parseFloat(widthStr.substring(0,widthStr.length-2));
                var height = parseFloat(heightStr.substring(0,heightStr.length-2));
                var left = parseFloat(leftStr.substring(0,leftStr.length-2));
                var top = parseFloat(topStr.substring(0,topStr.length-2));

                var offsetX = (width - blockWidthNext) / 2;
                var offsetY = (height - blockHeightNext) / 2;

                playBoard.grid[x][y].elm.style.width = blockWidthNext + "px";
                playBoard.grid[x][y].elm.style.height = blockHeightNext + "px";
                playBoard.grid[x][y].elm.style.left = left + offsetX + "px";
                playBoard.grid[x][y].elm.style.top = top + offsetY + "px";
            }
            timerTick++;
            if (timerTick === 6) {
                timerTick = 0;
            }
        };

        snakeFood.cleanupFood = function() {

            timerTick = 5;
            snakeFood.changeFoodSize();
            colorDist = [1, 1, 1, 1];
        };

        snakeFood.getFoodColor = function(fRow, fCol) {

            return playBoard.grid[fRow][fCol].elm.style.backgroundColor;
        };

        snakeFood.checkSnake = function(fRow, fCol, start) {

            if (start) {
                var rowUp = (fRow + playBoard.getNumOfRows() + 1) % playBoard.getNumOfRows();
                var rowDown = (fRow + playBoard.getNumOfRows() - 1) % playBoard.getNumOfRows();
                var colRight = (fCol + playBoard.getNumOfColumns() + 1) % playBoard.getNumOfColumns();
                var colLeft = (fCol + playBoard.getNumOfColumns() - 1) % playBoard.getNumOfColumns();
                if (playBoard.grid[rowUp][fCol].stat === 1 ||
                    playBoard.grid[rowDown][fCol].stat === 1 ||
                    playBoard.grid[fRow][colRight].stat === 1 ||
                    playBoard.grid[fRow][colLeft].stat === 1) {
                    return 1;
                }
            }
            return 0;
        };

        snakeFood.checkAround = function(fRow, fCol, foodNum, fieldSize) {

            if (foodNum < fieldSize / 2) {
                var rowUp = (fRow + playBoard.getNumOfRows() + 1) % playBoard.getNumOfRows();
                var rowDown = (fRow + playBoard.getNumOfRows() - 1) % playBoard.getNumOfRows();
                var colRight = (fCol + playBoard.getNumOfColumns() + 1) % playBoard.getNumOfColumns();
                var colLeft = (fCol + playBoard.getNumOfColumns() - 1) % playBoard.getNumOfColumns();
                if (playBoard.grid[rowUp][fCol].stat === -1 ||
                    playBoard.grid[rowDown][fCol].stat === -1 ||
                    playBoard.grid[fRow][colRight].stat === -1 ||
                    playBoard.grid[fRow][colLeft].stat === -1) {
                    return 1;
                }
            }
            return 0;
        };

        snakeFood.randomlyPlaceFood = function(fRow, fCol, start) {

            if (fRow !== -1 && fCol !== -1) {
                var colorIndex = playBoard.getColorIndex(
                    playBoard.grid[fRow][fCol].elm.style.backgroundColor);
                colorDist[colorIndex]--;
                playBoard.grid[fRow][fCol].elm.style.backgroundColor = constants.HEX_GREY;
            }
            var foodNum = 0;
            var minIndex = 0;
            for (var index = 1; index < colorDist.length; index++) {
                foodNum += colorDist[index];
                if (colorDist[minIndex] > colorDist[index])
                    minIndex = index;
            }
            colorDist[minIndex]++;
            var retry = 0, row = -1, col = -1;
            var fieldSize = playBoard.getNumOfRows() * playBoard.getNumOfColumns();
            while (retry < fieldSize * 2)  {
                row = getRandomPosition(playBoard.getNumOfRows());
                col = getRandomPosition(playBoard.getNumOfColumns());
                if (playBoard.checkAhead(row, col) === 0 &&
                    snakeFood.checkAround(row, col, foodNum, fieldSize) === 0 &&
                    snakeFood.checkSnake(row, col, start) === 0 &&
                    playBoard.grid[row][col].stat === 0) { break; } // found empty grid cell
                retry++;
            }
            if (retry < fieldSize * 2) { // If no empty cell found, keep moving without placing food
                playBoard.grid[row][col].elm.style.backgroundColor =
                    playBoard.getColor(minIndex);
                playBoard.grid[row][col].stat = -1; // place food to the empty cell
            }
        };
    };
})();

SNAKE.Board = (function() {

    var FieldBlock = function() {
        this.elm = null;
        this.stat = 0;
    };

    function getClientWidth() {

        var clientWidth = 0;
        if (typeof window.innerWidth === "number") {
            clientWidth = window.innerWidth; // Non-IE
        } else if (document.documentElement &&
                   (document.documentElement.clientWidth ||
                    document.documentElement.clientHeight)) {
            clientWidth = document.documentElement.clientWidth; // IE 6+ in 'standards compliant mode'
        } else if (document.body && (document.body.clientWidth ||
                                     document.body.clientHeight)) {
            clientWidth = document.body.clientWidth; // IE 4 compatible
        }
        return clientWidth;
    }

    function getClientHeight() {

        var clientHeight = 0;
        if (typeof window.innerHeight === "number") {
            clientHeight = window.innerHeight; // Non-IE
        } else if (document.documentElement &&
                   (document.documentElement.clientWidth ||
                    document.documentElement.clientHeight)) {
            clientHeight = document.documentElement.clientHeight; // IE 6+ in 'standards compliant mode'
        } else if (document.body &&
                   (document.body.clientWidth ||
                    document.body.clientHeight)) {
            clientHeight = document.body.clientHeight; // IE 4 compatible
        }
        return clientHeight;
    }

    return function(inputConfig) {

        var playBoard = this,
            gameConfig = inputConfig || {},
            gameStatus = 0, // 0:new,1:play,2:pause,3:finish
            blockWidth = 0,
            blockHeight = 0,
            playFieldTop = 0,
            playFieldLeft = 0,
            numOfColumns = 11,
            numOfRows = 11,
            snakeSpeed = 200,
            playTime = 60,
            level = 0,
            maxLevel = 0,
            lockedLevel = 0,
            gridFoodValue = -1,
            foodBlock,
            snakeBody,
            keyListener,
            prevTime = 0,
            passTime = 0,
            currentTime = 0,
            currentColor = 0,
            levelMessage = 0,
            backButtonPressed = 0,
            buttonPressed = 0,
            deviceReady = false,
            sounds = ['back', 'crunch', 'fart', 'lose', 'win', 'click'],
            soundId = null,
            loadIndex = 0,
            loadFailures = 0,
            audioContext = null,
            audioBuffer = [null, null, null, null, null, null],
            audioSource = [null, null, null, null, null, null],
            timerTick = 0,
            btnSmall = [1.05, 1.10, 1.15, 1.10, 1.05, 1.00],
            btnBig   = [1.10, 1.20, 1.30, 1.20, 1.10, 1.00],
            buttons = [],
            buttonTimer = null,
            helpSwitch = 0,
            instrIndex = 0,
            pkgInstalled = 0,
            bannerCounter = 0,
            playBtnLeft, playBtnCenter,
            startFood = constants.START_FOOD,
            addFood = constants.NEWBIE_FOOD,
            colorsInstr = [ constants.INSTR_RED, constants.INSTR_BLUE,
                       constants.INSTR_GREEN, constants.INSTR_YELLOW ],
            colorsRgb = [ constants.RGB_YELLOW, constants.RGB_GREEN,
                       constants.RGB_BLUE, constants.RGB_RED ],
            colorsHex = [ constants.HEX_YELLOW, constants.HEX_GREEN,
                       constants.HEX_BLUE, constants.HEX_RED ],
            helpEat = [ constants.EAT_YELLOW, constants.EAT_GREEN,
                       constants.EAT_BLUE, constants.EAT_RED ],
            playTimeArr = [constants.NEWBIE_TIME, constants.CASUAL_TIME,
                           constants.INTERMEDIATE_TIME, constants.ADVANCED_TIME,
                           constants.PROFESSIONAL_TIME],
            snakeSpeedArr = [constants.NEWBIE_SPEED, constants.CASUAL_SPEED,
                             constants.INTERMEDIATE_SPEED, constants.ADVANCED_SPEED,
                             constants.PROFESSIONAL_SPEED],
            stepArr = [constants.NEWBIE_STEP, constants.CASUAL_STEP,
                       constants.INTERMEDIATE_STEP, constants.ADVANCED_STEP,
                       constants.PROFESSIONAL_STEP],
            levelArr = [constants.NEWBIE_LEVEL, constants.CASUAL_LEVEL,
                        constants.INTERMEDIATE_LEVEL, constants.ADVANCED_LEVEL,
                        constants.PROFESSIONAL_LEVEL],
            foodArr = [constants.NEWBIE_FOOD, constants.CASUAL_FOOD,
                       constants.INTERMEDIATE_FOOD, constants.ADVANCED_FOOD,
                       constants.PROFESSIONAL_FOOD],
            ppc, ppc_perc, ppc_perc_wrap, ppc_prog, ppc_prog_fill,
            // Board components
            phoneScreen, playField, timerPanel, helpPanel, instrPanel,
            playBtn, achievBtn, leadBtn, sndBtn, leftBtn, rightBtn,
            replayBtn, restBtn, resmBtn, pauseBtn, volBtn,
            adPanel, adImage, adText, adIcon;

        document.addEventListener("deviceready", deviceReadyHandler, false);

        function deviceReadyHandler() {

            deviceReady = true;
            if (constants.PLATFORM === "android" ||
                constants.PLATFORM === "fireos") {
                navigator.screenOrientation.set('sensorPortrait');
            }
            document.addEventListener("backbutton", backButtonHandler, false);
            document.addEventListener("pause", pauseHandler, false);
            document.addEventListener("resume", resumeHandler, false);
            document.addEventListener("online", onlineHandler, false);
            gapi.setupClient(playBoard);
            gapi.setupAdMob();
            playBoard.checkPackage();
            playBoard.setupMedia();
            buttons.push(playBtn);
            playBoard.startChangeButtonSize();
        }

        function checkConnection() {

            var prev = localStorage.getItem("connect");
            var curr;
            if (navigator.connection.type === Connection.NONE) {
                curr = "offline";
            } else {
                curr = "online";
            }
            if (prev && prev === "offline" && curr === "online") {
                if (gapi.reconnect() === 1) {
                    playBoard.restoreTimerState();
                }
            }
            localStorage.setItem("connect", curr);
        }

        function onlineHandler() {

            if (gapi.reconnect() === 1) {
                playBoard.restoreTimerState();
            }
        }

        function backButtonHandler(e) {

            e.preventDefault();
            if (gameStatus === 1) {
                playBoard.pauseGame();
            } else {
                if (backButtonPressed === 0) {
                    backButtonPressed = 1;
                    playBoard.storeTimerState();
                    playBoard.showMessage(setFontSize(constants.EXIT), 1);
                } else {
                    playBoard.unInitialize(true);
                }
            }
        }

        function pauseHandler(e) {

            playBoard.pauseGame();
            playBoard.unInitialize(false);
        }

        function resumeHandler(e) {

            navigator.splashscreen.show();
            playBoard.setupMedia();
            checkConnection();
        }

        function levelIndex(level) {

            if (level < constants.CASUAL_LEVEL) {
                return 0;
            } else if (level < constants.INTERMEDIATE_LEVEL) {
                return 1;
            } else if (level < constants.ADVANCED_LEVEL) {
                return 2;
            } else if (level < constants.PROFESSIONAL_LEVEL) {
                return 3;
            } else {
                return 4;
            }
        }

        function calcLevelTime(level) {

            var index = levelIndex(level);
            if (level < constants.NEWBIE_LEVEL) {
                return constants.INSTR_TIME;
            } else {
                return playTimeArr[index] - (level - levelArr[index]) * stepArr[index];;
            }
        }

        function setPlayTime(progress) {

            var localProgress;
            var moreLevels = 1;
            if (progress === -1) {
                localProgress = localStorage.getItem("levelProgress");
                if (localProgress === null) {
                    localProgress = 0;
                }
                localProgress = parseInt(localProgress);
                if (localProgress >= constants.FUTURE_LEVEL) {
                    localProgress = constants.FUTURE_LEVEL - 1;
                    moreLevels = 0;
                }
                maxLevel = localProgress;
            } else {
                localProgress = progress;
            }
            var index = levelIndex(localProgress);
            if (localProgress < constants.NEWBIE_LEVEL) {
                playTime = constants.INSTR_TIME;
                snakeSpeed = constants.NEWBIE_SPEED;
                startFood = constants.START_FOOD;
                addFood = constants.NEWBIE_FOOD;
            } else {
                playTime = playTimeArr[index] - (localProgress - levelArr[index]) * stepArr[index];
                snakeSpeed = snakeSpeedArr[index];
                startFood = constants.START_FOOD + (localProgress - levelArr[index]);
                addFood = foodArr[index];
            }
            level = localProgress;
            if (level === 0) {
                levelMessage = setFontSize(constants.TRAINING +
                    "<br>" + playTime + constants.TIME);
                playBoard.showInstructions();
            } else {
                levelMessage = setFontSize(constants.LEVEL + (index + 1) +
                    "<br>" + playTime + constants.TIME);
                playBoard.hideInstructions();
            }
            if (level === maxLevel && moreLevels) {
                setProgress(Math.round((localProgress - levelArr[index]) * 100 / constants.LEVEL_STEPS));
            } else {
                setProgress(100);
            }
        }

        playBoard.checkPackage = function() {

            appAvailability.check(
                constants.PKG_NAME,
                function() {
                    pkgInstalled = 1;
                },
                function() {
                    pkgInstalled = 0;
                }
            );
        };

        playBoard.useAdMob = function() {

            if (pkgInstalled) {
                return 1;
            }
            if ((maxLevel < constants.CASUAL_LEVEL &&
                bannerCounter < constants.SHOW_BANNER) ||
                !(bannerCounter % constants.BANNER_STEP)) {
                return 0;
            }
            return 1;
        };

        playBoard.getSnakeSpeed = function() {

            return snakeSpeed;
        };

        playBoard.startChangeButtonSize = function() {

            if (buttonTimer === null) {
                buttonTimer = setInterval(function() { changeButtonSize(); }, 200);
            }
        };

        playBoard.stopChangeButtonSize = function() {

            if (buttonTimer !== null) {
                clearInterval(buttonTimer);
                buttonTimer = null;
            }
            timerTick = 5;
            changeButtonSize();
            buttons.splice(0, buttons.length);
        };

        function setInstColor() {

            if (instrIndex >= 0 && instrIndex <= 2) {
               instrPanel.innerHTML = setFontSize(constants.NAME + colorsInstr[0] + constants.LINK);
            } else if (instrIndex >= 3 && instrIndex <= 5) {
               instrPanel.innerHTML = setFontSize(constants.NAME + colorsInstr[1] + constants.LINK);
            } else if (instrIndex >= 6 && instrIndex <= 8) {
               instrPanel.innerHTML = setFontSize(constants.NAME + colorsInstr[2] + constants.LINK);
            } else {
               instrPanel.innerHTML = setFontSize(constants.NAME + colorsInstr[3] + constants.LINK);
            }
            instrIndex++;
            if (instrIndex === 12) {
               instrIndex = 0;
            }
        }

        function changeButtonSize() {

            var btnSize = constants.BTN_SIZE;
            var btnSizeNext;
            if (constants.PLATFORM === "ios") {
                btnSizeNext = btnSize * btnSmall[timerTick];
            } else {
                btnSizeNext = btnSize * btnBig[timerTick];
            }

            for (var index = 0; index < buttons.length; index++) {
                var widthStr = buttons[index].style.width;
                var heightStr = buttons[index].style.height;
                var leftStr = buttons[index].style.left;
                var topStr = buttons[index].style.top;
                var width = parseFloat(widthStr.substring(0,widthStr.length-2));
                var height = parseFloat(heightStr.substring(0,heightStr.length-2));
                var left = parseFloat(leftStr.substring(0,leftStr.length-2));
                var top = parseFloat(topStr.substring(0,topStr.length-2));

                var offsetX = (width - btnSizeNext) / 2;
                var offsetY = (height - btnSizeNext) / 2;

                buttons[index].style.width = btnSizeNext + "px";
                buttons[index].style.height = btnSizeNext + "px";
                buttons[index].style.left = left + offsetX + "px";
                buttons[index].style.top = top + offsetY + "px";
            }

            setInstColor();

            timerTick++;
            if (timerTick === 6) {
               timerTick = 0;
            }
        }


        function setProgress(percent) {

            if (percent === 100) {
                if (ppc.parentNode) {
                    rightBtn.removeChild(ppc);
                    rightBtn.style.backgroundColor = constants.RGB_YELLOW;
                    rightBtn.style.backgroundPosition = "center";
                    rightBtn.style.backgroundImage = "url(./res/images/right.png)";
                }
            } else {
                if (!ppc.parentNode) {
                    rightBtn.appendChild(ppc);
                }
                var deg = 360 * percent / 100;
                if (percent > 50) {
                    ppc.className = "progress-pie-chart gt-50";
                } else {
                    ppc.className = "progress-pie-chart";
                }
                ppc_prog_fill.style.webkitTransform = 'rotate(' + deg + 'deg)';
                ppc_prog_fill.style.transform = 'rotate(' + deg + 'deg)';
                ppc_perc_wrap.innerHTML = "<span>" + percent + "%</span>";
            }
        }

        function createBoardElements() {

            playField = document.createElement("div");
            playField.className = "playField";

            adPanel = document.createElement("div");
            adPanel.className = "commonPanel";
            adPanel.style.zIndex = 200;
            adPanel.style.outline = "2px solid " + constants.HEX_GREY;

            adImage = document.createElement("div");
            adImage.className = "commonPanel";
            adImage.style.zIndex = 200;

            adIcon = new Image();
            adIcon.src = "res/images/" + constants.AD_IMAGE;
            adIcon.width = constants.IMAGE_WIDTH;
            adIcon.height = constants.IMAGE_HEIGHT;

            adText = document.createElement("div");
            adText.className = "commonPanel";
            adText.style.color = constants.HEX_BLUE;
            adText.style.zIndex = 200;
            adText.innerHTML = setFontSize(constants.AD_TEXT);

            instrPanel = document.createElement("div");
            instrPanel.className = "commonPanel";
            instrPanel.style.color = constants.HEX_RED;
            instrPanel.style.backgroundColor = constants.RGBA_WHITE;
            instrPanel.style.zIndex = 200;
            instrPanel.innerHTML = setFontSize(constants.NAME + colorsInstr[0] + constants.LINK);

            ppc = document.createElement("div");
            ppc.className = "progress-pie-chart";
            ppc_prog = document.createElement("div");
            ppc_prog.className = "ppc-progress";
            ppc.appendChild(ppc_prog);
            ppc_prog_fill = document.createElement("div");
            ppc_prog_fill.className = "ppc-progress-fill";
            ppc_prog.appendChild(ppc_prog_fill);
            ppc_perc = document.createElement("div");
            ppc_perc.className = "ppc-percents";
            ppc_perc.style.color = constants.HEX_BLUE;
            ppc.appendChild(ppc_perc);
            ppc_perc_wrap = document.createElement("div");
            ppc_perc_wrap.className = "pcc-percents-wrapper";
            ppc_perc.appendChild(ppc_perc_wrap);

            rightBtn = document.createElement("div");
            rightBtn.className = "button";
            rightBtn.appendChild(ppc);

            helpPanel = document.createElement("div");
            helpPanel.className = "commonPanel";
            helpPanel.style.color = constants.HEX_RED;
            helpPanel.innerHTML = "";

            playBtn = document.createElement("div");
            playBtn.className = "button";
            playBtn.style.backgroundColor = constants.RGB_RED;
            playBtn.style.backgroundPosition = "center";
            playBtn.style.backgroundImage = "url(./res/images/play.png)";

            leftBtn = document.createElement("div");
            leftBtn.className = "button";
            leftBtn.style.backgroundColor = constants.RGB_RED;
            leftBtn.style.backgroundPosition = "center";
            leftBtn.style.backgroundImage = "url(./res/images/left.png)";

            pauseBtn = document.createElement("div");
            pauseBtn.className = "button";
            pauseBtn.style.backgroundColor = constants.RGB_RED;
            pauseBtn.style.backgroundPosition = "center";
            pauseBtn.style.backgroundImage = "url(./res/images/pause.png)";
            pauseBtn.style.display = "none";

            achievBtn = document.createElement("div");
            achievBtn.className = "button";
            achievBtn.style.backgroundColor = constants.RGB_BLUE;
            achievBtn.style.backgroundPosition = "center";
            achievBtn.style.backgroundImage = "url(./res/images/prog.png)";

            leadBtn = document.createElement("div");
            leadBtn.className = "button";
            leadBtn.style.backgroundColor = constants.RGB_GREEN;
            leadBtn.style.backgroundPosition = "center";
            leadBtn.style.backgroundImage = "url(./res/images/lead.png)";

            sndBtn = document.createElement("div");
            sndBtn.className = "button";
            sndBtn.style.backgroundColor = constants.RGB_YELLOW;
            sndBtn.style.backgroundPosition = "center";
            var playSound = localStorage.getItem("playSound");
            if (playSound === null) {
                localStorage.setItem("playSound", 'on');
                playSound = 'on';
            }
            sndBtn.style.backgroundImage = (playSound === 'on') ?
                "url(./res/images/sound_on.png)" :
                "url(./res/images/sound_off.png)";

            volBtn = document.createElement("div");
            volBtn.className = "button";
            volBtn.style.backgroundColor = constants.RGB_YELLOW;
            volBtn.style.backgroundPosition = "center";
            volBtn.style.display = "none";
            var playSound = localStorage.getItem("playSound");
            if (playSound === null) {
                localStorage.setItem("playSound", 'on');
                playSound = 'on';
            }
            volBtn.style.backgroundImage = (playSound === 'on') ?
                "url(./res/images/sound_on.png)" :
                "url(./res/images/sound_off.png)";

            replayBtn = document.createElement("div");
            replayBtn.className = "button";
            replayBtn.style.backgroundColor = constants.RGB_RED;
            replayBtn.style.backgroundPosition = "center";
            replayBtn.style.backgroundImage = "url(./res/images/next.png)";
            replayBtn.style.display = "none";

            resmBtn = document.createElement("div");
            resmBtn.className = "button";
            resmBtn.style.backgroundColor = constants.RGB_RED;
            resmBtn.style.backgroundPosition = "center";
            resmBtn.style.backgroundImage = "url(./res/images/play.png)";
            resmBtn.style.display = "none";

            restBtn = document.createElement("div");
            restBtn.className = "button";
            restBtn.style.backgroundColor = constants.RGB_BLUE;
            restBtn.style.backgroundPosition = "center";
            restBtn.style.backgroundImage = "url(./res/images/replay.png)";
            restBtn.style.display = "none";

            setPlayTime(-1);

            timerPanel = document.createElement("div");
            timerPanel.className = "commonPanel";
            timerPanel.style.color = constants.HEX_BLUE;
            timerPanel.innerHTML = levelMessage;

            SNAKE.addEventListener(adPanel, "touchstart", function (evt) {
                evt.stopPropagation();
                window.open(constants.AD_URL);
            }, false);

            SNAKE.addEventListener(adPanel, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(adImage, "touchstart", function (evt) {
                evt.stopPropagation();
                window.open(constants.AD_URL);
            }, false);

            SNAKE.addEventListener(adImage, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(adIcon, "touchstart", function (evt) {
                evt.stopPropagation();
                window.open(constants.AD_URL);
            }, false);

            SNAKE.addEventListener(adIcon, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(adText, "touchstart", function (evt) {
                evt.stopPropagation();
                window.open(constants.AD_URL);
            }, false);

            SNAKE.addEventListener(adText, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(instrPanel, "touchstart", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(instrPanel, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(playBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                playBtn.style.opacity = "0.5";
                setTimeout(function() {
                    playBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.stopSound('click');
                        playBoard.playGame();
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(playBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(leftBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                leftBtn.style.opacity = "0.5";
                setTimeout(function() {
                    leftBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.changeLevel(-1);
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(leftBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(rightBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                rightBtn.style.opacity = "0.5";
                setTimeout(function() {
                    rightBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.changeLevel(1);
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(rightBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(pauseBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                pauseBtn.style.opacity = "0.5";
                setTimeout(function() {
                    pauseBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.pauseGame();
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(pauseBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(achievBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                achievBtn.style.opacity = "0.5";
                setTimeout(function() {
                    achievBtn.style.opacity = "1.0";
                    if (constants.PLATFORM === "fireos") {
                        setTimeout(function() {
                            buttonPressed = 0;
                            playBoard.stopSound('click');
                            playBoard.showMessage(constants.NO_LEAD, 0);
                        }, 100);
                    } else {
                        setTimeout(function() {
                            buttonPressed = 0;
                            playBoard.stopSound('click');
                            if (navigator.connection.type === Connection.NONE) {
                                playBoard.storeTimerState();
                                var localProgress = localStorage.getItem("levelProgress");
                                if (localProgress === null) {
                                    playBoard.showMessage(constants.COMM_ERROR, 0);
                                } else {
                                    playBoard.showMessage("<small>" + constants.LOCAL_PROG + localProgress +
                                        constants.SNAKES + ".<br>" + constants.CHECK_CONN + "</small>");
                                }
                            } else {
                                playBoard.restoreTimerState();
                                gapi.showLeaderboard(constants.LEAD_GAME_PROGRESS);
                            }
                        }, 100);
                    }
                }, 100);
            }, false);

            SNAKE.addEventListener(achievBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(leadBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                leadBtn.style.opacity = "0.5";
                setTimeout(function() {
                    leadBtn.style.opacity = "1.0";
                    if (constants.PLATFORM === "fireos") {
                        setTimeout(function() {
                            buttonPressed = 0;
                            playBoard.stopSound('click');
                            playBoard.showMessage(constants.NO_LEAD, 0);
                        }, 100);
                    } else {
                        setTimeout(function() {
                            buttonPressed = 0;
                            playBoard.stopSound('click');
                            if (navigator.connection.type === Connection.NONE) {
                                playBoard.storeTimerState();
                                var bestTimeInt = localStorage.getItem("bestTime");
                                if (bestTimeInt === null) {
                                    playBoard.showMessage(constants.COMM_ERROR, 0);
                                } else {
                                    playBoard.showMessage("<small>" + constants.LOCAL_REC +
                                        Number(bestTimeInt / 1000).toFixed(3) + constants.TIME +
                                        ".<br>" + constants.CHECK_CONN + "</small>");
                                }
                            } else {
                                playBoard.restoreTimerState();
                                gapi.showLeaderboard(constants.LEAD_FASTEST_SNAKE_KILLER);
                            }
                        }, 100);
                    }
                }, 100);
            }, false);

            SNAKE.addEventListener(leadBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(replayBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                replayBtn.style.opacity = "0.5";
                setTimeout(function() {
                    replayBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.stopSound('click');
                        playBoard.newGame();
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(replayBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(restBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                restBtn.style.opacity = "0.5";
                setTimeout(function() {
                    restBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.stopSound('click');
                        playBoard.newGame();
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(restBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(resmBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                resmBtn.style.opacity = "0.5";
                setTimeout(function() {
                    resmBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.stopSound('click');
                        playBoard.resumeGame();
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(resmBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(sndBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                sndBtn.style.opacity = "0.5";
                setTimeout(function() {
                    sndBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.stopSound('click');
                        var playSound = localStorage.getItem("playSound");
                        if (playSound === null)
                            playSound = 'on';
                        else
                            playSound = (playSound === 'on') ? 'off' : 'on';
                        localStorage.setItem("playSound", playSound);
                        sndBtn.style.backgroundImage = (playSound === 'on') ?
                            "url(./res/images/sound_on.png)" :
                            "url(./res/images/sound_off.png)";
                        volBtn.style.backgroundImage = (playSound === 'on') ?
                            "url(./res/images/sound_on.png)" :
                            "url(./res/images/sound_off.png)";
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(sndBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(volBtn, "touchstart", function (evt) {
                evt.stopPropagation();
                if (buttonPressed !== 0) { return; }
                buttonPressed = 1;
                playBoard.playbackSound('click', false);
                volBtn.style.opacity = "0.5";
                setTimeout(function() {
                    volBtn.style.opacity = "1.0";
                    setTimeout(function() {
                        buttonPressed = 0;
                        playBoard.stopSound('click');
                        var playSound = localStorage.getItem("playSound");
                        if (playSound === null)
                            playSound = 'on';
                        else
                            playSound = (playSound === 'on') ? 'off' : 'on';
                        localStorage.setItem("playSound", 'on');
                        if (playSound === 'on') {
                            volBtn.style.backgroundImage =
                                "url(./res/images/sound_on.png)";
                            sndBtn.style.backgroundImage =
                                "url(./res/images/sound_on.png)";
                            playBoard.playbackSound('back', true);
                        } else {
                            volBtn.style.backgroundImage =
                                "url(./res/images/sound_off.png)";
                            sndBtn.style.backgroundImage =
                                "url(./res/images/sound_off.png)";
                            playBoard.stopSound('back');
                        }
                        localStorage.setItem("playSound", playSound);
                    }, 100);
                }, 100);
            }, false);

            SNAKE.addEventListener(volBtn, "touchend", function (evt) {
                evt.stopPropagation();
            }, false);

            SNAKE.addEventListener(phoneScreen, "keyup", function (evt) {
                if (!evt) evt = window.event;
                evt.cancelBubble = true;
                if (evt.stopPropagation) {evt.stopPropagation();}
                if (evt.preventDefault) {evt.preventDefault();}
                return false;
            }, false);

            if (constants.CONTROL === "swipe") {
                var swipe = new SNAKE.Swipe({phoneScreen:phoneScreen});
            } else {
                SNAKE.addEventListener(phoneScreen, "touchstart", function (evt) {
                    playBoard.setDirection(-1);
                    if (!evt) evt = window.event;
                    evt.cancelBubble = true;
                    if (evt.stopPropagation) {evt.stopPropagation();}
                    if (evt.preventDefault) {evt.preventDefault();}
                    return false;
                }, false);
            }

            phoneScreen.className = "phoneScreen";

            phoneScreen.appendChild(playField);
            phoneScreen.appendChild(timerPanel);
            phoneScreen.appendChild(helpPanel);
            phoneScreen.appendChild(playBtn);
            phoneScreen.appendChild(leftBtn);
            phoneScreen.appendChild(rightBtn);
            phoneScreen.appendChild(pauseBtn);
            phoneScreen.appendChild(achievBtn);
            phoneScreen.appendChild(leadBtn);
            phoneScreen.appendChild(sndBtn);
            phoneScreen.appendChild(volBtn);
            phoneScreen.appendChild(replayBtn);
            phoneScreen.appendChild(resmBtn);
            phoneScreen.appendChild(restBtn);
            adPanel.appendChild(adImage);
            adPanel.appendChild(adText);
            adImage.appendChild(adIcon);
        }

        function nameToIndex(name) {
            for (var index = 0; index < sounds.length; index++) {
                if (sounds[index] === name) {
                    return index;
                }
            }
            return -1;
        }

        function createAudioContext() {

            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                if (audioContext.sampleRate !== 44100) {
                    var buffer = audioContext.createBuffer(1, 1, 44100);
                    var dummy = audioContext.createBufferSource();
                    dummy.buffer = buffer;
                    dummy.connect(audioContext.destination);
                    dummy.start(0);
                    dummy.disconnect();
                    audioContext.close();
                    audioContext = new AudioContext();
                }
            }
            catch(e) {
                console.log('Web Audio API is not supported');
            }
        }

        function preloadWebAudioSounds() {

            if (loadIndex === sounds.length ||
                loadFailures === 100) {
                console.log('Loading Web sounds finished');
                navigator.splashscreen.hide();
                if (deviceReady) {
                    playBoard.playbackSound('crunch', false);
                    deviceReady = false;
                }
                loadIndex = 0;
                loadFailures = 0;
                return;
            }

            console.log('Loading ' + sounds[loadIndex]);

            var request = new XMLHttpRequest();
            request.open('GET', 'res/sounds/' + sounds[loadIndex] + constants.AUDIO_FORMAT, true);
            request.responseType = 'arraybuffer';

            // Decode asynchronously
            request.onload = function() {
                console.log(sounds[loadIndex] + ' preload success');
                audioContext.decodeAudioData(request.response,
                    function(buffer) {
                        audioBuffer[loadIndex] = buffer;
                        console.log(sounds[loadIndex] + ' decode success');
                        loadIndex++;
                        preloadWebAudioSounds();
                    },
                    function(e) {
                        console.log(sounds[loadIndex] + ' decode error ' + e.err);
                        loadFailures++;
                        preloadWebAudioSounds();
                    }
                );
            }
            request.onerror = function() {
                console.log(sounds[loadIndex] + ' preload error ' + loadFailures);
                loadFailures++;
                preloadWebAudioSounds();
            }

            request.send();
        }

        function unloadWebAudioSounds(exit) {

            for (var index = 0; index < sounds.length; index++) {
                delete audioBuffer[index];
                audioBuffer[index] = null;
            }
            console.log('Unloading Web sounds finished');
            loadIndex = 0;
            loadFailures = 0;
            if (exit) {
                navigator.app.exitApp();
            }
        }

        function preloadNativeAudioSounds() {

            if (loadIndex === sounds.length ||
                loadFailures === 100) {
                console.log('Loading Native sounds finished');
                navigator.splashscreen.hide();
                if (deviceReady) {
                    playBoard.playbackSound('crunch', false);
                    deviceReady = false;
                }
                loadIndex = 0;
                loadFailures = 0;
                return;
            }

            console.log('Loading ' + sounds[loadIndex]);

            if (window.plugins && window.plugins.NativeAudio) {
                window.plugins.NativeAudio.preloadComplex(sounds[loadIndex],
                    'res/sounds/' + sounds[loadIndex] + constants.AUDIO_FORMAT, 1, 1, 0,
                    function(msg) {
                        console.log(sounds[loadIndex] + ' preload success');
                        loadIndex++;
                        preloadNativeAudioSounds();
                    },
                    function(msg) {
                        console.log(sounds[loadIndex] + ' preload error ' + loadFailures);
                        loadFailures++;
                        preloadNativeAudioSounds();
                    }
                );
            }
        }

        function unloadNativeAudioSounds(exit) {

            if (loadIndex === sounds.length ||
                loadFailures === 100) {
                console.log('Unloading Native sounds finished');
                loadIndex = 0;
                loadFailures = 0;
                if (exit) {
                    navigator.app.exitApp();
                }
                return;
            }

            console.log('Unloading ' + sounds[loadIndex]);

            if (window.plugins && window.plugins.NativeAudio) {
                window.plugins.NativeAudio.unload(sounds[loadIndex],
                    function(msg) {
                        console.log(sounds[loadIndex] + ' unload success');
                        loadIndex++;
                        unloadNativeAudioSounds(exit);
                    },
                    function(msg) {
                        console.log(sounds[loadIndex] + ' unload error ' + loadFailures);
                        loadFailures++;
                        unloadNativeAudioSounds(exit);
                    }
                );
            }
        }

        playBoard.getLevel = function() {

            return level;
        };

        playBoard.setupMedia = function() {

            var playSound = localStorage.getItem("playSound");
            if (playSound === null)
                localStorage.setItem("playSound", 'on');

            createAudioContext();
            if (audioContext === null) {
                console.log("Start loading Native sounds");
                preloadNativeAudioSounds();
            } else {
                console.log("Start loading Web sounds");
                preloadWebAudioSounds();
            }
        };

        playBoard.unInitialize = function(exit) {

            if (audioContext === null) {
                console.log("Start unloading Native sounds");
                unloadNativeAudioSounds(exit);
            } else {
                console.log("Start unloading Web sounds");
                unloadWebAudioSounds(exit);
            }
        };

        playBoard.playbackSound = function(name, loop) {

            var playSound = localStorage.getItem("playSound");
            if (playSound && playSound === 'on') {
                if (audioContext === null) {
                    if (loop) {
                        window.plugins.NativeAudio.loop(name,
                            function(msg) {
                                //console.log(name + ' loop success');
                            },
                            function(msg) {
                                //console.log(name + ' loop error: ' + msg);
                            }
                        );
                    } else {
                        window.plugins.NativeAudio.play(name,
                            function(msg) {
                                //console.log(name + ' play success');
                            },
                            function(msg) {
                                //console.log(name + ' play error: ' + msg);
                            }
                        );
                    }
                } else {
                    var index = nameToIndex(name);
                    if (index !== -1 && audioBuffer[index] !== null) {
                        // Stop sound if any
                        if (audioSource[index] !== null) {
                            audioSource[index].stop(0);
                            audioSource[index] = null;
                        }
                        // Create new sound source
                        audioSource[index] = audioContext.createBufferSource();
                        // Tell the source which sound to play
                        audioSource[index].buffer = audioBuffer[index];
                        // Connect the source to the context's destination (the speakers)
                        audioSource[index].connect(audioContext.destination);
                        audioSource[index].loop = loop;
                        audioSource[index].start(0);
                    }
                }
            }
        };

        playBoard.stopSound = function(name) {

            var playSound = localStorage.getItem("playSound");
            if (playSound && playSound === 'on') {
                if (audioContext === null) {
                    window.plugins.NativeAudio.stop(name,
                        function(msg) {
                            //console.log(name + ' stop success');
                        },
                        function(msg) {
                            //console.log(name + ' stop error: ' + msg);
                        }
                    );
                } else {
                    var index = nameToIndex(name);
                    if (index !== -1 && audioSource[index] !== null) {
                        audioSource[index].stop(0);
                        audioSource[index] = null;
                    }
                }
            }
        };

        playBoard.setDirection = function(n) {

            return snakeBody.setDirection(n);
        };

        playBoard.getColor = function(index) {

            return colorsRgb[index];
        };

        playBoard.getColorIndex = function(color) {

            for (var index = 0; index < colorsRgb.length; index++) {
                if (color === colorsRgb[index])
                    return index;
            }
            return 0;
        };

        playBoard.storeTimerState = function() {

            currentTime = timerPanel.innerHTML;
            currentColor = timerPanel.style.color;
            leftBtn.style.display = "none";
            rightBtn.style.display = "none";
        };

        playBoard.restoreTimerState = function() {

            if (passTime === 0) {
                timerPanel.innerHTML = levelMessage;
                if (lockedLevel) {
                    timerPanel.style.color = constants.HEX_GREY;
                } else {
                    timerPanel.style.color = constants.HEX_BLUE;
                }
                leftBtn.style.display = "inline";
                rightBtn.style.display = "inline";
            } else if (currentTime && currentColor) {
                timerPanel.innerHTML = currentTime;
                timerPanel.style.color = currentColor;
            }
            currentTime = 0;
            currentColor = 0;
            backButtonPressed = 0;
        };

        playBoard.showMessage = function(message, back) {

            playBoard.storeTimerState();
            timerPanel.innerHTML = message;
            timerPanel.style.color = constants.HEX_RED;
            backButtonPressed = back;
        };

        playBoard.initTimer = function() {

            prevTime = 0;
            passTime = 0;
            backButtonPressed = 0;
            timerPanel.style.color = constants.HEX_BLUE;
            timerPanel.innerHTML = levelMessage;
            if (maxLevel) {
                leftBtn.style.display = "inline";
                rightBtn.style.display = "inline";
            }
        };

		    playBoard.startTimer = function() {

            leftBtn.style.display = "none";
            rightBtn.style.display = "none";
            prevTime = new Date().getTime();
            if (passTime >= playTime * 1000 - 5000) {
                timerPanel.style.color = constants.HEX_RED;
            } else {
                if (passTime === 0) {
                    timerPanel.innerHTML = "";
                }
                timerPanel.style.color = constants.HEX_GREEN;
            }
		    };

		    playBoard.setTimer = function() {

            var curTime = new Date().getTime();
            passTime += (curTime - prevTime);
            prevTime = curTime;
            if (passTime >= playTime * 1000 - 5000) {
                timerPanel.style.color = constants.HEX_RED;
            }
            if (passTime >= playTime * 1000) {
                timerPanel.innerHTML = "<big>" + playTime + "</big>";
                snakeBody.pauseGame();
                playBoard.gameOver();
                return 1;
            } else {
                timerPanel.innerHTML = "<big>" +
                    Math.floor(passTime / 1000) + "</big>";
            }
            return 0;
		    };

        playBoard.getGameStatus = function() {

            return gameStatus;
        };

        playBoard.playGame = function() {

            playBoard.restoreTimerState();
            gameStatus = 1;
            playBoard.playbackSound('back', true);
            playBtn.style.display = "none";
            pauseBtn.style.display = "inline";
            if (level === 0) {
                foodBlock.setTrainingMode();
                helpSwitch = 0;
                helpPanel.style.color = constants.HEX_RED;
                helpPanel.innerHTML = setFontSize(constants.HELP);
                playBoard.hideInstructions();
            }
            achievBtn.style.display = "none";
            leadBtn.style.display = "none";
            sndBtn.style.display = "none";
            volBtn.style.display = "inline";
            playBoard.stopChangeButtonSize();
            phoneScreen.focus();
			      playBoard.startTimer();
			      snakeBody.go(0);
        };

        playBoard.changeLevel = function(direction) {

            var newLevel = level + direction;
            if ((lockedLevel && direction <= 0) || // Show the max unlocked level when return from locked level
                newLevel === maxLevel) { // Show the max unlocked level with progress
                lockedLevel = 0;
                playBoard.setLevel();
                playBoard.placeFood();
                return;
            }
            if (newLevel < 0 || newLevel > constants.FUTURE_LEVEL - 1) {
                return;
            } else if (newLevel > maxLevel) {
                var index = levelIndex(newLevel);
                levelMessage = setFontSize(constants.LEVEL + (index + 1) +
                    "<br>" + calcLevelTime(newLevel) + constants.TIME);
                playBoard.hideInstructions();
                timerPanel.style.color = constants.HEX_GREY;
                timerPanel.innerHTML = levelMessage;
                lockedLevel = 1;
            } else {
                setPlayTime(newLevel);
                timerPanel.style.color = constants.HEX_BLUE;
                timerPanel.innerHTML = levelMessage;
                playBoard.placeFood();
            }
        };


        playBoard.showSnakeBanner = function() {

            if (!adPanel.parentNode) {
                playBoard.getBoardContainer().appendChild(adPanel);
            }
        }

        playBoard.hideSnakeBanner = function() {

            if (adPanel.parentNode) {
                playBoard.getBoardContainer().removeChild(adPanel);
            }
        }

        playBoard.showInstructions = function() {

            if (!instrPanel.parentNode) {
                instrIndex = 0;
                playBoard.getBoardContainer().appendChild(instrPanel);
            }
            if (maxLevel === 0) {
                achievBtn.style.display = "none";
                leadBtn.style.display = "none";
                sndBtn.style.display = "none";
                leftBtn.style.display = "none";
                rightBtn.style.display = "none";
                playBtn.style.left = playBtnCenter;
            }
        };

        playBoard.hideInstructions = function() {

            if (instrPanel.parentNode) {
                playBoard.getBoardContainer().removeChild(instrPanel);
            }
            if (maxLevel === 0) {
                playBtn.style.left = playBtnLeft;
                achievBtn.style.display = "inline";
                leadBtn.style.display = "inline";
                sndBtn.style.display = "inline";
                leftBtn.style.display = "inline";
                rightBtn.style.display = "inline";
            }
        };

        playBoard.setLevel = function() {

            if (gameStatus !== 1) {
                setPlayTime(-1);
                playBoard.initTimer();
            }
        };

        playBoard.newGame = function() {

            gapi.initAdMob();
            playBoard.hideSnakeBanner();
            playBoard.checkPackage();
            foodBlock.cleanupFood();
            snakeBody.cleanupSnake();
            playBoard.cleanupPlayField();
            playBoard.changeLevel(0);
            playBoard.initTimer();
            playBoard.stopChangeButtonSize();
            replayBtn.style.display = "none";
            resmBtn.style.display = "none";
            restBtn.style.display = "none";
            playBtn.style.display = "inline";
            pauseBtn.style.display = "none";
            achievBtn.style.display = "inline";
            leadBtn.style.display = "inline";
            sndBtn.style.display = "inline";
            volBtn.style.display = "none";
            if (level === 0) {
                helpPanel.innerHTML = "";
                playBoard.showInstructions();
            } else {
                playBoard.hideInstructions();
            }
            snakeBody.setupSnake();
            playBoard.playbackSound('crunch', false);
            buttons.push(playBtn);
            playBoard.startChangeButtonSize();
            gameStatus = 0;
        };

        playBoard.pauseGame = function() {

            if (gameStatus === 1) {
                gameStatus = 2;
                playBoard.stopSound('back');
                playBoard.stopChangeButtonSize();
                snakeBody.pauseGame();
                resmBtn.style.display = "inline";
                restBtn.style.display = "inline";
                pauseBtn.style.display = "none";
                if (level === 0) {
                    helpPanel.innerHTML = "";
                } else {
                    if (playBoard.useAdMob()) {
                        gapi.showAdMob();
                    } else {
                        playBoard.showSnakeBanner();
                    }
                    bannerCounter += 1;
                }
                volBtn.style.display = "none";
                var bestTimeInt = localStorage.getItem("bestTime");
                if (bestTimeInt === null || bestTimeInt === "0" || passTime < bestTimeInt) {
                    buttons.push(resmBtn);
                } else {
                    buttons.push(restBtn);
                }
                playBoard.startChangeButtonSize();
            }
        };

        playBoard.resumeGame = function() {

            playBoard.restoreTimerState();
            gameStatus = 1;
            playBoard.playbackSound('back', true);
            resmBtn.style.display = "none";
            restBtn.style.display = "none";
            pauseBtn.style.display = "inline";
            if (level === 0) {
                helpSwitch = 0;
                helpPanel.style.color = constants.HEX_RED;
                helpPanel.innerHTML = setFontSize(constants.HELP);
            }
            volBtn.style.display = "inline";
            gapi.hideAdMob();
            playBoard.hideSnakeBanner();
            playBoard.stopChangeButtonSize();
            phoneScreen.focus();
			      playBoard.startTimer();
			      snakeBody.go(0);
        };

        playBoard.gameOver = function() {

            if (gameStatus === 3)
                return;
            gameStatus = 3;
            playBoard.stopChangeButtonSize();
            setMessage();
            playBoard.stopSound('back');
            if (level > 0) {
                if (playBoard.useAdMob()) {
                    gapi.showAdMob();
                } else {
                    playBoard.showSnakeBanner();
                }
                bannerCounter += 1;
            }
        };

        playBoard.getHeadColor = function() {

            return snakeBody.getHeadColor();
        };

        playBoard.getNumOfRows = function() {
            return numOfRows;
        };

        playBoard.getNumOfColumns = function() {
            return numOfColumns;
        };

        playBoard.getPlayFieldTop  = function() {
            return playFieldTop;
        };

        playBoard.getPlayFieldLeft = function() {
            return playFieldLeft;
        };

        playBoard.setBoardContainer = function(boardContainer) {

            phoneScreen = document.getElementById(boardContainer); ;
            playField = null;
            playBoard.setupPhoneScreen();
        };

        playBoard.getBoardContainer = function() {
            return phoneScreen;
        };

        playBoard.getBlockWidth = function() {
            return blockWidth;
        };

        playBoard.getBlockHeight = function() {
            return blockHeight;
        };

        playBoard.toInt = function(strVal) {

            var intVal = 1000*strVal.charAt(0) +
                          100*strVal.charAt(1) +
                           10*strVal.charAt(3) +
                            1*strVal.charAt(4);
            return intVal;
        };

        playBoard.setupPhoneScreen = function () {

            createBoardElements();

            var cWidth, cHeight, cSize;
            cWidth = getClientWidth();
            cHeight = getClientHeight();
            cSize = Math.min(cWidth, cHeight);
            document.body.style.backgroundColor = constants.HEX_WHITE;

            var fSize = cSize - cSize % numOfRows;
            var fPixel = fSize / numOfRows;
            blockWidth = fPixel;
            blockHeight = fPixel;

            phoneScreen.style.left = "0px";
            phoneScreen.style.top = "0px";
            phoneScreen.style.width = cWidth + "px";
            phoneScreen.style.height = cHeight + "px";

            playFieldLeft = (cWidth - fSize) / 2;
            playFieldTop = (cHeight - fSize) / 2;

            playField.style.left =  playFieldLeft + "px";
            playField.style.top  =  playFieldTop + "px";
            playField.style.width = fSize + "px";
            playField.style.height = fSize + "px";

            adPanel.style.left = (cWidth - constants.BANNER_WIDTH) / 2 + "px";
            adPanel.style.top  = (cHeight - constants.BANNER_HEIGHT) / 2 + "px";
            adPanel.style.width = constants.BANNER_WIDTH + "px";
            adPanel.style.height = constants.BANNER_HEIGHT + "px";

            var imagePadding = (constants.BANNER_HEIGHT - constants.IMAGE_HEIGHT - constants.TEXT_HEIGHT) / 2;
            adImage.style.left =  (constants.BANNER_WIDTH - constants.IMAGE_WIDTH) / 2 + "px";
            adImage.style.top  =  imagePadding + "px";
            adImage.style.width = constants.IMAGE_WIDTH + "px";
            adImage.style.height = constants.IMAGE_HEIGHT + "px";

            adText.style.left =  "0px";
            adText.style.top  =  constants.IMAGE_HEIGHT + 2 * imagePadding + "px";
            adText.style.width = constants.TEXT_WIDTH + "px";
            adText.style.height = constants.TEXT_HEIGHT + "px";

            instrPanel.style.left =  playFieldLeft + "px";
            instrPanel.style.top  =  playFieldTop + "px";
            instrPanel.style.width = fSize + "px";
            instrPanel.style.height = fSize + "px";
            instrPanel.style.lineHeight = (cHeight - fSize) / 4 + "px";
            instrPanel.style.fontSize = (cHeight - fSize) / 10 + "px";

            timerPanel.style.top = (cHeight - fSize) / 8 + "px";
            timerPanel.style.width = cWidth + "px";
            timerPanel.style.height = (cHeight - fSize) / 4 + "px";
            timerPanel.style.lineHeight = (cHeight - fSize) / 4 + "px";
            timerPanel.style.left = "0px";
            timerPanel.style.fontSize = (cHeight - fSize) / 10 + "px";

            helpPanel.style.top = cHeight - 3 * (cHeight - fSize) / 8 + "px";
            helpPanel.style.width = cWidth + "px";
            helpPanel.style.height = (cHeight - fSize) / 4 + "px";
            helpPanel.style.lineHeight = (cHeight - fSize) / 4 + "px";
            helpPanel.style.left = "0px";
            helpPanel.style.fontSize = (cHeight - fSize) / 10 + "px";

            var btnSize = constants.BTN_SIZE;
            var btnOffset = (cHeight - fSize) / 4 - btnSize / 2;
            var btnGap = Math.min(btnSize, ((cWidth - 2 * btnOffset - 4 * btnSize) / 3));
            var btnOffsetLeft = (cWidth - 4 * btnSize - 3 * btnGap) / 2;
            var btnTop = playFieldTop + fSize + btnOffset;
            var btnUpTop = btnOffset;
            var btnLeft = btnOffsetLeft;
            var shiftLeft = btnSize + btnGap;
            var btnWidth = btnSize;
            var btnHeight = btnSize;

            playBtn.style.top =  btnTop + "px";
            playBtn.style.width = btnWidth + "px";
            playBtn.style.height = btnHeight + "px";
            playBtnLeft = btnLeft + "px";
            playBtnCenter = cWidth / 2 - btnWidth / 2 + "px";
            if (maxLevel === 0) {
                playBtn.style.left = playBtnCenter;
            } else {
                playBtn.style.left = playBtnLeft;
            }

            leftBtn.style.top =  btnUpTop + "px";
            leftBtn.style.left = btnLeft + "px";
            leftBtn.style.width = btnWidth + "px";
            leftBtn.style.height = btnHeight + "px";

            rightBtn.style.top =  btnUpTop + "px";
            rightBtn.style.left = btnLeft + 3 * shiftLeft + "px";
            rightBtn.style.width = btnWidth + "px";
            rightBtn.style.height = btnHeight + "px";

            pauseBtn.style.top =  btnUpTop + "px";
            pauseBtn.style.left = btnLeft + "px";
            pauseBtn.style.width = btnWidth + "px";
            pauseBtn.style.height = btnHeight + "px";

            achievBtn.style.top =  btnTop + "px";
            achievBtn.style.left = btnLeft + shiftLeft + "px";
            achievBtn.style.width = btnWidth + "px";
            achievBtn.style.height = btnHeight + "px";

            leadBtn.style.top =  btnTop + "px";
            leadBtn.style.left = btnLeft + 2 * shiftLeft + "px";
            leadBtn.style.width = btnWidth + "px";
            leadBtn.style.height = btnHeight + "px";

            sndBtn.style.top =  btnTop + "px";
            sndBtn.style.left = btnLeft + 3 * shiftLeft + "px";
            sndBtn.style.width = btnWidth + "px";
            sndBtn.style.height = btnHeight + "px";

            volBtn.style.top =  btnUpTop + "px";
            volBtn.style.left = btnLeft + 3 * shiftLeft + "px";
            volBtn.style.width = btnWidth + "px";
            volBtn.style.height = btnHeight + "px";

            replayBtn.style.top =  btnTop + "px";
            replayBtn.style.left = btnLeft + "px";
            replayBtn.style.width = btnWidth + "px";
            replayBtn.style.height = btnHeight + "px";

            resmBtn.style.top =  btnTop + "px";
            resmBtn.style.left = btnLeft + shiftLeft + "px";
            resmBtn.style.width = btnWidth + "px";
            resmBtn.style.height = btnHeight + "px";

            restBtn.style.top =  btnTop + "px";
            restBtn.style.left = btnLeft + 2 * shiftLeft + "px";
            restBtn.style.width = btnWidth + "px";
            restBtn.style.height = btnHeight + "px";

            playBoard.grid = [];

            for (var row = 0; row < numOfRows; row++) {
                playBoard.grid[row] = [];
                for (var col = 0; col < numOfColumns; col++) {
                    playBoard.grid[row][col] = createFieldBlock(row, col);
                }
            }

            foodBlock = new SNAKE.Food({field:playBoard});
            snakeBody = new SNAKE.Snake({field:playBoard, row:numOfRows, col:numOfColumns});

            keyListener = function(evt) {

                if (!evt) evt = window.event;
                var keyNum = (evt.which) ? evt.which : evt.keyCode;
                if (keyNum >= 37 && keyNum <= 40) {
                    snakeBody.setDirection(keyNum);
                }
                return true;
            };

            SNAKE.addEventListener(phoneScreen, "keydown", keyListener, false);
        };

        function setFontSize(message) {

            if (constants.PLATFORM === "ios") {
                if (getClientWidth() === 320 && getClientHeight() === 480) { // iPhone 3G, 3GS, 4, 4s
                    return "<normal>" + message + "</normal>";
                } else if ((getClientWidth() === 320 && getClientHeight() === 568) || // iPhone 5, 5s
                           (getClientWidth() === 375 && getClientHeight() === 667) || // iPhone 6, 6s
                           (getClientWidth() === 414 && getClientHeight() === 736)) { // iPhone 6 Plus
                    return "<small>" + message + "</small>";
                } else { // iPads
                    return "<normal>" + message + "</normal>";
                }
            } else {
                return "<normal>" + message + "</normal>";
            }
        }

        function setMessage() {

            if (timerPanel.innerHTML === '<big>' + playTime + '</big>') {
                timerPanel.style.color = constants.HEX_BLUE;
                timerPanel.innerHTML = setFontSize(constants.LOSE);
                playBoard.playbackSound('lose', false);
            } else {
                if (level == maxLevel) {  // Report progress only on last opened level
                    var localProgress = localStorage.getItem("levelProgress");
                    if (localProgress === null) {
                        localProgress = 1;
                    } else {
                        localProgress = parseInt(localProgress) + 1;
                    }
                    localStorage.setItem("levelProgress", localProgress);
                    if (navigator.connection.type !== Connection.NONE) {
                        gapi.submitScore(constants.LEAD_GAME_PROGRESS, localProgress);
                    }
                }
                if (level === 0) {
                    timerPanel.style.color = constants.HEX_RED;
                    timerPanel.innerHTML = setFontSize(constants.TRAINING_COMP);
                } else {
                    var bestTimeInt = localStorage.getItem("bestTime");
                    if (bestTimeInt === null || bestTimeInt === "0" || passTime < bestTimeInt) {
                        if (navigator.connection.type !== Connection.NONE) {
                            gapi.submitScore(constants.LEAD_FASTEST_SNAKE_KILLER, passTime);
                        }
                        localStorage.setItem("bestTime", passTime);
                        timerPanel.style.color = constants.HEX_RED;
                        var login = localStorage.getItem('login');
                        if (login && login === 'yes') {
                            timerPanel.innerHTML = setFontSize(Number(passTime / 1000).toFixed(3) +
                                constants.RECORD);
                        } else {
                            timerPanel.innerHTML = setFontSize(Number(passTime / 1000).toFixed(3) +
                                constants.LOCAL_RECORD);
                            if (constants.PLATFORM !== "fireos") {
                                buttons.push(leadBtn);
                            }
                        }
                    } else {
                        timerPanel.style.color = constants.HEX_GREEN;
                        timerPanel.innerHTML = setFontSize(Number(passTime / 1000).toFixed(3) +
                            constants.BEST + Number(bestTimeInt / 1000).toFixed(3) + ".");
                    }
                }
                playBoard.playbackSound('win', false);
            }
            replayBtn.style.display = "inline";
            achievBtn.style.display = "inline";
            leadBtn.style.display = "inline";
            sndBtn.style.display = "inline";
            pauseBtn.style.display = "none";
            if (level === 0) {
                helpPanel.innerHTML = "";
            }
            volBtn.style.display = "none";
            buttons.push(replayBtn);
            playBoard.startChangeButtonSize();
        }

        function createFieldBlock(row, col) {

            var fieldBlock = new FieldBlock();
            fieldBlock.elm = document.createElement("div");
            fieldBlock.elm.className = "foodBlock";
            fieldBlock.elm.style.width = playBoard.getBlockWidth() / 2 + "px";
            fieldBlock.elm.style.height = playBoard.getBlockHeight() / 2 + "px";
            fieldBlock.elm.style.left = playBoard.getPlayFieldLeft() +
                col * playBoard.getBlockWidth() + playBoard.getBlockWidth() / 4 + "px";
            fieldBlock.elm.style.top = playBoard.getPlayFieldTop() +
                row * playBoard.getBlockHeight() + playBoard.getBlockHeight() / 4 + "px";
            fieldBlock.elm.style.backgroundColor = constants.HEX_GREY;
            fieldBlock.elm.style.zIndex = 10;
            playBoard.getBoardContainer().appendChild(fieldBlock.elm);
            return fieldBlock;
        }

        playBoard.cleanupPlayField = function() {

            for (var row = 0; row < numOfRows; row++) {
                for (var col = 0; col < numOfColumns; col++) {
                    playBoard.grid[row][col].stat = 0;
                    playBoard.grid[row][col].elm.style.backgroundColor = constants.HEX_GREY;
                }
            }
        };

        playBoard.checkAhead = function(row, col) {

            if (gameStatus === 1) {
               return snakeBody.checkAhead(row, col);
            } else {
               if (row === constants.START_ROW) {
                   return 1;
               } else {
                   return 0;
               }
            }
        };

        playBoard.getFoodColor = function(row, col) {

            return foodBlock.getFoodColor(row, col);
        };

        playBoard.changeFoodSize = function() {

            if (level === 0) {
                foodBlock.changeFoodSize();
                if (helpSwitch === 0) {
                    helpPanel.style.color = constants.HEX_RED;
                    helpPanel.innerHTML = setFontSize(constants.HELP);
                } else if (helpSwitch === 3) {
                    var color = playBoard.getHeadColor();
                    var index = playBoard.getColorIndex(color);
                    helpPanel.style.color = colorsHex[index];
                    helpPanel.innerHTML = setFontSize(helpEat[index]);
                }
                helpSwitch++;
                if (helpSwitch === 6) {
                    helpSwitch = 0;
                }
            }
        };

        playBoard.placeFood = function() {

            foodBlock.cleanupFood();
            for (var row = 0; row < numOfRows; row++) {
                for (var col = 0; col < numOfColumns; col++) {
                    if (playBoard.grid[row][col].stat === -1) {
                        playBoard.grid[row][col].stat = 0;
                        playBoard.grid[row][col].elm.style.backgroundColor = constants.HEX_GREY;
                    }
                }
            }
            for (var index = 0; index < startFood; index++) {
                foodBlock.randomlyPlaceFood(-1, -1, 1);
            }
        };

        playBoard.foodEaten = function(row, col, match) {

            foodBlock.randomlyPlaceFood(row, col, 0);
            if (level === 0) {
                foodBlock.setTrainingMode();
            }
            if ((addFood === constants.CASUAL_FOOD && !match) ||
                 addFood === constants.INTERMEDIATE_FOOD ||
                 addFood === constants.ADVANCED_FOOD ||
                 addFood === constants.PROFESSIONAL_FOOD) {
                foodBlock.randomlyPlaceFood(-1, -1, 0);
            }
            if ((addFood === constants.ADVANCED_FOOD && !match) ||
                 addFood === constants.PROFESSIONAL_FOOD) {
                foodBlock.randomlyPlaceFood(-1, -1, 0);
            }
        };

        playBoard.setBoardContainer(gameConfig.boardContainer);
    };
})();

SNAKE.Swipe = (function() {

    return function(inputConfig) {

        // TOUCH-EVENTS SINGLE-FINGER SWIPE-SENSING JAVASCRIPT
        // Courtesy of PADILICIOUS.COM and MACOSXAUTOMATION.COM

        // this script can be used with one or more page elements to perform
        // actions based on them being swiped with a single finger

        var fingerCount = 0;
        var startX = 0;
        var startY = 0;
        var curX = 0;
        var curY = 0;
        var deltaX = 0;
        var deltaY = 0;
        var horzDiff = 0;
        var vertDiff = 0;
        var minLength = 0; // the shortest distance the user may swipe
        var swipeLength = 0;
        var swipeAngle = null;
        var swipeDirection = null;
        var gameArea = inputConfig.phoneScreen;

        // The 4 Touch Event Handlers

        // NOTE: the touchStart handler should also receive the ID of the triggering element
        // make sure its ID is passed in the event call placed in the element declaration, like:
        // <div id="picture-frame" ontouchstart="touchStart(event,'picture-frame');"  ontouchend="touchEnd(event);"
        // ontouchmove="touchMove(event);" ontouchcancel="touchCancel(event);">

        function touchStart(event) {
            // disable the standard ability to select the touched object
            event.preventDefault();
            // get the total number of fingers touching the screen
            fingerCount = event.touches.length;
            // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
            // check that only one finger was used
            if ( fingerCount == 1 ) {
                // get the coordinates of the touch
                startX = event.touches[0].pageX;
                startY = event.touches[0].pageY;
            } else {
                // more than one finger touched so cancel
                touchCancel(event);
            }
        }

        function touchMove(event) {
            event.preventDefault();
            if ( event.touches.length == 1 ) {
                curX = event.touches[0].pageX;
                curY = event.touches[0].pageY;
            } else {
                touchCancel(event);
            }
        }

        function touchEnd(event) {
            event.preventDefault();
            // check to see if more than one finger was used and that there is an ending coordinate
            if ( fingerCount == 1 && curX != 0 ) {
                // use the Distance Formula to determine the length of the swipe
                swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
                // if the user swiped more than the minimum length, perform the appropriate action
                if ( swipeLength >= minLength ) {
                    caluculateAngle();
                    determineSwipeDirection();
                    processingRoutine();
                    touchCancel(event); // reset the variables
                } else {
                    touchCancel(event);
                }
            } else {
                touchCancel(event);
            }
        }

        function touchCancel(event) {
            // reset the variables back to default values
            fingerCount = 0;
            startX = 0;
            startY = 0;
            curX = 0;
            curY = 0;
            deltaX = 0;
            deltaY = 0;
            horzDiff = 0;
            vertDiff = 0;
            swipeLength = 0;
            swipeAngle = null;
            swipeDirection = null;
        }

        function caluculateAngle() {
            var X = startX-curX;
            var Y = curY-startY;
            var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
            var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
            swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
            if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); }
        }

        function determineSwipeDirection() {
            if ( (swipeAngle <= 45) && (swipeAngle >= 0) ) {
                swipeDirection = 'left';
            } else if ( (swipeAngle <= 360) && (swipeAngle >= 315) ) {
                swipeDirection = 'left';
            } else if ( (swipeAngle >= 135) && (swipeAngle <= 225) ) {
                swipeDirection = 'right';
            } else if ( (swipeAngle > 45) && (swipeAngle < 135) ) {
                swipeDirection = 'down';
            } else {
                swipeDirection = 'up';
            }
        }

        function processingRoutine() {
            if ( swipeDirection == 'left' ) {
                SnakeBoard.setDirection(1);
            } else if ( swipeDirection == 'right' ) {
                SnakeBoard.setDirection(3);
            } else if ( swipeDirection == 'up' ) {
                SnakeBoard.setDirection(0);
            } else if ( swipeDirection == 'down' ) {
                SnakeBoard.setDirection(2);
            }
        }

        SNAKE.addEventListener(gameArea, "touchstart", touchStart, false);
        SNAKE.addEventListener(gameArea, "touchend", touchEnd, false);
        SNAKE.addEventListener(gameArea, "touchmove", touchMove, false);
        SNAKE.addEventListener(gameArea, "touchcancel", touchCancel, false);
    };
})();
