/**
 * Created by claudio on 26/11/16.
 */
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Array.prototype.isValidPoint = function (x, y) {
    "use strict";

    var obj = this[x];
    if (obj == undefined) return false;
    obj = obj[y];
    if (obj == undefined) return false;
    return true;
};
Array.prototype.mergeMatrix = function (matrix) {
    "use strict";

    return this.map(function (value, pos) {
        return value.map(function (value2, pos2) {
            var valueM = matrix[pos][pos2];
            if (!Array.isArray(value2)) {
                if (value2 == -1) return -1;
                if (!Array.isArray(valueM)) return 0;

                return valueM;
            }
            if (!Array.isArray(valueM)) return value2;
            return value2.concat(matrix[pos][pos2]);
        });
    });
};

Object.prototype.search = function (x, y, value) {
    "use strict";

    var obj = this;
    if (!Array.isArray(obj)) return false;
    if (!this.isValidPoint(x, y)) return false;
    obj = obj[x][y];
    if (!Array.isArray(obj)) return false;
    var ret = obj.indexOf(value);
    return ret >= 0;
};

Object.prototype.efficientSearch = function (x, y, value) {
    "use strict";

    var obj = this;
    obj = obj['k' + x];
    if (obj == undefined) return false;
    obj = obj['k' + y];
    if (obj == undefined) return false;
    if (!Array.isArray(obj)) return false;
    var ret = obj.indexOf(value);
    return ret >= 0;
};

Object.prototype.clone = function () {
    "use strict";

    return JSON.parse(JSON.stringify(this));
};

Math.randBounds = function (low, upper) {
    "use strict";

    var rnd = Math.random();
    rnd *= upper - low + 1; //+1 to reach the upper bound
    rnd = Math.floor(rnd);
    if (rnd > upper) //to fix the case where random returns exactly 1
        rnd = upper;
    rnd += low;
    return rnd;
};

Array.newWithElement = function (size, element) {
    "use strict";

    var ret = [];
    for (var i = 0; i < size; i++) {
        ret.push(element);
    }return ret;
};

// CONFIG
var LENGTH_SCORE = 1;
var ANGLE_SCORE = 5;
var OVERLAPPING_SCORE = 30;
var RIGHT_CONSTRAINT = true; //the arrows cannot come back in the horizontal line (if I start from the right side I can go only to left)
var ALLOW_TWO_ANGLES = false; //allow to have two near angles, in the case this bring to go to the original direction
var ANGLE_LIMITS = 3; //limits of the number of angle for each line, we can also use a number of angles greater than 3 since the Loss of performance is low
var NO_PATHS_GREATER_THAN = 2; //the limit is based on the best solution find until that moment
var ORDER_LOGIC = true; //this allows to adopt some heuristics to the generation algohorithm
var ADVANCED_DEBUG = false; //advanced debug log
var pointerClass = {};
/*
* BEST CONFIG for performance
* RIGHT_CONSTRAINT = true;
* ALLOW_TWO_ANGLES = false;
* ORDER_LOGIC = true;
 */
var counter = 0;

function bestMatrix(matrix, lines) {
    "use strict";

    return allMatrices(matrix, lines);
}

function allMatrices(matrix, lines) {
    "use strict";

    var t0 = new Date().getTime();
    counter = 0;
    var matrices = lines.map(function (line, pos) {
        return findMatricesOfLine(matrix, lines, pos + 1);
    });
    var t1 = new Date().getTime();
    console.log("Phase1 (generation data) " + (t1 - t0) + " milliseconds.", counter);

    //filtering
    //TODO maybe this is uselles sicne there are other checks like ORDER_LOGIC(?)
    t0 = new Date().getTime();
    var lengthBefore = 0;
    var lengthAfter = 0;
    matrices = matrices.map(function (matrix) {
        var bestMatrix = matrix.bestPath;
        lengthBefore += matrix.paths.length;
        var ret = matrix.paths.filter(function (path) {
            return path.level < bestMatrix * NO_PATHS_GREATER_THAN;
        }).map(function (path) {
            return path.path;
        });
        lengthAfter += ret.length;
        return ret;
    });
    t1 = new Date().getTime();
    console.log("Phase2 (filtering) " + (t1 - t0) + " milliseconds. Ration:", lengthBefore / lengthAfter, lengthBefore, lengthAfter);

    t0 = new Date().getTime();
    var combinationClassUsed = pointerClass == efficientPointer ? efficientCombinationClass : combinationClass;
    var combination = new combinationClassUsed(matrix).getCombinations(matrices).getCombination();
    t1 = new Date().getTime();
    console.log("Phase3 (combinations & score) " + (t1 - t0) + " milliseconds.");
    return combination;
}

var combinationClass = function () {
    function combinationClass() {
        _classCallCheck(this, combinationClass);

        this.bestCombination = [];
        this.score = 1000000;
        this.scoreTime = 0;
        this.mergeTime = 0;
    }

    _createClass(combinationClass, [{
        key: "getCombinations",
        value: function getCombinations(matrices, choosen, level) {
            "use strict";

            var _this = this;

            level = level || 0;
            choosen = choosen || Array.newWithElement(matrices.length, -1);
            var firstElement = level;
            //for(;choosen[firstElement]!=-1 && firstElement<choosen.length;firstElement++);
            if (firstElement == choosen.length) {
                var t0 = new Date().getTime();
                var merged = choosen.reduce(function (a, b, pos) {
                    return a.mergeMatrix(matrices[pos][b]);
                }, matrices[choosen.length - 1][choosen.pop()]); //remove last
                var t1 = new Date().getTime();
                this.mergeTime += t1 - t0;

                t0 = new Date().getTime();
                var score = calculateScore(merged);
                t1 = new Date().getTime();
                this.scoreTime += t1 - t0;
                if (score < this.score) {
                    this.score = score;
                    this.bestCombination = merged;
                }
                return this;
            }

            matrices[firstElement].forEach(function (value, pos) {
                var tmpChosen = choosen.clone();
                tmpChosen[firstElement] = pos;
                _this.getCombinations(matrices, tmpChosen, level + 1);
            });
            return this;
        }
    }, {
        key: "getCombination",
        value: function getCombination() {
            console.log('score', this.score);
            console.log('scoreTime', this.scoreTime);
            console.log('mergeTime', this.mergeTime);
            return this.bestCombination;
        }
    }]);

    return combinationClass;
}();

var efficientCombinationClass = function () {
    function efficientCombinationClass(baseMatrix) {
        _classCallCheck(this, efficientCombinationClass);

        this.bestCombination = [];
        this.score = 1000000;
        this.scoreTime = 0;
        this.mergeTime = 0;
        this.baseMatrix = baseMatrix;
    }

    _createClass(efficientCombinationClass, [{
        key: "getCombinations",
        value: function getCombinations(matrices, choosen, level) {
            "use strict";

            var _this2 = this;

            level = level || 0;
            choosen = choosen || Array.newWithElement(matrices.length, -1);
            var firstElement = level;

            if (firstElement == choosen.length) {
                var t0 = new Date().getTime();
                var merged = this.mergePaths(matrices, choosen);
                var t1 = new Date().getTime();
                this.mergeTime += t1 - t0;

                t0 = new Date().getTime();
                var score = efficientCalculateScore(merged);
                t1 = new Date().getTime();
                this.scoreTime += t1 - t0;
                if (score < this.score) {
                    this.score = score;
                    this.bestCombination = merged;
                }
                return this;
            }

            matrices[firstElement].forEach(function (value, pos) {
                var tmpChosen = choosen.clone();
                tmpChosen[firstElement] = pos;
                _this2.getCombinations(matrices, tmpChosen, level + 1);
            });
            return this;
        }
    }, {
        key: "mergePaths",
        value: function mergePaths(matrices, choosen) {
            var ret = {};
            choosen.forEach(function (cValue1, cKey1) {
                var matrix = matrices[cKey1][cValue1];
                Object.keys(matrix).forEach(function (key1) {
                    var value1 = matrix[key1];
                    if (ret[key1] == undefined) ret[key1] = {};
                    Object.keys(value1).forEach(function (key2) {
                        var value2 = value1[key2];
                        if (ret[key1][key2] == undefined) ret[key1][key2] = [];
                        ret[key1][key2] = ret[key1][key2].concat(value2);
                    });
                });
            });

            return ret;
        }
    }, {
        key: "getMatrix",
        value: function getMatrix(matrix) {
            return this.baseMatrix.map(function (value1, key1) {
                return value1.map(function (value2, key2) {
                    if (matrix['k' + key1] != undefined && matrix['k' + key1]['k' + key2] != undefined) return matrix['k' + key1]['k' + key2];
                    return value2;
                });
            });
        }
    }, {
        key: "getCombination",
        value: function getCombination() {
            console.log('score', this.score);
            console.log('scoreTime', this.scoreTime);
            console.log('mergeTime', this.mergeTime);
            return this.getMatrix(this.bestCombination);
        }
    }]);

    return efficientCombinationClass;
}();

function findMatricesOfLine(matrix, lines, pos) {
    "use strict";

    var x = lines[pos - 1][0][0];
    var y = lines[pos - 1][0][1];
    matrix = matrix.clone();
    var paths = new pathsClass(matrix, lines[pos - 1], pos, lines[pos - 1][0][1] < lines[pos - 1][1][1]);
    return { "paths": paths.allPaths(null, x, y), bestPath: paths.bestPath };
}

function calculateScore(matrix) {
    "use strict";

    var score = 0;
    for (var valueIndex = 0; valueIndex < matrix.length; valueIndex++) {
        var value = matrix[valueIndex];
        for (var value2Index = 0; value2Index < value.length; value2Index++) {
            var value2 = value[value2Index];
            if (!Array.isArray(value2)) continue;
            score += (value2.length - 1) * OVERLAPPING_SCORE;
            score += value2.length * LENGTH_SCORE;
            score += calculateAnglesNumber(matrix, valueIndex, value2Index) * ANGLE_SCORE;
        }
    }
    return score;
}

function calculateAnglesNumber(matrix, x, y) {
    "use strict";

    var values = matrix[x][y];
    return values.filter(function (value) {
        if (matrix.search(x - 1, y, value) && matrix.search(x, y + 1, value) || matrix.search(x - 1, y, value) && matrix.search(x, y - 1, value) || matrix.search(x + 1, y, value) && matrix.search(x, y + 1, value) || matrix.search(x + 1, y, value) && matrix.search(x, y - 1, value)) return true;
        return false;
    }).length;
}

function efficientCalculateScore(matrix) {
    "use strict";

    var score = 0;
    Object.keys(matrix).forEach(function (key1) {
        var value1 = matrix[key1];
        Object.keys(value1).forEach(function (key2) {
            var value2 = value1[key2];
            if (!Array.isArray(value2) || value2.length == 0) return;
            score += (value2.length - 1) * OVERLAPPING_SCORE;
            score += value2.length * LENGTH_SCORE;
            var angles = efficientCalculateAnglesNumber(matrix, parseInt(key1.substr(1)), parseInt(key2.substr(1)));
            score += angles * ANGLE_SCORE;
        });
    });

    return score;
}

function efficientCalculateAnglesNumber(matrix, x, y) {
    "use strict";

    var values = matrix['k' + x]['k' + y];
    return values.filter(function (value) {
        if (matrix.efficientSearch(x - 1, y, value) && matrix.efficientSearch(x, y + 1, value) || matrix.efficientSearch(x - 1, y, value) && matrix.efficientSearch(x, y - 1, value) || matrix.efficientSearch(x + 1, y, value) && matrix.efficientSearch(x, y + 1, value) || matrix.efficientSearch(x + 1, y, value) && matrix.efficientSearch(x, y - 1, value)) return true;
        return false;
    }).length;
}

var firstHDir = 0;

var pathsClass = function () {
    function pathsClass(baseMatrix, line, value, right) {
        _classCallCheck(this, pathsClass);

        this.bestPath = 1000000;
        this.baseMatrix = baseMatrix;
        this.line = line;
        this.value = value;
        this.right = right;
        this.pointerClass = pointerClass;
    }

    _createClass(pathsClass, [{
        key: "allPaths",
        value: function allPaths(pointer, x, y, level, angleInfo) {
            "use strict";

            var matrices = [];
            if (!pointer) {
                pointer = new this.pointerClass(this.baseMatrix);
                pointer.setValue(x, y, [this.value]);
            }

            level = level || 0;
            angleInfo = angleInfo || { direction: 0, turned: 0, previousDirection: 0, previousPreviousDirection: 0, turnedCounter: 0 };

            if (x == this.line[1][0] && y == this.line[1][1]) {
                if (level < this.bestPath) {
                    if (ADVANCED_DEBUG) console.log('new best path', level, this.bestPath);
                    this.bestPath = level;
                }

                return [{ "level": level, "path": pointer.getForPathVar() }];
            }

            if (angleInfo.turned) angleInfo.turnedCounter++;

            if (angleInfo.turnedCounter > ANGLE_LIMITS) return [];

            //TODO apply analogous idea with score (only length and angles)
            if (level + Math.abs(x - this.line[1][0]) + Math.abs(y - this.line[1][1]) > this.bestPath * NO_PATHS_GREATER_THAN) return [];

            //break if I have two parallel lines? without blank?
            if (angleInfo.turned >= 2 && (!ALLOW_TWO_ANGLES || angleInfo.direction != angleInfo.previousPreviousDirection && angleInfo.previousPreviousDirection != 0)) return [];

            //break if right and the limit was passed
            if (RIGHT_CONSTRAINT) {
                if (this.right && y > this.line[1][1]) return [];
                if (!this.right && y < this.line[1][1]) return [];
            }

            //break if try to go in a direction that I cannot reverse
            if (angleInfo.turnedCounter - 1 >= ANGLE_LIMITS && Math.abs(y - this.line[1][1]) > 1 && Math.abs(x - this.line[1][0]) > 1 && (x < this.line[1][0] && angleInfo.direction == 3 || x > this.line[1][0] && angleInfo.direction == 1 || y < this.line[1][0] && angleInfo.direction == 4 || y > this.line[1][0] && angleInfo.direction == 2)) return [];

            //break if I cannot reach the  target and I have not angles available
            if (angleInfo.turnedCounter >= ANGLE_LIMITS && ((angleInfo.direction == 1 || angleInfo.direction == 3) && Math.abs(y - this.line[1][1]) > 1 || //turn at the end
            (angleInfo.direction == 2 || angleInfo.direction == 4) && Math.abs(x - this.line[1][0]) > 1)) return [];

            var order = [1, 2, 3, 4];
            //TODO check this... do this only at the beginning?
            if (ORDER_LOGIC) {
                //TODO improve if equal do the vertical actions
                //width
                if (y < this.line[1][1]) {
                    order[0] = 2;
                    order[3] = 4;
                } else {
                    order[0] = 4;
                    order[3] = 2;
                }
                //height
                if (x <= this.line[1][0]) {
                    if (ADVANCED_DEBUG) if (firstHDir != 1) console.log('dir changed to', 1);
                    firstHDir = 1;
                    order[1] = 1;
                    order[2] = 3;
                } else {
                    if (ADVANCED_DEBUG) if (firstHDir != 3) console.log('dir changed to', 3);
                    firstHDir = 3;
                    order[1] = 3;
                    order[2] = 1;
                }
            }
            counter++;

            for (var i = 0; i <= 3; i++) {
                //no 180 angles
                if (angleInfo.direction == 1 && order[i] == 3 || angleInfo.direction == 3 && order[i] == 1 || angleInfo.direction == 4 && order[i] == 2 || angleInfo.direction == 2 && order[i] == 4) break;
                matrices = matrices.concat(this.nextStep(pointer, x, y, level, angleInfo, order[i]));
            }

            return matrices;
        }
    }, {
        key: "nextStep",
        value: function nextStep(pointer, x, y, level, angleInfo, direction) {
            "use strict";

            switch (direction) {
                case 1:
                    x += 1;
                    break;
                case 2:
                    y += 1;
                    break;
                case 3:
                    x -= 1;
                    break;
                case 4:
                    y -= 1;
                    break;
            }

            if (direction == 2 && !(this.right || !RIGHT_CONSTRAINT)) return [];

            if (direction == 4 && !(!this.right || !RIGHT_CONSTRAINT)) return [];

            if (pointer.isValidPoint(x, y) && pointer.getValue(x, y) == 0) {
                var tmpPointer = new this.pointerClass(pointer);
                tmpPointer.setValue(x, y, [this.value]);
                var tmpAngleInfo = angleInfo.clone();
                tmpAngleInfo.previousPreviousDirection = tmpAngleInfo.previousDirection;
                tmpAngleInfo.previousDirection = tmpAngleInfo.direction;
                tmpAngleInfo.direction = direction;
                if (tmpAngleInfo.direction != angleInfo.direction) tmpAngleInfo.turned++;else tmpAngleInfo.turned = 0;
                return this.allPaths(tmpPointer, x, y, level + 1, tmpAngleInfo);
            }
            return [];
        }
    }]);

    return pathsClass;
}();

var classicPointer = function () {
    function classicPointer(data) {
        _classCallCheck(this, classicPointer);

        if (Array.isArray(data)) {
            this.matrix = data;
            data = { "data": data };
        } else {
            if (data == undefined || data.matrix == undefined || !Array.isArray(data.matrix)) throw new Error('wrong data passed');
            this.matrix = data.matrix;
        }
        if (data == undefined || data.data == undefined || !Array.isArray(data.data)) throw new Error('wrong data passed');
        this.data = data.data.clone();
    }

    _createClass(classicPointer, [{
        key: "setValue",
        value: function setValue(x, y, value) {
            this.data[x][y] = value;
        }
    }, {
        key: "getValue",
        value: function getValue(x, y) {
            return this.data[x][y];
        }
    }, {
        key: "getCompleteArray",
        value: function getCompleteArray() {
            return this.data;
        }
    }, {
        key: "getForPathVar",
        value: function getForPathVar() {
            return this.getCompleteArray();
        }
    }, {
        key: "isValidPoint",
        value: function isValidPoint(x, y) {
            "use strict";

            var obj = this.matrix[x];
            if (obj == undefined) return false;
            obj = obj[y];
            if (obj == undefined) return false;
            return true;
        }
    }]);

    return classicPointer;
}();

var efficientPointer = function () {
    function efficientPointer(data) {
        _classCallCheck(this, efficientPointer);

        if (Array.isArray(data)) {
            this.matrix = data;
            data = { data: {} };
        } else {
            if (data == undefined || data.matrix == undefined || !Array.isArray(data.matrix)) throw new Error('wrong data passed');
            this.matrix = data.matrix;
        }
        if (data == undefined || data.data == undefined || _typeof(data.data) != 'object') throw new Error('wrong data passed');
        this.data = data.data.clone();
    }

    _createClass(efficientPointer, [{
        key: "setValue",
        value: function setValue(x, y, value) {
            //keys used to prevent big array length
            if (this.data['k' + x] == undefined) this.data['k' + x] = {};
            this.data['k' + x]['k' + y] = value;
        }
    }, {
        key: "getValue",
        value: function getValue(x, y) {
            var xData = this.data['k' + x] || {};
            return xData['k' + y] || this.matrix[x][y];
        }
    }, {
        key: "getCompleteArray",
        value: function getCompleteArray() {
            var _this3 = this;

            return this.matrix.map(function (value1, key1) {
                return value1.map(function (value2, key2) {
                    if (_this3.data['k' + key1] != undefined && _this3.data['k' + key1]['k' + key2] != undefined) return _this3.data['k' + key1]['k' + key2];
                    return value2;
                });
            });
        }
    }, {
        key: "getForPathVar",
        value: function getForPathVar() {
            return this.data;
        }
    }, {
        key: "isValidPoint",
        value: function isValidPoint(x, y) {
            "use strict";

            var obj = this.matrix[x];
            if (obj == undefined) return false;
            obj = obj[y];
            if (obj == undefined) return false;
            return true;
        }
    }]);

    return efficientPointer;
}();

//pointerClass = classicPointer;


pointerClass = efficientPointer;

if (typeof module != "undefined" && module != undefined) module.exports = bestMatrix;

var version = 0;
var myTimeOut = null;
if (typeof window != 'undefined' && window) myTimeOut = window.setTimeout;else myTimeOut = setTimeout;

if (typeof global.NO_PRINT_VERSION == 'undefined') myTimeOut(function () {
    console.log('Version:', version);
}, 1000);

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;

version++;
