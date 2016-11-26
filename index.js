/**
 * Created by claudio on 26/11/16.
 */
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

console.log(calculateScore(matrixDemo));
console.log(calculateScore(matrixDemo2));

function calculateScore(matrix){
    "use strict";
    var score = 0;
    matrix.forEach(value=> {
        value.forEach(value2=>{
            if(!Array.isArray(value2))
                return ;
            score += (value2.length-1)*overlappingScore;
            score += value2.length*lengthScore;
        });
    });
    return score;
}

