/*global variables Utils,*/
var Searchbar = (function(){
    var sb = {};
    
    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }
    
    var valueListeners = [];
    var eventListeners = [];
    var lastInput = null;
    // init:
    {
        var gui ={
            html:  `<div class="f6 icon icon-search"></div>
    				<div class='searchInput'>
    					<div class='f6 placeHolder'>Search...</div>
    					<input type=field class='f0 input'>
    				</div>`,
            style: `.icon:before{
                        line-height: 60px;
                    }
                    .icon{
                        float: left;
                        font-size: 40px;
                        text-align: center;
                        width: 60px;
                        height: 60px;
                    }
                    .searchInput{
                        float: left;
                        position:relative;
                        width: calc(100% - 120px);
                        height: 100%;
                    }
                    .placeHolder{
                        padding-left:10px;
                        font-size: 30px;
                        position:absolute;
                        left:0;
                        right:0;
                        line-height: 60px;
                        width:100%;
                        height:100%;
                    }
                    .input{
                        padding-left:10px;
                        font-size: 30px;
                        position:relative;
                        border:none;
                        outline:none;
                        background:none;
                        width:100%;
                        height:100%;
                    }`
        };
        var n = Utils.createTemplateElement("Searchbar", gui);
        var element = n.element;
        sb.$ = n.querier;
        Utils.lm(".searchbar").append(element);
        
        //input listener
        sb.$(".input").keydown(function(e){
            //sent event to event listeners
            for(var i=0; i<eventListeners.length; i++){
                var listener = eventListeners[i];
                if(listener(e)){
                    e.preventDefault();
                    return;
                }
            }
            
            setTimeout(function(){
                var queryText = sb.$(".input").val();
                if(queryText.length>0){
                    sb.$(".placeHolder").hide();
                }else{
                    sb.$(".placeHolder").show();
                }
                if(queryText!=lastInput){
                    //sent new value to value listeners
                    setTimeout(function(){ //timeout to let the placeholder visibility change process first
                        for(var i=0; i<valueListeners.length; i++){
                            var listener = valueListeners[i];
                            listener(queryText);
                        }
                        lastInput = queryText;
                    },1);
                }
             });
        });
        
        //select searchbar when something has been clicked, unless it is an input
        document.body.addEventListener('mouseup', function(event){
            if(!window.$(":focus").length && !getSelectionText())
                sb.$(".input").focus();
        }, true); 
    }
    
    sb.addEventListener = function(listener, start){
        if(!start)
            eventListeners.push(listener);
        else
            eventListeners.unshift(listener);
    };
    sb.addValueListener = function(listener, start){
        if(!start)
            valueListeners.push(listener);
        else
            valueListeners.unshift(listener);
    };
    
    sb.clear = function(dontCompute){
        this.$(".input").val("");
        this.$(".placeholder").show();
    };
    sb.setText = function(value, dontCompute){
        if(value!=null && value.length>0){
            lastInput = value;
            this.$(".input").val(value);
            this.$(".placeholder").hide();
        }else{
            sb.clear(dontCompute);
        }
    };
    sb.getText = function(){
        return this.$(".input").val();
    };
    
    return sb;
})();