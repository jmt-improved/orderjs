/**
 * Created by claudio on 26/11/16.
 */

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
const LENGHT_SCORE = 1;
const ANGLE_SCORE = 5;
const OVERLAPPING_SCORE = 30;
const RIGHT_CONSTRAINT = true;

var baseMatrix = [
    [-1,-1,0,-1],
    [-1,-1,0,-1],
    [0,0,0,0],
    [0,0,0,0],
];

var lines = [
    [[0,2],[2,0]],
    [[2,3],[3,0]]
];

var oneLine = [
    [[0,2],[2,0]],
];


var complexMatrix = [
    [-1,-1,0,-1, 0, 0, 0],
    [-1,-1,0,-1, 0, 0, 0],
    [0,0,0,0, 0, 0, 0],
    [0,0,0,0, 0, 0, 0],
    [0,0,0,0, 0, 0, 0],
    [0,0,0,0, 0, 0, 0],
    [0,0,0,0, 0, 0, 0],
    [0,0,0,0, 0, 0, 0],
];

var complexLines = [
    [[0,4],[6,0]],
    [[2,3],[3,0]]
];

/*complexLines = [
    [[6,6],[0,4]],
    [[2,3],[3,0]]
];*/

var matrixDemo = [
    [-1,-1,[1],-1],
    [-1,-1,[1],-1],
    [[1],[1],[1],[2]],
    [[2],[2],[2],[2]],
];

var matrixDemo2 = [
    [-1,-1,[1],-1],
    [-1,-1,[1],-1],
    [[1],[1],[1,2],[2]],
    [[2],[2],[2],0],
];

var matrixDemo3 = [
    [-1,-1,[1],-1],
    [-1,-1,[1],-1],
    [[1],[1],[1,2],[2]],
    [[2],[2],[2],[2]],
]; //TODO in that case one more angle is counted for 2 because we don't know the "start", maybe we should enumerate the point of a line


//console.log(findMatricesOfLine(complexMatrix, complexLines, 1));
console.log(bestMatrix(complexMatrix, complexLines));

function bestMatrix(matrix, lines){
    "use strict";
    let score = 1000000;
    let ret = [];
    allMatrices(matrix, lines)
        .forEach((value)=>{
            let tmpScore = calculateScore(value);
            if(tmpScore<score){
                score = tmpScore;
                ret = value;
            }
        });
    console.log(score);
    return ret;
}


function allMatrices(matrix, lines){
    "use strict";
    let matrices = lines.map((line,pos)=>findMatricesOfLine(matrix,lines,pos+1));
    let combinations = getCombinations(matrices);
    return combinations;
}

function getCombinations(matrices, choosen, level){
    "use strict";
    level = level || 0;
    let combinations = [];
    choosen = choosen || Array.newWithElement(matrices.length, -1);
    let firstElement = 0;
    for(;choosen[firstElement]!=-1 && firstElement<choosen.length;firstElement++);
    //console.log(level, firstElement, choosen);
    if(firstElement==choosen.length && choosen[firstElement]!=-1) {
        return [choosen.reduce((a, b, pos)=>a.mergeMatrix(matrices[pos][b]), matrices[choosen.length-1][choosen.pop()])]; //remove last
    }

    matrices[firstElement]
        .forEach((value, pos)=>{
            let tmpChosen = choosen.clone();
            tmpChosen[firstElement] = pos;
            combinations = combinations.concat(getCombinations(matrices, tmpChosen, level+1));
        });
    return combinations;
}



function findMatricesOfLine(matrix, lines, pos){
    "use strict";
    var x = lines[pos-1][0][0];
    var y = lines[pos-1][0][1];
    return allPaths(matrix, lines[pos-1], x,y, pos, 0, lines[pos-1][0][1]<lines[pos-1][1][1]);
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
            score += value2.length*LENGHT_SCORE;
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


function allPaths(matrix, line, x, y, value, level, right, angleInfo){
    "use strict";
    //level = level || 0;
    var matrices = [];
    angleInfo = angleInfo || {direction: 0, turned: 0};

    if(x == line[1][0] && y == line[1][1])
        return [matrix];

    //break if I have two parallel lines? without blank?
    if(angleInfo.turned>=2)
        return [];


    //recursion
    var end = false;

    if(matrix.isValidPoint(x+1, y) && matrix[x+1][y] == 0){
        let tmpMatrix = matrix.clone();
        tmpMatrix[x+1][y] = [value];
        let tmpAngleInfo = angleInfo.clone();
        tmpAngleInfo.direction = 1;
        if(tmpAngleInfo.direction!=angleInfo.direction)
            tmpAngleInfo.turned++;
        else
            tmpAngleInfo.turned = 0;
        let tmp = allPaths(tmpMatrix, line, x+1, y, value, level+1, right,tmpAngleInfo);
        matrices = matrices.concat(tmp);
    }else
        end = true;

    if(right || !RIGHT_CONSTRAINT)
        if(matrix.isValidPoint(x, y+1) && matrix[x][y+1] == 0){
            let tmpMatrix = matrix.clone();
            tmpMatrix[x][y+1] = [value];
            let tmpAngleInfo = angleInfo.clone();
            tmpAngleInfo.direction = 2;
            if(tmpAngleInfo.direction!=angleInfo.direction)
                tmpAngleInfo.turned++;
            else
                tmpAngleInfo.turned = 0;
            let tmp = allPaths(tmpMatrix, line, x, y+1, value, level+1, right,tmpAngleInfo);
            matrices = matrices.concat(tmp);
        }else
            end = true;

    if(matrix.isValidPoint(x-1, y) && matrix[x-1][y] == 0){
        let tmpMatrix = matrix.clone();
        tmpMatrix[x-1][y] = [value];//[value+' '+level];
        let tmpAngleInfo = angleInfo.clone();
        tmpAngleInfo.direction = 3;
        if(tmpAngleInfo.direction!=angleInfo.direction)
            tmpAngleInfo.turned++;
        else
            tmpAngleInfo.turned = 0;
        let tmp = allPaths(tmpMatrix, line, x-1, y, value, level+1, right,tmpAngleInfo);
        matrices = matrices.concat(tmp);
    }else
        end = true;


    if(!right || !RIGHT_CONSTRAINT)
        if(matrix.isValidPoint(x, y-1) && matrix[x][y-1] == 0){
            let tmpMatrix = matrix.clone();
            tmpMatrix[x][y-1] = [value];
            let tmpAngleInfo = angleInfo.clone();
            tmpAngleInfo.direction = 4;
            if(tmpAngleInfo.direction!=angleInfo.direction)
                tmpAngleInfo.turned++;
            else
                tmpAngleInfo.turned = 0;
            let tmp = allPaths(tmpMatrix, line, x, y-1, value, level+1, right,tmpAngleInfo);
            matrices = matrices.concat(tmp);
        }else
            end = true;

    /*if(end && validateLine(matrix, line[value-1], value))
        matrices.push(matrix);*/


    return matrices;
}

function randomMatrices(model, lines){
    "use strict";
    let solutions = Array.newWithElement(1000, []);
    return solutions
        .map((value)=>{
            return  randomMatrix(model, lines);
        })
        .filter((matrix)=>{
            //return true;
            return validateLines(matrix, lines);
        });
}

function randomMatrix(matrix, lines){
    "use strict";
    return matrix
        .map((value, pos)=>{
           return value
               .map((value2, pos2)=>{
                  if(value2==-1)
                      return value2;
                  return valuesForPoint(matrix, pos, pos2, lines);
               });
        });
}

function valuesForPoint(matrix, x, y , lines){
    "use strict";
    let points = lines
        .map((line, pos)=>{return {"pos": pos, "line": line};})
        .filter(line=>inStartEnd(line.line, x, y))
        .map(line=>line.pos+1);
    //if there is at leas one start/end no other points
    if(points.length)
        return points;
    points = Array.newWithElement(Math.randBounds(0,lines.length), []);
    points = points
        .map(point=>Math.randBounds(1,lines.length))
        .filter((elem, pos, arr) =>  arr.indexOf(elem) == pos); //uinique
    if(points.length==0)
        return 0;
    return points;
}

function validateLines(matrix, lines) {
    "use strict";
    for(let i = 0; i<lines.length;i++)
        if(!validateLine(matrix, lines[i], i+1))
            return false;
    return true;
}

function validateLine(matrix, line, name){
    "use strict";
    if(!matrix.search(line[0][0],line[0][1],name) || !matrix.search(line[1][0],line[1][1],name))
        return false;

    for(let valueIndex = 0; valueIndex<matrix.length;valueIndex++){
        let value = matrix[valueIndex];
        for(let value2Index = 0; value2Index < value.length; value2Index++) {
            let value2 = value[value2Index];
            let count = validPoint(matrix, valueIndex, value2Index, name);
            let found = matrix.search(valueIndex, value2Index, name);
            //console.log(valueIndex, value2Index, value2, found, isValidPoint(matrix, valueIndex, value2Index, name),
            //    (valueIndex == line[0][0] && value2Index == line[0][1]),(valueIndex == line[1][0] && value2Index == line[1][1]));
            if(found) {
                //TODO check that end or start has count == 1
                //end or start
                if (inStartEnd(line, valueIndex, value2Index)) {
                    if (count < 1) //this can cause more than one enter point in the start/end
                        return false;
                } else if (count <= 1)
                    return false;
            }
        }
    }
    return true;
}

// point with a previous and following point
function validPoint(matrix, x, y, value){
    "use strict";
    let count = 0;
    if(matrix.search(x-1,y,value))
        count++;
    if(matrix.search(x+1,y,value))
        count++;
    if(matrix.search(x,y-1,value))
        count++;
    if(matrix.search(x,y+1,value))
        count++;
    return count;
}

function inStartEnd(line, x, y){
    "use strict";
    return (x == line[0][0] && y == line[0][1])
        || (x == line[1][0] && y == line[1][1]);
}