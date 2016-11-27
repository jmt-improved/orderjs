/**
 * Created by claudio on 26/11/16.
 */
"use strict";

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
var ANGLE_LIMITS = 3; //limits of the number of angle for each line
var NO_PATHS_GREATER_THAN = 2; //the limit is based on the best solution find until that moment
var ORDER_LOGIC = true; //this allows to adopt some heuristics to the generation algohorithm
/*
* BEST CONFIG for performance
* RIGHT_CONSTRAINT = true;
* ALLOW_TWO_ANGLES = false;
* ORDER_LOGIC = true;
 */

function bestMatrix(matrix, lines) {
    "use strict";

    return allMatrices(matrix, lines);
}

function allMatrices(matrix, lines) {
    "use strict";

    var t0 = new Date().getTime();
    var matrices = lines.map(function (line, pos) {
        return findMatricesOfLine(matrix, lines, pos + 1);
    });
    var t1 = new Date().getTime();
    console.log("Phase1 (generation data) " + (t1 - t0) + " milliseconds.");

    //filtering
    t0 = new Date().getTime();
    matrices = matrices.map(function (matrix) {
        var bestMatrix = matrix.bestPath;
        return matrix.paths.filter(function (path) {
            return path.level < bestMatrix * NO_PATHS_GREATER_THAN;
        }).map(function (path) {
            return path.path;
        });
    });
    t1 = new Date().getTime();
    console.log("Phase2 (filtering) " + (t1 - t0) + " milliseconds.");

    t0 = new Date().getTime();
    var combination = new combinationClass().getCombinations(matrices).getCombination();
    t1 = new Date().getTime();
    console.log("Phase3 (combinations & score) " + (t1 - t0) + " milliseconds.");
    return combination;
}

var combinationClass = function () {
    function combinationClass() {
        _classCallCheck(this, combinationClass);

        this.bestCombination = [];
        this.score = 1000000;
    }

    _createClass(combinationClass, [{
        key: "getCombinations",
        value: function getCombinations(matrices, choosen, level) {
            "use strict";

            var _this = this;

            level = level || 0;
            choosen = choosen || Array.newWithElement(matrices.length, -1);
            var firstElement = 0;
            for (; choosen[firstElement] != -1 && firstElement < choosen.length; firstElement++) {}
            //console.log(level, firstElement, choosen);
            if (firstElement == choosen.length && choosen[firstElement] != -1) {
                var merged = choosen.reduce(function (a, b, pos) {
                    return a.mergeMatrix(matrices[pos][b]);
                }, matrices[choosen.length - 1][choosen.pop()]); //remove last
                var score = calculateScore(merged);
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
            console.log(this.score);
            return this.bestCombination;
        }
    }]);

    return combinationClass;
}();

function findMatricesOfLine(matrix, lines, pos) {
    "use strict";

    var x = lines[pos - 1][0][0];
    var y = lines[pos - 1][0][1];
    matrix = matrix.clone();
    matrix[x][y] = [pos];
    var paths = new pathsClass(lines[pos - 1], pos, lines[pos - 1][0][1] < lines[pos - 1][1][1]);
    return { "paths": paths.allPaths(matrix, x, y), bestPath: paths.bestPath };
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

var pathsClass = function () {
    function pathsClass(line, value, right) {
        _classCallCheck(this, pathsClass);

        this.bestPath = 1000000;
        this.line = line;
        this.value = value;
        this.right = right;
    }

    _createClass(pathsClass, [{
        key: "allPaths",
        value: function allPaths(matrix, x, y, level, angleInfo) {
            "use strict";

            var matrices = [];
            level = level || 0;
            angleInfo = angleInfo || { direction: 0, turned: 0, previousDirection: 0, previousPreviousDirection: 0, turnedCounter: 0 };

            if (x == this.line[1][0] && y == this.line[1][1]) {
                if (level < this.bestPath) this.bestPath = level;

                return [{ "level": level, "path": matrix }];
            }

            if (angleInfo.turned) angleInfo.turnedCounter++;

            if (angleInfo.turnedCounter > ANGLE_LIMITS) return [];

            if (level > angleInfo.bestPath * NO_PATHS_GREATER_THAN) return [];

            //break if I have two parallel lines? without blank?
            if (angleInfo.turned >= 2 && (!ALLOW_TWO_ANGLES || angleInfo.direction != angleInfo.previousPreviousDirection && angleInfo.previousPreviousDirection != 0)) return [];

            //TODO break if right and the limit was passed

            var order = [1, 2, 3, 4];
            if (ORDER_LOGIC) {
                //TODO improve if equal do the vertical actions
                if (y < this.line[1][1]) {
                    order[0] = 2;
                    order[3] = 4;
                } else {
                    order[0] = 4;
                    order[3] = 2;
                }
                if (x < this.line[1][0]) {
                    order[1] = 1;
                    order[2] = 3;
                } else {
                    order[1] = 1;
                    order[2] = 3;
                }
            }

            for (var i = 0; i <= 3; i++) {
                matrices = matrices.concat(this.nextStep(matrix, x, y, level, angleInfo, order[i]));
            }return matrices;
        }
    }, {
        key: "nextStep",
        value: function nextStep(matrix, x, y, level, angleInfo, direction) {
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

            if (matrix.isValidPoint(x, y) && matrix[x][y] == 0) {
                var tmpMatrix = matrix.clone();
                tmpMatrix[x][y] = [this.value];
                var tmpAngleInfo = angleInfo.clone();
                tmpAngleInfo.previousPreviousDirection = tmpAngleInfo.previousDirection;
                tmpAngleInfo.previousDirection = tmpAngleInfo.direction;
                tmpAngleInfo.direction = direction;
                if (tmpAngleInfo.direction != angleInfo.direction) tmpAngleInfo.turned++;else tmpAngleInfo.turned = 0;
                return this.allPaths(tmpMatrix, x, y, level + 1, tmpAngleInfo);
            }
            return [];
        }
    }]);

    return pathsClass;
}();

module.exports = bestMatrix;
