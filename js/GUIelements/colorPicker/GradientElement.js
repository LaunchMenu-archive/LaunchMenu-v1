loadOnce("$Utils");
loadOnce("../BaseElement");
window.GradientElementClass = class GradientElementClass extends BaseElementClass{
    /*
     * Gradients can be defined in 3 ways:
     * -corners:
     *         define corners like 'topleft=green'
     * -directions:
     *         define a start color with 'begin=red' and end color with 'end=black'
     *         then define a direction with 'direction=vertical' where the allowed values are: 
     *             -vertical
     *             -horizontal
     *             -diagonalup
     *             -diagonaldown
     * -function:
     *         pass a custom function, that returns an 4 long array with values ranging from 0 to 255 to represent rgba data
     *         the function will be passed xPer, yPer, x, y as arguments to base the color on.
     * 
     * this data can be passed to setGradient as an object, or as data defined in the html element
     */
    __initVars(){
        super.__initVars();
        this.template = {
                html:  `<canvas></canvas>`,
                style: `.root{
                            user-select: none;
                        }
                        canvas{
                            height: 100%;
                            width: 100%;
                        }`
        };
    }
    __initHtml(){
        super.__initHtml();
        this.ctx = this.$("canvas")[0].getContext("2d");
    }
    constructor(data){
        super();
        if(data)
            this.setGradient(data);
        else
            this.setGradient(this.attr);
    }
    
    //get data to generate gradient from
    static get observedAttributes(){
        return ["topleft","lefttop","topright","righttop",
            "bottomleft","leftbottom","bottomright","rightbottom",
            "begin","end","direction"];
    }
    attributeChangedCallback(attrName, oldVal, newVal){
        var n = ["topleft","lefttop","topright","righttop",
            "bottomleft","leftbottom","bottomright","rightbottom",
            "begin","end","direction"];
        
        if(n.indexOf(attrName)!=-1 && $(this).parent().length>0){
            this.attr = {};
            for(var i=0; i<this.attributes.length; i++){
                var attr = this.attributes[i];
                this.attr[attr.nodeName] = attr.nodeValue;
            }
            this.setGradient(this.attr);
        }
    }
    setGradient(data){
        //if data is a func, use that func directly
        if(data instanceof Function){
            this.genFunc = data;
            if($(this).parent().length>0)
                this.connectedCallback();
            return;
        }
        
        //make keys case insensitive
        for(var key in data){
            var val = data[key];
            delete data[key];
            data[key.toLowerCase()] = val;
        }
        
        //make corner data order insensitive
        if(data.lefttop) data.topleft = data.lefttop;
        if(data.righttop) data.topright = data.righttop;
        if(data.leftbottom) data.bottomleft = data.leftbottom;
        if(data.rightbottom) data.bottomright = data.rightbottom;
        
        
        //define gradient by start end and direction
        if(data.begin){
            if(!data.end) data.end = data.begin;
            if(data.direction == "vertical"){
                data.topleft = data.begin;
                data.bottomleft = data.end;
            }else if(data.direction == "diagonalup"){
                data.bottomleft = data.begin;
                data.topright = data.end;
            }else if(data.direction == "diagonaldown"){
                data.topleft = data.begin;
                data.bottomright = data.end;
            }else{
                data.topleft = data.begin;
                data.topright = data.end;
            }
        }
        
        //define gradient by corners
        var cornerColors = [[0,0,null],[1,0,null],[0,1,null],[1,1,null]];
        if(data.topleft || data.topright || data.bottomleft || data.bottomright){
            //add data of defined corners to corners array
            var corners = [];
            if(data.topleft) corners.push([0,0,$Utils.getRGBA(data.topleft)]);
            if(data.topright) corners.push([1,0,$Utils.getRGBA(data.topright)]);
            if(data.bottomleft) corners.push([0,1,$Utils.getRGBA(data.bottomleft)]);
            if(data.bottomright) corners.push([1,1,$Utils.getRGBA(data.bottomright)]);
            
            if(corners.length==1){ //fill canvas with color if only 1 corner defined
                for(var i=0; i<4; i++)
                    cornerColors[i][2] = corners[0][2];
            }else if(corners.length==2){ //create a simple linear transition if 2 corners defined
                var dx = corners[0][0]-corners[1][0];
                var dy = corners[0][1]-corners[1][1];
                if(dy==0) //horizontal transition
                    for(var i=0; i<4; i++)
                        cornerColors[i][2] = corners[cornerColors[i][0]][2];
                else if(dx==0) //vertical transition
                    for(var i=0; i<4; i++)
                        cornerColors[i][2] = corners[cornerColors[i][1]][2];
                else{ //diagonal transition
                    var color = $Utils.getColorPer(corners[0][2], corners[1][2], 0.5); //color that the remaining corners should have
                    
                    //find remaining corners, and set color
                    n: for(var i=0; i<4; i++){
                        var corner = cornerColors[i];
                        for(var j=0; j<2; j++)
                            if(corners[j][0]==corner[0] && corners[j][1]==corner[1]){
                                corner[2] = corners[j][2]; 
                                continue n;
                            }
                        corner[2] = color;
                    }
                }
            }else if(corners.length==3){ //create transition of 2 neighbor corners for missing corner if 3 colors defined
                var cornerOrder = [[0,0], [1,0], [1,1], [0,1]];
                n: for(var i=0; i<4; i++){
                    var corner = cornerColors[i];
                    //check if corner isn't already defined
                    for(var j=0; j<3; j++){
                        var c = corners[j];
                        if(c[0]==corner[0] && c[1]==corner[1]){
                            corner[2] = c[2];
                            continue n;
                        }
                    }
                    //get neighbor corner indexes
                    var index;
                    for(var j=0; j<4; j++)
                        if(cornerOrder[j][0]==corner[0] && cornerOrder[j][1]==corner[1])
                            index = j;
                    var index1 = (index-1)%4;
                    var index2 = (index+1)%4;
                    //get neighbor corner colors
                    var color1;
                    for(var j=0; j<3; j++)
                        if(corners[j][0]==cornerOrder[index1][0] && corners[j][1]==cornerOrder[index1][1])
                            color1 = corners[j][2];
                    var color2;
                    for(var j=0; j<3; j++)
                        if(corners[j][0]==cornerOrder[index1][0] && corners[j][1]==cornerOrder[index1][1])
                            color2 = corners[j][2];
                    //get and assign color
                    var color = $Utils.getColorPer(color1, color2, 0.5);
                    corner[2] = color;
                }
            }else if(corners.length==4){ //set every corner to its own color if 4 colors defined
                for(var i=0; i<4; i++)
                    cornerColors[i][2] = corners[i][2];
            }
            this.cornerColors = cornerColors;
            
            //create generation function
            this.genFunc = function(xPer, yPer, x, y){
                var colors = [];
                for(var yP=0; yP<2; yP++)
                    colors.push($Utils.getColorPer(this.cornerColors[yP*2][2], this.cornerColors[yP*2+1][2], xPer));
                
                return $Utils.getColorPer(colors[0], colors[1], yPer);
            };
        }
        
        if($(this).parent().length>0)
            this.connectedCallback();
    }
    
    //generate the actual gradient
    connectedCallback(){
        if(this.genFunc)
            this.generate(this.genFunc);
    }
    generate(genFunc){
        this.width = $(this).width();
        this.height = $(this).height();
        if(this.maxHorizontalResolution) this.width = Math.min(this.maxHorizontalResolution, this.width);
        if(this.maxVerticalResolution) this.height = Math.min(this.maxVerticalResolution, this.height);
        
        this.$("canvas").attr("height", this.height).attr("width", this.width);
        this.genFunc = genFunc;
        
        for(var x=0; x<this.width; x++){
            for(var y=0; y<this.height; y++){
                var color = genFunc.call(this, x/this.width, y/this.height, x, y);
                if(color instanceof Array){
                    if(color.length==3) color.push(255);
                    if(color.length!=4) continue;
                    
                    this.ctx.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+(color[3]/255)+")";
                    this.ctx.fillRect( x, y, 1, 1);
                }
            }
        }
    }
    
    //retrieve color methods
    getColorPer(x, y){
        return this.genFunc.call(this, x, y, x*this.width, y*this.height);
    }
    getColor(x, y){
        return this.getColorPer(x/this.width, y/this.height);
    }
    getCssColorPer(x, y){
        var color = this.getColorPer(x, y);
        if(color)
            return "rgba("+color[0]+","+color[1]+","+color[2]+","+(color[3]/255)+")";
    }
    getCssColor(x, y){
        var color = this.getColor(x, y);
        if(color)
            return "rgba("+color[0]+","+color[1]+","+color[2]+","+(color[3]/255)+")";
    }
}
window.GradientElementClass.registerElement(); 