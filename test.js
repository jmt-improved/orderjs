/**
 * Created by claudio on 27/11/16.
 */
var lib = require('./index.js');


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
//console.log(bestMatrix(baseMatrix, lines));
var t0 = new Date().getTime();
 console.log(lib(complexMatrix, complexLines));
 var t1 = new Date().getTime();
 console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
