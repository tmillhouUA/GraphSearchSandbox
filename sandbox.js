///////////
//Settings
///////////

let width = 1890
let height = 900
let graphBorder = 50
let nodeBorder = 20
let nodeR = 7
let nodeGapInit = nodeR * 3
let plotWidth = width - 2*graphBorder
let plotHeight = height - 2*graphBorder
let nodesX = Math.floor((plotWidth-2*nodeBorder)/nodeGapInit)
let nodesY = Math.floor((plotHeight-2*nodeBorder)/nodeGapInit)
let nodeGapX = (plotWidth-2*nodeBorder) / (nodesX-1)
let nodeGapY = (plotHeight-2*nodeBorder) / (nodesY-1)
let nNodes = nodesX * nodesY
let initNode = ijToInd(Math.floor(nodesX/4),Math.floor(nodesY/2))
let goalNode = ijToInd(Math.floor(3*nodesX/4),Math.floor(nodesY/2))


console.log(`${nodesX} X ${nodesY}`)

let arrowL = 10
let graphColor = "rgb(75,75,75)"
let minNodeDist = 100
let allowedFails = 100
let branchFactor = 2

let speeds = [5,15,30,60,120]
let speed = 2
let fps = speeds[speed]
let stepByStep = false
let currentAlg = -1
let controlColor = "rgb(150,150,150)"

/////////////////
//Math Functions
/////////////////

function arrayOfZeros(rows, columns,val = 0){
    let zArray = []
    for(let i = 0; i<rows;i++){
        zArray[i] = []
        for(let j = 0; j<columns;j++){
            zArray[i][j] = val
        }
    }  
    return zArray  
}

function getDists(nodeLoc,nodeCoords){
    //Euclidean Distance
    let dists = []

    for(let i=0; i<nodeCoords.length;i++){
        let dist = ((nodeLoc[0]-nodeCoords[i][0])**2 + (nodeLoc[1]-nodeCoords[i][1])**2)**.5
        dists.push(dist)           
    }
    //console.log(dists)
    return dists
}

function aStarDist(nodeA,nodeB,graph){    
    let f = [nodeA]
    let v = []
    let p = [[nodeA]]
    let d  = 1
    while(f.length>0){ //if search not already finished
        let bestInd = 0
        let bestCost = Infinity
        for(let i=0; i<f.length;i++){
            let iCost = computeHueristic(p[f[i]])
            if(iCost<bestCost){
                bestInd = i
                bestCost = iCost
            }
        }
        let open = f.splice(bestInd,1)
        v.push(open[0])

        if(open == nodeB){ //if goal node found            
            return(computeCost(p[open]))           
                
        }else{ //if goal node NOT found
            for(let i=0; i<graph[open].length;i++){if(graph[open][i]==1){ //get children
                if(!v.includes(i) && !f.includes(i)){ //if child not visited and not on frontier
                    f.push(i) 
                    p[i]=p[open].concat([i])                    
                }
                if(!v.includes(i) && f.includes(i)){ //if child not visited and is on frontier 
                    currCost = computeHueristic(p[i])
                    thisCost = computeHueristic(p[open].concat([i]))                    
                    if(thisCost<currCost){ //see if this path to child is shorter 
                        p[i]=p[open].concat([i]) 
                    }                  
                }
            }   
            }

        }        
    }
    return Infinity
}

function getDistsGraph(node,graph){
    //Graph Distance
    let dists = []

    for(let i=0; i<edges.length;i++){        
        dists.push(aStarDist(node,i,graph))           
    }

    return dists
}

/////////////////////
//Draw Visualization
/////////////////////

//Create SVG
let pressed = 0
let sDown = 0
let gDown = 0 
let svg = d3.select('#viz').append('svg').attr("width",width).attr("height",height+25)

d3.select("body").on("mousedown",function(){d3.select(this).style("cursor", "not-allowed");return pressed=1})
                    .on("mouseup",function(){d3.select(this).style("cursor", "default");return pressed=0})
                    .on("keydown",function(){if(d3.event.keyCode == 83){return sDown=1};if(d3.event.keyCode == 71){return gDown=1}else{return 0}})
                    .on("keyup",function(){sDown=0;return gDown=0})

//Title

svg.append("text").text("Graph Search Sandbox")
                    .attr("dominant-baseline","middle")
                    .attr("text-anchor","start")
                    .attr("x",graphBorder).attr("y",2*graphBorder/3)
                    .attr("font-family", "monospace")
                    .attr("font-size",graphBorder/2)
                    .attr("fill","rgb(50,50,50)")   
                 
//Play Controls    

let playControls = svg.append("g").attr("transform",`translate(${width-graphBorder-200} ${(graphBorder-40)/2})`)

let helpMessage = playControls.append("text").text("Erase: Hold Click + Drag, Set Start: Hold S + Click, Set Goal: Hold G + Click")
                                            .attr("dominant-baseline","middle").attr("text-anchor","end")
                                            .attr("x",-10)
                                            .attr("y",20)
                                            .attr("font-family", "monospace")
                                            .attr("font-size",graphBorder/3)
                                            .attr("fill","rgb(100,100,100)")
                                            .attr("opacity",1)

function setHelp(message){
    helpMessage.text(message)
    helpMessage.transition().duration(200).attr("opacity",1)
}
function clearHelp(){
    helpMessage.transition().duration(200).attr("opacity",0)
}

let autoGlyph = playControls.append("path").attr("d","M 10 30 L 30 20 L 10 10 L 10 30 L 30 20")
                                        .attr("rx",10)
                                        .attr("fill","None")
                                        .attr("stroke", (function(){if(stepByStep){return controlColor}else{return "rgb(0,200,0)"}}))
                                        .attr("stroke-width",2)
                                        
let autoClick = playControls.append("rect").attr("x",0).attr("y",0)
                                            .attr("height", 40)
                                            .attr("width",39)
                                            .attr("rx",10)
                                            .attr("fill","rgba(0,0,0,0)")
                                            .attr("stroke", controlColor)
                                            .attr("stroke-width",2)
                                            .on("click",clickAutoButton)
                                            .on("mouseover",function(){setHelp("(autoplay algorithm)")})
                                            .on("mouseout",function(){setHelp("Erase: Hold Click + Drag, Set Start: Hold S + Click, Set Goal: Hold G + Click")})

let stepGlyph = playControls.append("path").attr("d","M 10 30 L 25 20 L 10 10 L 10 30 L 25 20 M 30 32.5 L 30 7.5").attr("rx",10)
                                            .attr("fill","None")
                                            .attr("stroke", (function(){if(stepByStep){return "rgb(0,200,0)"}else{return controlColor}}))
                                            .attr("stroke-width",2)
                                            .attr("transform","translate(40 0)")

let stepClick =  playControls.append("rect").attr("x",40).attr("y",0)
                                            .attr("height", 40)
                                            .attr("width",39)
                                            .attr("rx",10)
                                            .attr("fill","rgba(0,0,0,0)")
                                            .attr("stroke", controlColor)
                                            .attr("stroke-width",2)
                                            .on("click",clickStepButton)
                                            .on("mouseover",function(){setHelp("(click algorithm to advance)")})
                                            .on("mouseout",function(){setHelp("Erase: Hold Click + Drag, Set Start: Hold S + Click, Set Goal: Hold G + Click")})
let speedGlyphs = []
let sGlyphInc = 110/speeds.length
let sGlyphColor = controlColor

for(let i = 0; i < speeds.length; i++){
    if(i<=speed){sGlyphColor = "rgb(250,75,75)"}
    else{sGlyphColor = controlColor}
    speedGlyphs[i] = playControls.append("path").attr("d",`M ${5+i*sGlyphInc} 32.5 L ${(i+1)*sGlyphInc-5} 20 L ${5+i*sGlyphInc} 7.5`)
                                .attr("rx",10)
                                .attr("fill","rgba(0,0,0,0)")
                                .attr("stroke", sGlyphColor)
                                .attr("stroke-width",2)
                                .attr("transform","translate(85 0)")
}

let speedClick =  playControls.append("rect").attr("x",80).attr("y",0)
                                            .attr("height", 40)
                                            .attr("width",120)
                                            .attr("rx",10)
                                            .attr("fill","rgba(0,0,0,0)")
                                            .attr("stroke", controlColor)
                                            .attr("stroke-width",2)
                                            .on("click",clickSpeedButton)
                                            .on("mouseover",function(){setHelp("(change autoplay speed)")})
                                            .on("mouseout",function(){setHelp("Erase: Hold Click + Drag, Set Start: Hold S + Click, Set Goal: Hold G + Click")})

//Layout

let borderRect = svg.append("rect").attr("x",graphBorder).attr("y",graphBorder)
                                    .attr("height", plotHeight).attr("width",plotWidth)
                                    .attr("fill","None").attr("stroke", controlColor).attr("stroke-width",2)

var filter = svg.append("defs").append("filter")
                                    .attr("id", "blur")
                                    .append("feGaussianBlur")
                                    .attr("stdDeviation", 10); 

var filter = svg.append("defs").append("filter")
                                    .attr("id", "lightBlur")
                                    .append("feGaussianBlur")
                                    .attr("stdDeviation", 3); 

let costLabel = svg.append("text").text("Explored: ??? Steps: ??? Cost: ???").attr("x",width-10-graphBorder).attr("y",height-graphBorder+10)
                                    .attr("font-family", "monospace").attr("font-size",20)
                                    .attr("fill","rgb(50,50,50)").attr("dominant-baseline","hanging").attr("text-anchor","end")
                                    
labelText = ["None","Breadth First","Uniform Cost","Depth First","Depth Limited","Greedy Best","A*"]
labelHelpText = ["(clear search algorithm)","(breadth first search)", "(uniform cost search)","(depth first graph search)", "(depth limited depth first graph search)",
                "(iterative deepening depth first tree search)", "(greedy best first search)", "(A* search)"]
let algButtons = []

for(let i=0;i<labelText.length;i++){
    algButtons[i] = svg.append("rect").attr("x",graphBorder+145*i).attr("y",graphBorder + height-graphBorder*2+5)
        .attr("height", 40).attr("width",140)
        .attr("fill","rgb(64,64,64)").attr("stroke", "rgb(50,50,50)")
        .attr("rx", 10).attr("opacity",.5)
        .on("click",function(){clickAlgButton(i)})
        .on("mouseover",function(){setHelp(labelHelpText[i])})
        .on("mouseout",function(){setHelp("Erase: Hold Click + Drag, Set Start: Hold S + Click, Set Goal: Hold G + Click")})

    svg.append("text").text(labelText[i]).attr("dominant-baseline","middle").attr("text-anchor","middle")
        .attr("x",75+graphBorder+145*i).attr("y",20+graphBorder + height-graphBorder*2+5)
        .attr("font-family", "monospace").attr("font-size",15)
        .attr("fill","rgb(200,200,200)")
        .on("click",function(){clickAlgButton(i)})
        .on("mouseover",function(){setHelp(labelHelpText[i])})
        .on("mouseout",function(){setHelp("Erase: Hold Click + Drag, Set Start: Hold S + Click, Set Goal: Hold G + Click")})
}

shadowText = ["None","Heuristic","Cost","Combined"]
shadowHelpText = ["(clear highlights)", "(highlight heuristic values)","(highlight cost)","(highlight heuristic value + cost)"]

//Generate Nodes

let nodeCoords = []

function ijToInd(i,j){
    return i*nodesY + j
}

for(let i=0; i<nodesX;i++){     
    for(let j=0; j<nodesY;j++){  
        let nX = i * nodeGapX + nodeBorder + graphBorder
        let nY = j * nodeGapY + nodeBorder + graphBorder        
        nodeCoords[ijToInd(i,j)]=[nX,nY]    
    }    
}
console.log(nodeCoords)

//Draw Edges

let edges = {}//arrayOfZeros(nNodes,nNodes)
for(let i=0; i<nNodes;i++){
    edges[i] = new Set()
}

let edgeGlyphs = arrayOfZeros(nNodes,nNodes,null) 
let edgeDists= {}//arrayOfZeros(nNodes,nNodes) 
for(let i=0; i<nNodes;i++){
    edgeDists[i] = {}
}

let nodeInds = arange(nodeCoords.length)
let nodeShuffle = JSON.parse(JSON.stringify(nodeInds))
shuffle(nodeShuffle)

function makeEdgePair(a,b){
    if(!edges[a].has(b)){
        edges[a].add(b)
        edges[b].add(a)
        
        //edges[a][b] = 1
        //edges[b][a] = 1

        edgeStuff = drawDirectedEdge(nodeCoords[a],nodeCoords[b],false,false)   

        edgeGlyphs[a][b] = edgeStuff[0]
        let dist = computeSLD(nodeCoords[a],nodeCoords[b])
        edgeDists[a][b] = dist
        edgeDists[b][a] = dist
    }
}

console.log(edgeDists)
let connectedness = 1
for(let i=0; i<nodesX;i++){     
    for(let j=0; j<nodesY;j++){   
        //Up
        if(Math.random()<connectedness){
        if(j>0){            
            makeEdgePair(ijToInd(i,j),ijToInd(i,j-1))
        }
        }
        //Down
        if(Math.random()<connectedness){
        if(j<(nodesY-1)){
            makeEdgePair(ijToInd(i,j),ijToInd(i,j+1))
        }
        }
        //Left
        if(Math.random()<connectedness){
        if(i>0){
            makeEdgePair(ijToInd(i,j),ijToInd(i-1,j))            
        }
        }
        //Right
        if(Math.random()<connectedness){
        if(i<(nodesX-1)){
            makeEdgePair(ijToInd(i,j),ijToInd(i+1,j))            
        }
        //UR
        if(Math.random()<connectedness){
            if(j>0 && i<(nodesX-1)){            
                makeEdgePair(ijToInd(i,j),ijToInd(i+1,j-1))
            }
            }

        //DR
        if(Math.random()<connectedness){
            if(j<(nodesY-1) && i<(nodesX-1)){ 
                makeEdgePair(ijToInd(i,j),ijToInd(i+1,j+1))
            }
        }
        //UL
        if(Math.random()<connectedness){
            if(j>0 && i>0){   
                makeEdgePair(ijToInd(i,j),ijToInd(i-1,j-1))            
            }
        }
        //DL
        if(Math.random()<connectedness){
            if(j<(nodesY-1) && i>0){
                makeEdgePair(ijToInd(i,j),ijToInd(i-1,j+1))            
            }
        }

        //SHUFFLE
        let toShuffle = Array.from(edges[ijToInd(i,j)])
        shuffle(toShuffle)
        edges[ijToInd(i,j)] = new Set(toShuffle)

    }


        let nX = i * nodeGapX + nodeBorder + graphBorder
        let nY = j * nodeGapY + nodeBorder + graphBorder        
        nodeCoords[ijToInd(i,j)]=[nX,nY]    
    }    
}

console.log(edges)
//Draw Circles

let nodeGlyphs = []
let shadowGlyphs = []

for(let i=0; i<nNodes;i++){     

        let glyph = svg.append("circle")
                        .attr("cx",nodeCoords[i][0])
                        .attr("cy",nodeCoords[i][1])
                        .attr("r",nodeR)
                        .attr("fill", "rgb(255,255,255)")
                        .attr("stroke", graphColor)
                        .attr("stroke-width",2)
                        .on("mouseover",function(){if(pressed){return eraseNode(i)}})
                        .on("click",function(){if(gDown){goalNode=i;return setInitGoal()};
                                                   if(sDown){initNode=i;return setInitGoal()};
                                                   })
        
        if(i==initNode){glyph.attr("stroke", "rgb(50,150,50)").attr("stroke-width",4).attr("r",nodeR)}
        if(i==goalNode){glyph.attr("stroke", "rgb(150,50,50)").attr("stroke-width",4).attr("r",nodeR)}       
        
        nodeGlyphs.push(glyph)        
        
    
}

//////////////////////////
//Visualization Functions
//////////////////////////

function emphasizeNeighbors(nodeInd){
    nodeGlyphs[nodeInd].transition().duration(100).attr("fill", "rgb(50,50,200)") 
    labelGlyphs[nodeInd].transition().duration(100).attr("fill", "rgb(200,200,200)") 
    for(i=0;i<nNodes;i++){
        if(edges[nodeInd].has(i)){
            nodeGlyphs[i].transition().duration(100).attr("fill", "rgb(200,50,50)") 
            //labelGlyphs[i].transition().duration(100).attr("stroke", "rgb(200,200,200)") 
            labelGlyphs[i].transition().duration(100).attr("fill", "rgb(225,225,225)")             
        }

    }
}

function clearEmphasis(){
    for(i=0;i<nNodes;i++){        
            nodeGlyphs[i].transition().duration(100).attr("fill", "rgb(255,255,255)")
            labelGlyphs[i].transition().duration(100).attr("fill", "rgb(50,50,50)")
    }
}

function highlightNodes(targets,color){
    for(let i=0;i<nodeGlyphs.length;i++){
        if(nodeGlyphs[i]!=null){
            if(targets.includes(i)){
                nodeGlyphs[i].attr("fill",color)       
            }
        }
    }
}

function highlightEdges(path, color){
    for(let i=0;i<path.length-1;i++){
        if(edgeGlyphs[path[i]][path[i+1]]!=null){
            edgeGlyphs[path[i]][path[i+1]].attr("stroke",color).attr("fill",color).attr("stroke-width",3)
        }else{
            edgeGlyphs[path[i+1]][path[i]].attr("stroke",color).attr("fill",color).attr("stroke-width",3)
        }
    }
}

function revertEdges(color){
    for(let i=0;i<edgeGlyphs.length;i++){
        for(let j=0;j<edgeGlyphs[i].length;j++){
            if(edgeGlyphs[i][j]){
                edgeGlyphs[i][j].attr("stroke",color).attr("fill",color).attr("stroke-width",2)
            }
        }       
    }
}

function computeSLD(a,b, grid=true, diag=true){
    let offsets = [Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])]
    if(grid){        
        if(diag){
            let diag = Math.min(...offsets)
            let diagDist = (2*diag**2)**.5
            return diagDist + Math.abs(Math.max(...offsets)) - Math.abs(Math.min(...offsets)) 
        }
        else{
            return sumArray(offsets)
        }
    }else{   
        return normL2(offsets)
    }
}

function computeCost(path){
    cost = 0
    for(let i=0;i<path.length-1;i++){
        cost += edgeDists[path[i]][path[i+1]]
    }
    return cost
}

function getBestCost(f,c){
    let fCosts = []
    for(let i=0; i<f.length;i++){
        fCosts.push(c[f[i]])
    }
    return argMin(fCosts) 
}

function computeSLDtoGoal(path){
    let nodeLoc = nodeCoords[path[path.length-1]]
    let goalLoc = nodeCoords[goalNode]    
    return computeSLD(nodeLoc,goalLoc)
    
}

function computeHueristic(path){

    return computeCost(path) + computeSLDtoGoal(path)
}

function writeFrontVisit(F,V){
    frontierLabel.text(toString(F))
    visitedLabel.text(toString(V))
}

class queueNodes{
    constructor(start){
        this.frontier = [start]
    }
    next(){
        //console.log(this.frontier)
       return this.frontier.shift()
       
    }
    add(node){
            this.frontier.push(node)
        }
}

function updateSearchViz(){
    highlightNodes(nodeInds,"rgb(255,255,255)")
    highlightNodes(frontier,"rgb(200,50,50)")
    highlightNodes(visited,"rgb(128,128,128)")       
    //console.log(visited)     
}

function showSolution(){
    revertEdges(graphColor)  
    highlightNodes(frontier,"rgba(175,75,75)")       
    highlightNodes(paths[goalNode],"rgba(250,125,0)")            
    highlightEdges(paths[goalNode],"rgba(250,125,0)")       
    let cost  = computeCost(paths[goalNode])
    costLabel.text(`Explored: ${Object.keys(visited).length} Steps: ${paths[goalNode].length-1} Cost: ${Math.round(cost)}`)    
}

function costShadowNodes(){

    let minCost = Infinity
    let maxCost = -Infinity
    for(let i=0;i<shadowGlyphs.length;i++){
        if(frontier.includes(i)){
            let fCost = computeCost(paths[i])
            if(fCost<minCost){minCost=fCost}
            if(fCost>maxCost){maxCost=fCost}
        }
    }
    maxDif = 1 + maxCost-minCost

    for(let i=0;i<shadowGlyphs.length;i++){
        if(frontier.includes(i)){
            shadowGlyphs[i].attr("opacity",1-(computeCost(paths[i])-minCost)/maxDif)
        }
        else{
            shadowGlyphs[i].attr("opacity",0)
        }
    }
}

function drawDirectedEdge(root,tip,directed = true,labeled=true){

    dirVec = normalizeVec([tip[0]-root[0],tip[1]-root[1]])
    
    root = [root[0]+dirVec[0]*nodeR,root[1]+dirVec[1]*nodeR]
    tip = [tip[0]-dirVec[0]*nodeR,tip[1]-dirVec[1]*nodeR]
    legOne =  rotateVec(dirVec,30)
    legTwo = rotateVec(dirVec,-30)
    
    let d=""
      
    if(directed){
        d +=`M ${tip[0]} ${tip[1]} L ${tip[0]-legOne[0]*arrowL} ${tip[1]-legOne[1]*arrowL} L ${tip[0]-legTwo[0]*arrowL} ${tip[1]-legTwo[1]*arrowL} L ${tip[0]} ${tip[1]} 
    M ${tip[0]-dirVec[0]*(arrowL**2/2)**.5} ${tip[1]-dirVec[1]*(arrowL**2/2)**.5} L ${root[0]} ${root[1]}`
    }else{
        d += `M ${tip[0]} ${tip[1]} L ${root[0]} ${root[1]}`
    }

    let path = svg.append("path").attr("d",d).attr("stroke", graphColor).attr("fill",graphColor).attr("stroke-width",2)


    let length = Math.round(normL2([tip[0]-root[0],tip[1]-root[1]]))

    if(labeled){
        svg.append("circle").attr("r",35).attr("cx",(root[0]+tip[0])/2).attr("cy",(root[1]+tip[1])/2).attr("fill","rgba(255,255,255,.75)").attr("filter", "url(#blur)")

        svg.append("text").text(length).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("fill","rgb(64,64,64)")
                        .attr("x",(root[0]+tip[0])/2).attr("y",(root[1]+tip[1])/2).attr("font-family", "monospace").attr("font-size",14).attr("font-weight","bolder")
    }
        

    return [path,length]
    //svg.append("line").attr("x1",root[0]).attr("y1",root[1])
            //.attr("x2",tip[0]).attr("y2",tip[1]).attr("stroke", "rgb(100,100,100)")

}

//////////////////////////
//Graph Search Algorithms
//////////////////////////

//Graph Search Global Variables
let frontier = {}
let costs = {}
let visited = {}
let paths = {}
let done  = 1

//BFS
function breadthFirstSearch(){
    if(!done){ //if search not already finished
        let open = frontier.shift()
        visited.push(open)

        if(open == goalNode){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution()//;updateLists(frontier)            
        }
        else{ //if goal node NOT found           
            let children = edges[open].entries()
            for(let child of children){  
                let i = child[0]         
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])
                }
            }
            //update visualization        
            updateSearchViz()
        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//UCS
function uniformCostSearch(){
    if(!done){ //if search not already finished
        let bestInd = 0
        let bestCost = Infinity
        for(let i=0; i<frontier.length;i++){
            let iCost = computeCost(paths[frontier[i]])            
            if(iCost<bestCost){
                bestInd = i
                bestCost = iCost
            }
        }
        //console.log(bestCost)
        let open = frontier.splice(bestInd,1)
        visited.push(open[0])

        if(open == goalNode){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution()
        }
        else{ //if goal node NOT found
            let children = edges[open].entries()
            for(let child of children){  
                let i = child[0] //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])                    
                }
                if(!visited.includes(i) && frontier.includes(i)){ //if child not visited and is on frontier 
                    currCost = computeCost(paths[i])
                    thisCost = computeCost(paths[open].concat([i]))                    
                    if(thisCost<currCost){ //see if this path to child is shorter 
                        paths[i]=paths[open].concat([i]) 
                    }                  
                }
            }
            //update visualization        
            updateSearchViz()
        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//DFS
function depthFirstSearch(){
    if(!done){ //if search not already finished
        let open = frontier.pop()
        visited.push(open)

        if(open == goalNode){ //if goal node found
            //set search to finished
            done = 1
            //update visualization           
            showSolution()//;updateLists(frontier)     
        }
        else{ //if goal node NOT found
            let children = Array.from(edges[open])//get children
            for(let i=0; i<children.length;i++){ 
                if(!visited.includes(children[i]) && !frontier.includes(children[i])){ //if child not visited and not on frontier
                    frontier.push(children[i]) 
                    paths[children[i]]=paths[open].concat([children[i]])
                }
            }        
            //update visualization        
            updateSearchViz()
        }
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//DLS
depthLimit = Math.round(nodesX*.66)
function depthLimitedSearch(){ 
    if(!done){ //if search not already finished
        let open = frontier.pop()
        
        visited.push(open)        

        if(open == goalNode){ //if goal node found
            //set search to finished
            done = 1
            //update visualization           
            showSolution()
        }
        else{ //if goal node NOT found
            let children = edges[open].entries()
            for(let child of children){  
                let i = child[0] //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    if(paths[open].length+1<=depthLimit){
                        frontier.push(i) 
                        paths[i]=paths[open].concat([i])
                    }
                }
            }      
            //update visualization        
            updateSearchViz()
        }
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
    if(frontier.length==0){ //if goal node too deep
        costLabel.text(`Steps: NA Cost: NA`)
        done = 1        
    }
}

//BFS
function greedyBestSearch(){
    if(!done){ //if search not already finished
        let bestInd = 0
        let bestCost = Infinity
        for(let i=0; i<frontier.length;i++){
            let iCost = computeSLDtoGoal(paths[frontier[i]])
            
            if(iCost<bestCost){
                bestInd = i
                bestCost = iCost
            }
        }
        console.log(bestCost)
        let open = frontier.splice(bestInd,1)
        visited.push(open[0])

        if(open == goalNode){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution()       
        }else{ //if goal node NOT found
            let children = edges[open].entries()
            for(let child of children){  
                let i = child[0] //get children
                if(!visited.includes(i) && !frontier.includes(i)){ //if child not visited and not on frontier
                    frontier.push(i) 
                    paths[i]=paths[open].concat([i])                    
                }
                if(!visited.includes(i) && frontier.includes(i)){ //if child not visited and is on frontier 
                    currCost = computeSLDtoGoal(paths[i])
                    thisCost = computeSLDtoGoal(paths[open].concat([i]))                    
                    if(thisCost<currCost){ //see if this path to child is shorter 
                        paths[i]=paths[open].concat([i]) 
                    }                  
                }
        }
            //update visualization        
            updateSearchViz()         
        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//A*
function aStarSearch(){
    if(!done){ //if search not already finished
        let bestInd = getBestCost(frontier,costs)  
        let open = frontier.splice(bestInd,1)[0]
        let bestCost = costs[open]
        visited.push(open)

        if(open == goalNode){ //if goal node found
            //set search to finished
            done = 1
            //update visualization
            showSolution()          
        }else{ //if goal node NOT found
            let children = Array.from(edges[open])
            for(let i=0; i<children.length;i++){ 
                thisCost = computeHueristic(paths[open].concat([children[i]]))           
                if(!visited.includes(children[i]) && !frontier.includes(children[i])){ //if child not visited and not on frontier
                    frontier.push(children[i]) 
                    costs[children[i]]=thisCost
                    paths[children[i]]=paths[open].concat([children[i]])                    
                }
                if(!visited.includes(children[i]) && frontier.includes(children[i])){ //if child not visited and is on frontier   
                    if(thisCost<costs[children[i]]){ //see if this path to child is shorter 
                        paths[children[i]]=paths[open].concat([children[i]]) 
                        costs[children[i]]=thisCost                              
                    }                  
                }
            }
            //update visualization        
            updateSearchViz()        
        }        
    }else{
        if(typeof animation !== 'undefined'){clearInterval(animation)}
    }
}

//////////////////////////
//User Interactions
//////////////////////////

let algorithms = [null,breadthFirstSearch,uniformCostSearch,depthFirstSearch,depthLimitedSearch,greedyBestSearch,aStarSearch]

function clickSpeedButton(){
    speed = (speed + 1)%speeds.length
    
    if(typeof animation !== 'undefined' && stepByStep==false){
        clearInterval(animation)
        animation = setInterval(algorithms[currentAlg], 1000/speeds[speed]) 
    }   
    for(let i = 0; i < speeds.length; i++){
        if(i<=speed){sGlyphColor = "rgb(250,75,75)"}
        else{sGlyphColor = controlColor}
        speedGlyphs[i].attr("stroke", sGlyphColor)    
    }
}

function clickAutoButton(){
    stepByStep = false 
    
    animation = setInterval(algorithms[currentAlg], 1000/speeds[speed]) 
    
    autoGlyph.attr("stroke","rgb(0,200,0)")
    stepGlyph.attr("stroke",controlColor)
}

function clickStepButton(){
    stepByStep = true 
    if(typeof animation !== 'undefined'){clearInterval(animation)} 
    autoGlyph.attr("stroke",controlColor)
    stepGlyph.attr("stroke","rgb(0,200,0)")
}

function clickAlgButton(ind){   
    
    if(done||currentAlg != ind){
        
        currentAlg = ind

        if(typeof animation !== 'undefined'){clearInterval(animation)} 
              
        for(let i=0;i<algButtons.length;i++){
            if(i==ind){
                algButtons[i].attr("opacity",1)
            }else{
                algButtons[i].attr("opacity",.5)
            }
        }
        if(currentAlg==0){
            frontier=[]
        }else{
            frontier = [initNode]
        }
        visited = []
        paths[initNode] = [initNode]
        if(labelText[ind]=="A*"){
            costs[initNode]= computeSLDtoGoal([initNode])             
        }else{
            costs[initNode]= computeCost([initNode])  
        }
             
        
        maxDepth = 1

        revertEdges(graphColor)
        updateSearchViz()  
        //highlightNodes(nodeInds,"rgb(255,255,255)")
        
        
        if(ind>0){
            done = false
            if(!stepByStep){
                animation = setInterval(algorithms[ind], 1000/speeds[speed]) 
            }else{
                algorithms[ind]()
            }
        } 
    }else{
        if(stepByStep){        
        algorithms[ind]()
        }
    }    
}

function eraseNode(i){
    if(pressed && i!=initNode && i!=goalNode){
        nodeGlyphs[i].attr("fill", "None").attr("stroke", "None")
        nodeGlyphs[i]=null
        for(let j=0;j<nNodes;j++){
            edges[i].delete(j)
            edges[j].delete(i)
            if(edgeGlyphs[i][j]!=null){
            edgeGlyphs[i][j].attr("stroke", "None")    
            edgeGlyphs[i][j]=null    
            }
            if(edgeGlyphs[j][i]!=null){
                edgeGlyphs[j][i].attr("stroke", "None")    
                edgeGlyphs[j][i]=null
                
            }
        }    
    }   
}

function setInitGoal(){
    if(done){          
        clickAlgButton(0)
    for(let i=0;i<nNodes;i++){  
            if(nodeGlyphs[i]!=null){                
                nodeGlyphs[i].attr("stroke",graphColor).attr("stroke-width",2)
                if(i==initNode){
                    nodeGlyphs[i].attr("stroke", "rgb(50,150,50)").attr("stroke-width",4).attr("r",nodeR)
                } 
                if(i==goalNode){
                    nodeGlyphs[i].attr("stroke", "rgb(150,50,50)").attr("stroke-width",4).attr("r",nodeR)   
                }    
        
    }}}
    console.log("revert")    
}


clickAlgButton(0)
