//Useful Math Functions

function normalizeVec(vec,c=1){
    let sumSqr = 0
    for(let i = 0;i<vec.length;i++){
        sumSqr += vec[i]**2
    }
    let norm = Math.sqrt(sumSqr)
    for(let i = 0;i<vec.length;i++){
        vec[i] = c*vec[i]/norm
    }    
    return vec
}

function normL2(vector){
    let mag = 0
    for(let i=0; i<vector.length;i++){
        mag+= vector[i]**2
    }
    return mag**.5
}

function innerProduct(vec1,vec2){
    console.assert(vec1.length==vec2.length)
    let sum = 0
    for(i=0;i<vec1.length;i++){
        sum += vec1[i]*vec2[i]
    }
    return sum
}

function randn() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function sumArray(array){
    //console.log(array)
    let out = 0
    for(let n = 0;n<array.length;n++){
        if(Array.isArray(array[n])){out+=sumArray(array[n])}        
        else{out+=Math.abs(array[n])} 
    }
    return out
}
function randomInt(max){return Math.floor(Math.random() * max);}

function atan2deg(vec){return 180 * Math.atan2(vec[1],vec[0]) / Math.PI}

function deg2rad(deg){return deg*Math.PI/180}

function rotateVec(vec,deg){deg = deg2rad(deg);
            return [vec[0]*Math.cos(deg)-vec[1]*Math.sin(deg),vec[0]*Math.sin(deg)+vec[1]*Math.cos(deg)]
}

function rad2deg(rad){return (rad/(2*Math.PI)) * 360}

function argMax(array){
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function argMin(array){
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

const argSort = (arr1, arr2) => arr1
.map((item, index) => [arr2[index], item]) // add the args to sort by
.sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
.map(([, item]) => item); // extract the sorted items


function sliceNdArray(inArray, slices=[],step=1){ //Slices is a list of lists of starts and stops       
    let start = slices[0][0] 
    let end = slices[0][1]        
    let outArray = []
    let ind = 0

    for(let s=start;s<end;s+=step){   
        if(slices.length>1){          
            outArray[ind] = sliceNdArray(inArray[s],slices.slice(1),step)             
        }else{ 
            outArray[ind] = inArray[s]  
        }
        ind++
    }
    return outArray 
}

function arange(start,stop=-1){
    if(stop=-1){
        stop = start
        start = 0
    }
    let inds = []
    for(let i = start;i<stop;i++){inds[i] = i}
    return inds
}

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }
  //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array