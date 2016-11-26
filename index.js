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
const lengthScore = 1;
const angleScore = 5;
const overlappingScore = 30;

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

/*console.log(calculateScore(matrixDemo));
console.log(calculateScore(matrixDemo2));
console.log(calculateScore(matrixDemo3));*/

//console.log(validateLine(matrixDemo, lines[1], 2));
//var random = randomMatrices(complexMatrix, complexLines);
var random = [];
baseMatrix.forEach((val, pos)=>val.forEach((val2,pos2)=>{random = random.concat(allPaths(baseMatrix, lines, pos, pos2, 1));}));
//console.log(random);
random.map(value=>console.log(value));
/*
 [ [ -1, -1, [ 1 ], -1 ],
 [ -1, -1, [ 1 ], -1 ],
 [ [ 1 ], [ 1 ], [ 1 ], 0 ],
 [ [ 1 ], [ 1 ], [ 1 ], 0 ] ]

 */
/*var tmpMatrix =  [ [ -1, -1, [ 1 ], -1 ],
    [ -1, -1, [ 1 ], -1 ],
    [ [ 1 ], [ 1 ], [ 1 ], 0 ],
    [ [ 1 ], [ 1 ], [ 1 ], 0 ] ];
console.log(validateLine(tmpMatrix, lines[0], 1));
console.log(tmpMatrix[lines[0][0][0]][lines[0][0][1]], tmpMatrix[lines[0][1][0]][lines[0][1][1]]);*/
//console.log(validateLines(matrixDemo, lines));

function calculateScore(matrix){
    "use strict";
    let score = 0;
    for(let valueIndex = 0; valueIndex<matrix.length;valueIndex++){
        let value = matrix[valueIndex];
        for(let value2Index = 0; value2Index < value.length; value2Index++) {
            let value2 = value[value2Index];
            if(!Array.isArray(value2))
                continue;
            score += (value2.length-1)*overlappingScore;
            score += value2.length*lengthScore;
            score += calculateAnglesNumber(matrix, valueIndex, value2Index)*angleScore;
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


function allPaths(matrix, line, x, y, value, level){
    "use strict";
    level = level || 0;
    var matrices = [];
    //console.log(x,y, level, matrix);
    /*if(level==30)
        if(validateLine(matrix, line[value-1], value))
            return [matrix];
        else
            return [];*/

    //TODO remove line


    //recursion
    var end = false;
    if(matrix.isValidPoint(x+1, y) && matrix[x+1][y] == 0){
        let tmpMatrix = matrix.clone();
        tmpMatrix[x+1][y] = [value];
        let tmp = allPaths(tmpMatrix, line, x+1, y, value, level+1);
        matrices = matrices.concat(tmp);
    }else
        end = true;

    if(matrix.isValidPoint(x, y+1) && matrix[x][y+1] == 0){
        let tmpMatrix = matrix.clone();
        tmpMatrix[x][y+1] = [value];
        let tmp = allPaths(tmpMatrix, line, x, y+1, value, level+1);
        matrices = matrices.concat(tmp);
    }else
        end = true;

    if(matrix.isValidPoint(x-1, y) && matrix[x-1][y] == 0){
        let tmpMatrix = matrix.clone();
        tmpMatrix[x-1][y] = [value];//[value+' '+level];
        let tmp = allPaths(tmpMatrix, line, x-1, y, value, level+1);
        matrices = matrices.concat(tmp);
    }else
        end = true;

    if(matrix.isValidPoint(x, y-1) && matrix[x][y-1] == 0){
        let tmpMatrix = matrix.clone();
        tmpMatrix[x][y-1] = [value];
        let tmp = allPaths(tmpMatrix, line, x, y-1, value, level+1);
        matrices = matrices.concat(tmp);
    }else
        end = true;

    if(end && validateLine(matrix, line[value-1], value))
        matrices.push(matrix);

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