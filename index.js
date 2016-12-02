/**
 * Created by claudio on 26/11/16.
 */
"use strict";
Array.prototype.isValidPoint = function(x, y){
    "use strict";
    let obj = this[x];
    if(obj == undefined)
        return false;
    obj = obj[y];
    if(obj == undefined)
        return false;
    return true;
};
Array.prototype.mergeMatrix = function(matrix){
    "use strict";
    return this.map((value,pos)=>value.map((value2,pos2)=>{
        let valueM = matrix[pos][pos2];
        if(!Array.isArray(value2)){
            if(value2 == -1)
                return -1;
            if(!Array.isArray(valueM))
                return 0;

            return valueM;
        }
        if(!Array.isArray(valueM))
            return value2;
        return value2.concat(matrix[pos][pos2]);
        }));
};

Object.prototype.search = function(x, y,value){
    "use strict";
    let obj = this;
    if(!Array.isArray(obj))
        return false;
    if(!this.isValidPoint(x,y))
        return false;
    obj = obj[x][y];
    if(!Array.isArray(obj))
        return false;
    let ret = obj.indexOf(value);
    return ret>=0;
};

Object.prototype.clone = function(){
    "use strict";
    return JSON.parse(JSON.stringify(this));
};

Math.randBounds = function(low, upper){
    "use strict";
    let rnd = Math.random();
    rnd *= upper-low+1; //+1 to reach the upper bound
    rnd = Math.floor(rnd);
    if(rnd>upper) //to fix the case where random returns exactly 1
        rnd = upper;
    rnd += low;
    return rnd;
};

Array.newWithElement = function (size, element){
    "use strict";
    let ret = [];
    for(let i = 0; i <size; i++)
        ret.push(element);
    return ret;
};

// CONFIG
const LENGTH_SCORE = 1;
const ANGLE_SCORE = 5;
const OVERLAPPING_SCORE = 30;
const RIGHT_CONSTRAINT = true; //the arrows cannot come back in the horizontal line (if I start from the right side I can go only to left)
const ALLOW_TWO_ANGLES = false; //allow to have two near angles, in the case this bring to go to the original direction
const ANGLE_LIMITS = 3; //limits of the number of angle for each line, we can also use a number of angles greater than 3 since the Loss of performance is low
const NO_PATHS_GREATER_THAN = 2; //the limit is based on the best solution find until that moment
const ORDER_LOGIC = true; //this allows to adopt some heuristics to the generation algohorithm
const ADVANCED_DEBUG = false; //advanced debug log
/*
* BEST CONFIG for performance
* RIGHT_CONSTRAINT = true;
* ALLOW_TWO_ANGLES = false;
* ORDER_LOGIC = true;
 */
var counter = 0;



function bestMatrix(matrix, lines){
    "use strict";
    return allMatrices(matrix, lines);
}


function allMatrices(matrix, lines){
    "use strict";
    var t0 = new Date().getTime();
    counter = 0;
    let matrices = lines.map((line,pos)=>findMatricesOfLine(matrix,lines,pos+1));
    var t1 = new Date().getTime();
    console.log("Phase1 (generation data) " + (t1 - t0) + " milliseconds.", counter);

    //filtering
    //TODO maybe this is uselles sicne there are other checks like ORDER_LOGIC(?)
    t0 = new Date().getTime();
    let lengthBefore = 0;
    let lengthAfter = 0;
    matrices = matrices.map((matrix)=>{
        let bestMatrix = matrix.bestPath;
        lengthBefore += matrix.paths.length;
        let ret = matrix.paths
            .filter(path=>path.level<bestMatrix*NO_PATHS_GREATER_THAN)
            .map(path=>path.path);
        lengthAfter += ret.length;
        return ret;
    });
    t1 = new Date().getTime();
    console.log("Phase2 (filtering) " + (t1 - t0) + " milliseconds. Ration:", lengthBefore/lengthAfter, lengthBefore, lengthAfter);


    t0 = new Date().getTime();
    let combination = (new combinationClass()).getCombinations(matrices).getCombination();
    t1 = new Date().getTime();
    console.log("Phase3 (combinations & score) " + (t1 - t0) + " milliseconds.");
    return combination;
}

class combinationClass{

    constructor() {
        this.bestCombination = [];
        this.score = 1000000;
        this.scoreTime = 0;
    }

    getCombinations(matrices, choosen, level){
        "use strict";
        level = level || 0;
        choosen = choosen || Array.newWithElement(matrices.length, -1);
        let firstElement = 0;
        for(;choosen[firstElement]!=-1 && firstElement<choosen.length;firstElement++);
        //console.log(level, firstElement, choosen);
        if(firstElement==choosen.length && choosen[firstElement]!=-1) {
            let merged = choosen.reduce((a, b, pos)=>a.mergeMatrix(matrices[pos][b]), matrices[choosen.length-1][choosen.pop()]); //remove last
            let t0 = new Date().getTime();
            let score = calculateScore(merged);
            let t1 = new Date().getTime();
            this.scoreTime += t1-t0;
            if(score<this.score){
                this.score = score;
                this.bestCombination = merged;
            }
            return this;
        }

        matrices[firstElement]
            .forEach((value, pos)=>{
                let tmpChosen = choosen.clone();
                tmpChosen[firstElement] = pos;
                this.getCombinations(matrices, tmpChosen, level+1);
            });
        return this;
    }

    getCombination(){
        console.log('score', this.score);
        console.log('scoreTime', this.scoreTime);
        return this.bestCombination;
    }
}


function findMatricesOfLine(matrix, lines, pos){
    "use strict";
    var x = lines[pos-1][0][0];
    var y = lines[pos-1][0][1];
    matrix = matrix.clone();
    matrix[x][y] = [pos];
    var paths = new pathsClass(lines[pos-1], pos, lines[pos-1][0][1]<lines[pos-1][1][1]);
    return {"paths": paths.allPaths(matrix, x,y), bestPath: paths.bestPath};
}


function calculateScore(matrix){
    "use strict";
    let score = 0;
    for(let valueIndex = 0; valueIndex<matrix.length;valueIndex++){
        let value = matrix[valueIndex];
        for(let value2Index = 0; value2Index < value.length; value2Index++) {
            let value2 = value[value2Index];
            if(!Array.isArray(value2))
                continue;
            score += (value2.length-1)*OVERLAPPING_SCORE;
            score += value2.length*LENGTH_SCORE;
            score += calculateAnglesNumber(matrix, valueIndex, value2Index)*ANGLE_SCORE;
        }
    }
    return score;
}

function calculateAnglesNumber(matrix, x, y){
    "use strict";
    let values = matrix[x][y];
    return values.filter(value=>{
        if((matrix.search(x-1, y, value) && matrix.search(x,y+1,value))
        || (matrix.search(x-1,y,value) && matrix.search(x,y-1,value))
        || (matrix.search(x+1, y, value) && matrix.search(x,y+1,value))
        || (matrix.search(x+1,y,value) && matrix.search(x,y-1,value)))
            return true;
        return false;
    }).length;
}

var firstHDir = 0;

class pathsClass{
    constructor(line, value, right) {
        this.bestPath = 1000000;
        this.line = line;
        this.value = value;
        this.right = right;
    }

    allPaths(matrix, x, y, level, angleInfo){
        "use strict";
        var matrices = [];
        level = level || 0;
        angleInfo = angleInfo || {direction: 0, turned: 0, previousDirection: 0, previousPreviousDirection: 0, turnedCounter: 0};

        if(x == this.line[1][0] && y == this.line[1][1]) {
            if(level<this.bestPath) {
                if(ADVANCED_DEBUG)
                    console.log('new best path', level, this.bestPath);
                this.bestPath = level;
            }

            return [{"level": level, "path":matrix}];
        }

        if(angleInfo.turned)
            angleInfo.turnedCounter++;

        if(angleInfo.turnedCounter>ANGLE_LIMITS)
            return [];

        //TODO apply analogous idea with score (only length and angles)
        if((level+Math.abs(x-this.line[1][0])+Math.abs(y-this.line[1][1]))>(this.bestPath*NO_PATHS_GREATER_THAN))
            return [];

        //break if I have two parallel lines? without blank?
        if(angleInfo.turned>=2 && (!ALLOW_TWO_ANGLES || (angleInfo.direction != angleInfo.previousPreviousDirection && angleInfo.previousPreviousDirection != 0)))
            return [];

        //break if right and the limit was passed
        if(RIGHT_CONSTRAINT){
            if(this.right && y > this.line[1][1])
                return [];
            if(!this.right && y < this.line[1][1])
                return [];
        }

        //break if try to go in a direction that I cannot reverse
        if(angleInfo.turnedCounter-1>=ANGLE_LIMITS
            && Math.abs(y-this.line[1][1])>1 && Math.abs(x-this.line[1][0])>1
            && ((x<this.line[1][0] && angleInfo.direction == 3)
            || (x>this.line[1][0] && angleInfo.direction == 1)
            || (y<this.line[1][0] && angleInfo.direction == 4)
            || (y>this.line[1][0] && angleInfo.direction == 2)))
            return [];

        //break if I cannot reach the  target and I have not angles available
        if(angleInfo.turnedCounter>=ANGLE_LIMITS
            && (((angleInfo.direction == 1 || angleInfo.direction == 3) && Math.abs(y-this.line[1][1])>1) //turn at the end
            || ((angleInfo.direction == 2 || angleInfo.direction == 4) && Math.abs(x-this.line[1][0])>1)))
            return [];


        let order = [1,2,3,4];
        //TODO check this... do this only at the beginning?
        if(ORDER_LOGIC){
            //TODO improve if equal do the vertical actions
            //width
            if(y<this.line[1][1]){
                order[0] = 2;
                order[3] = 4;
            }else{
                order[0] = 4;
                order[3] = 2;
            }
            //height
            if(x<=this.line[1][0]){
                if(ADVANCED_DEBUG)
                    if(firstHDir!= 1)
                        console.log('dir changed to', 1);
                firstHDir = 1;
                order[1] = 1;
                order[2] = 3;
            }else{
                if(ADVANCED_DEBUG)
                    if(firstHDir!= 3)
                        console.log('dir changed to', 3);
                firstHDir = 3;
                order[1] = 3;
                order[2] = 1;
            }
        }
        counter++;

        for (let i = 0; i <=3; i++) {
            //no 180 angles
            if(angleInfo.direction == 1 && order[i] == 3
                || angleInfo.direction == 3 && order[i] == 1
                || angleInfo.direction == 4 && order[i] == 2
                || angleInfo.direction == 2 && order[i] == 4)
                break;
            matrices = matrices.concat(this.nextStep(matrix, x, y, level, angleInfo, order[i]));
        }

        return matrices;
    }

    nextStep(matrix, x, y, level, angleInfo, direction){
        "use strict";
        switch (direction){
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

        if(direction == 2 && !(this.right || !RIGHT_CONSTRAINT))
            return [];

        if(direction == 4 && !(!this.right || !RIGHT_CONSTRAINT))
            return [];

        if(matrix.isValidPoint(x, y) && matrix[x][y] == 0) {
            let tmpMatrix = matrix.clone();
            tmpMatrix[x][y] = [this.value];
            let tmpAngleInfo = angleInfo.clone();
            tmpAngleInfo.previousPreviousDirection = tmpAngleInfo.previousDirection;
            tmpAngleInfo.previousDirection = tmpAngleInfo.direction;
            tmpAngleInfo.direction = direction;
            if (tmpAngleInfo.direction != angleInfo.direction)
                tmpAngleInfo.turned++;
            else
                tmpAngleInfo.turned = 0;
            return this.allPaths(tmpMatrix, x, y, level + 1, tmpAngleInfo);
        }
        return [];
    }
}

if(typeof module != "undefined" && module != undefined)
    module.exports = bestMatrix;

var version = 0;
var myTimeOut = null;
if(typeof window != 'undefined' && window)
    myTimeOut = window.setTimeout;
else
    myTimeOut = setTimeout;

if(typeof global.NO_PRINT_VERSION == 'undefined')
    myTimeOut(()=>{
        console.log('Version:', version);
    },1000);

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

