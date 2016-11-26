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
console.log(randomMatrices(baseMatrix, lines));
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

function randomMatrices(model, lines){
    "use strict";
    let solutions = Array.newWithElement(100000, []);
    return solutions
        .map((value)=>{
            return  randomMatrix(model, lines);
        })
        .filter((matrix)=>{
            return validateLines(matrix, lines);
        });
}

function randomMatrix(matrix, lines){
    "use strict";
    return matrix
        .map(value=>{
           return value
               .map(value2=>{
                  if(value2==-1)
                      return value2;
                  return Math.randBounds(0,lines.length);
               });
        });
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
            //console.log(valueIndex, value2Index, value2, found, validPoint(matrix, valueIndex, value2Index, name),
            //    (valueIndex == line[0][0] && value2Index == line[0][1]),(valueIndex == line[1][0] && value2Index == line[1][1]));
            if(found)
                //TODO check that end or start has count == 1
                //end or start
                if ((valueIndex == line[0][0] && value2Index == line[0][1])
                        || (valueIndex == line[1][0] && value2Index == line[1][1])) {
                    if (count < 1) //this can cause more than one enter point in the start/end
                        return false;
                }else if (count<=1)
                    return false;
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