/**
 * Created by claudio on 26/11/16.
 */
Object.prototype.search = function(x, y,value){
    "use strict";
    let obj = this;
    if(!Array.isArray(obj))
        return false;
    obj = obj[x];
    if(obj == undefined)
        return false;
    obj = obj[y];
    if(obj == undefined)
        return false;
    if(!Array.isArray(obj))
        return false;
    let ret = obj.indexOf(value);
    return ret>=0;
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

var arrows = [
    [[0,2],[2,0]],
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

console.log(calculateScore(matrixDemo));
console.log(calculateScore(matrixDemo2));
console.log(calculateScore(matrixDemo3));

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