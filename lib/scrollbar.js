(function(){
    var scrollbarInitialised = false;
    var selectedBar = null;
    var scrollStart = 0;
    jQuery.fn.extend({
        scrollbar: function(args){
            if(this.length==1){
                if(!this.is("[scrollElement]")){
                    if(args==null || typeof args == "object"){
                        if(!args) args = {};
                        if(args.vertical===undefined) args.vertical=true;   //vertical scrollbar
                        if(args.horizontal===undefined) args.horizontal=false;  //horizontal scrollbar
                        if(args.minBarSize===undefined) args.minBarSize=50; //minimum scrollbar size
                        if(args.hoverTime===undefined) args.hoverTime=50;  //hover duration before scrollbar appears
                        if(args.showDuration===undefined) args.showDuration=50;    //duration for scrollbar to appear
                        if(args.hideDuration===undefined) args.hideDuration=300;    //duration for scrollbar to hide
                        if(args.autoHide===undefined) args.autoHide=true;   //scrollbar auto hides when not needed
                        if(args.autoHideTime===undefined) args.autoHideTime=1000;   //duration after which the scrollbar hides
                        if(args.hideIfNoOverflow===undefined) args.hideIfNoOverflow=true;   //scrollbar hides if no overflow
                        if(args.clickScrollDuration===undefined) args.clickScrollDuration=500;  //scroll duration if clicked in scrollbar container
                        if(args.moveAnimation===undefined) args.moveAnimation=false;    //don't change opacity but move scrollbar
                        if(args.neverShow===undefined) args.neverShow=false;    //don't show any scrollbar at all
                        if(args.fadeVertical===undefined) args.fadeVertical=false;  //show a shade on top and bottom of scrollelement
                        if(args.fadeHorizontal===undefined) args.fadeHorizontal=false;  //show a shade on left and right of scrollbar
                        if(args.focusDuration===undefined) args.focusDuration=500;  //duration for scrollbar to focus on a point when function is called
                        if(args.verticalMargin===undefined) args.verticalMargin=null; //the vertical margin the scrollbar should have ({top:0,bottom:0})
                        if(args.horizontalMargin===undefined) args.horizontalMargin=null; //the horizontal margin the scrollbar should have ({left:0,right:0})
                        if(args.detectDescendantAppend===undefined) args.detectDescendantAppend=false; //should the descendant change be detected
                        if(args.focusOffset===undefined) args.focusOffset=null; //the location the focusedElement will take
                        if(args.sectionListener===undefined) args.sectionListener=null; //a listener that detects when you scroll to another section
                        if(args.scrollListener===undefined) args.scrollListener=null; //a general listener to detect the scroll events
                        /*section listener:
                            {listener:function(element){},offset:{left:number,top:number},selectors:[".selector1",".selector2"]}
                        */
                        
                        this.attr("scrollElement","");
                        setupScrollbar(this, args);
                    }
                }else{
                    if(args=="refresh"){
                        this[0].updateSize();
                        if(this[0].setVerticalBar)
                            this[0].setVerticalBar(this[0].getVerticalBar()); //update bar offset and fade
                        if(this[0].setHorizontalBar)
                            this[0].setHorizontalBar(this[0].getHorizontalBar()); //update bar offset and fade
                    }else if(args=="reset"){
                        this[0].updateSize();
                        if(this[0].setHorizontalOffset) this[0].setHorizontalOffset(0);
                        if(this[0].setVerticalOffset) this[0].setVerticalOffset(0);
                    }
                }
                return this;
            }
        }
    });
    
    function setupScrollbar(element, args){
        var el = element[0];
        if(!scrollbarInitialised) setupStyle();
        element.css("overflow","hidden");
        if(element.css("position")=="static") element.css("position","relative");
        
        var pane = $("<div class=se scrollPane><div class=se scrollContent></div></div>");
        var content = pane.children("[scrollContent]");
        if(element.css("max-height"))
            pane.css("max-height", element.css("max-height"));
        if(element.css("min-height"))
            pane.css("min-height", element.css("min-height"));
        if(element.css("max-width"))
            pane.css("max-width", element.css("max-width"));
        if(element.css("min-width"))
            pane.css("min-width", element.css("min-width"));
        //transfer content
        element.contents().appendTo(content);
        element.append(pane);
        //setup resize detector
        try{
            new ResizeSensor(content[0], function() {
                el.updateSize();
            });   
        }catch(e){};
     
        //detect elements being added or removed
        var observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation) {
                var index = element.children("[scrollPane]").find("[scrollContent]").index();
                if(index==-1){
                    observer.disconnect();
                    element.text("");
                    setupScrollbar(element, args); //reinitialise;
                }
                var divs = element.clone().contents().not(".se");
                if(index==0)
                    content.append(divs);
                else
                    content.prepend(divs);
                element.children().not(".se").remove();
                
                el.updateSize();
            });    
        });
        var config = {childList: true, characterData: true, subtree:args.detectDescendantAppend};
        observer.observe(el, config);
        
        //setup fade areas
        var colors = element.css("background-color").split(/[(]|[)]|,/g);
        var colorIn = "rgba("+colors[1]+","+colors[2]+","+colors[3]+", 1)";
        var colorOut = "rgba("+colors[1]+","+colors[2]+","+colors[3]+", 0)";
        if(args.fadeVertical){
            element.append("<div class=se shadeTop style='"+
                "background: -moz-linear-gradient(top, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -webkit-gradient(left top, left bottom, color-stop(0%, "+colorIn+"), color-stop(100%, "+colorOut+"));"+
                "background: -webkit-linear-gradient(top, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -o-linear-gradient(top, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -ms-linear-gradient(top, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: linear-gradient(to bottom, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "display:none;'></div>");
            element.append("<div class=se shadeBottom style='"+
                "background: -moz-linear-gradient(bottom, "+colorIn+") 0%, "+colorOut+" 100%);"+
                "background: -webkit-gradient(left bottom, left top, color-stop(0%, "+colorIn+"), color-stop(100%, "+colorOut+"));"+
                "background: -webkit-linear-gradient(bottom, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -o-linear-gradient(bottom, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -ms-linear-gradient(bottom, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: linear-gradient(to top, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "'></div>");
        }
        if(args.fadeHorizontal){
            element.append("<div class=se shadeLeft style='"+
                "background: -moz-linear-gradient(left, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -webkit-gradient(left top, right top, color-stop(0%, "+colorIn+"), color-stop(100%, "+colorOut+"));"+
                "background: -webkit-linear-gradient(left, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -o-linear-gradient(left, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -ms-linear-gradient(left, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: linear-gradient(to right, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "display:none;'></div>");
            element.append("<div class=se shadeRight style='"+
                "background: -moz-linear-gradient(right, "+colorIn+") 0%, "+colorOut+" 100%);"+
                "background: -webkit-gradient(right top, right top, color-stop(0%, "+colorIn+"), color-stop(100%, "+colorOut+"));"+
                "background: -webkit-linear-gradient(right, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -o-linear-gradient(right, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: -ms-linear-gradient(right, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "background: linear-gradient(to left, "+colorIn+" 0%, "+colorOut+" 100%);"+
                "'></div>");
        }
        
        //hide original scrollbars of element
        if(!args.vertical){
            pane.css("overflow-y","hidden");
            content.css("height","100%");
        }
        if(!args.horizontal){
            pane.css("overflow-x","hidden");   
            content.css("width","100%");
        }
        var dX = pane.width()-pane.prop("clientWidth");
        var dY = pane.height()-pane.prop("clientHeight");
        pane.width("calc(100% + "+dX+"px");
        pane.height("calc(100% + "+dY+"px");
        
        //add scrollbar together with all the events
        var hoverVertical = false;
        var hoverHorizontal = false;
        var verticalHoverCountdown = null; //the countdown function for when the bar should appear
        var horizontalHoverCountdown = null;
        var removedVertical = 0;//the removed amount of pixels because of margin
        var removedHorizontal = 0;
        if(args.vertical){
            element.append("<div class=se scrollbar v><div class=se bar></div></div>");
            if(args.verticalMargin){
                var m = args.verticalMargin;
                var c = element.children("[scrollbar][v]");
                if(m.top){
                    removedVertical += m.top;
                    c.css("margin-top",m.top);  
                } 
                if(m.bottom){
                    removedVertical += m.bottom;
                    c.css("margin-bottom",m.bottom);  
                } 
                c.css("height","calc(100% - "+removedVertical+"px)");
            }
            var verticalBar = element.children("[scrollbar][v]").find("[bar]");
            verticalBar.mousedown(function(e){
                e.stopImmediatePropagation();
                disableSelect();
                $(this).parent().addClass("selected");
                selectedBar = $(this);
                scrollStart = e.clientY-parseFloat($(this).css("top"));
            }).mouseup(function(){
                enableSelect();
                $("[scrollbar].selected").removeClass("selected");
                selectedBar = null;
            });
            var cont = element.children("[scrollbar][v]");
            var verticalClickScroll = {barOffset:0};
            element.children("[scrollbar][v]").mouseenter(function(){
                hoverVertical = true;
            }).mouseleave(function(){
                hoverVertical = false;
                resetVerticalHideTime();
                
                clearTimeout(verticalHoverCountdown);
                verticalHoverCountdown = null;
            }).mousedown(function(e){
                var offset = e.pageY-cont.offset().top-verticalBar.outerHeight()/2;
                verticalClickScroll.barOffset = el.getVerticalBar();
                $(verticalClickScroll).animate({barOffset:offset},{step:function(now){
                    el.setVerticalBar(now);
                }, duration:args.clickScrollDuration});
            }).mouseup(function(){
                $(verticalClickScroll).stop(true);
            });
        }
        if(args.horizontal){
            element.append("<div class=se scrollbar h><div class=se bar></div></div>");
            if(args.horizontalMargin){
                var m = args.horizontalMargin;
                var c = element.children("[scrollbar][h]");
                if(m.left){
                    removedHorizontal += m.left;
                    c.css("margin-left",m.left);  
                } 
                if(m.right){
                    removedHorizontal += m.right;
                    c.css("margin-right",m.right);  
                } 
                c.css("width","calc(100% - "+removedHorizontal+"px)");
            }
            var horizontalBar = element.children("[scrollbar][h]").find("[bar]");
            horizontalBar.mousedown(function(e){
                e.stopImmediatePropagation();
                disableSelect();
                $(this).parent().addClass("selected");
                selectedBar = $(this);
                scrollStart = e.clientX-parseFloat($(this).css("left"));
            }).mouseup(function(){
                enableSelect();
                $("[scrollbar].selected").removeClass("selected");
                selectedBar = null;
            });
            var cont = element.children("[scrollbar][h]");
            var horizontalClickScroll = {barOffset:0};
            element.children("[scrollbar][h]").mouseenter(function(){
                hoverHorizontal = true;
            }).mouseleave(function(){
                hoverHorizontal = false;
                resetHorizontalHideTime();
                
                clearTimeout(horizontalHoverCountdown);
                horizontalHoverCountdown = null;
            }).mousedown(function(e){
                var offset = e.pageX-cont.offset().left-horizontalBar.outerWidth()/2;
                horizontalClickScroll.barOffset = el.getHorizontalBar();
                $(horizontalClickScroll).animate({barOffset:offset},{step:function(now){
                    el.setHorizontalBar(now);
                }, duration:args.clickScrollDuration});
            }).mouseup(function(){
                $(horizontalClickScroll).stop(true);
            });
        }
        if(args.horizontal && args.vertical){
            var vBar = element.children("[scrollbar][v]");
            var hBar = element.children("[scrollbar][h]");
            var barWidth = vBar.find("[bar]").outerWidth(true);
            var barHeight = hBar.find("[bar]").outerHeight(true);
            vBar.css("height","calc(100% - "+(barHeight+removedVertical)+"px)");
            hBar.css("width","calc(100% - "+(barWidth+removedHorizontal)+"px)");
            element.append("<div class=se scrollbarCorner style=width:"+barWidth+"px;height:"+barHeight+"px></div>")
        }
        
        //change scrollbar position when scrolled
        var previousHorizontal = 0;
        var previousVertical = 0;
        pane.scroll(function(){
            if(args.horizontal){
                var newHorizontal = el.getHorizontalOffset();
                if(newHorizontal!=previousHorizontal){
                    var barOffset = newHorizontal/el.getMaxHorizontalOffset()*el.getMaxHorizontalBar();
                    el.setHorizontalBar(barOffset);
                }
                previousHorizontal = newHorizontal;
            }
            if(args.vertical){
                var newVertical = el.getVerticalOffset();
                if(newVertical!=previousVertical){
                    var barOffset = newVertical/el.getMaxVerticalOffset()*el.getMaxVerticalBar();
                    el.setVerticalBar(barOffset, true);
                }
                previousVertical = newVertical;
            }
        });
        
        //show scrollbar when hovering over it
        if(args.autoHide){
            element.mousemove(function(e){
                var pos = element.offset();
                var right = -e.pageX+pos.left+element.width();
                var bottom = -e.pageY+pos.top+element.height();
                if(right<element.children("[scrollbar][v]").outerWidth(true) &&
                    (!args.hideIfNoOverflow || el.heightPer!=1)){
                    if(verticalHoverCountdown==null){
                        verticalHoverCountdown = setTimeout(function(){
                            if(!el.isVerticalScrollbarShown())
                                el.showVerticalScrollbar();
                            resetVerticalHideTime();
                        }, args.hoverTime);
                    }
                }else{
                    clearTimeout(verticalHoverCountdown);
                    verticalHoverCountdown = null;
                }
                if(bottom<element.children("[scrollbar][h]").outerHeight(true) &&
                    (!args.hideIfNoOverflow || el.widthPer!=1)){
                    if(horizontalHoverCountdown==null){
                        horizontalHoverCountdown = setTimeout(function(){
                            if(!el.isHorizontalScrollbarShown())
                                el.showHorizontalScrollbar();
                            resetHorizontalHideTime();
                        }, args.hoverTime);
                    }
                }else{
                    clearTimeout(horizontalHoverCountdown);
                    horizontalHoverCountdown = null;
                }
            });
        }
        
        //hide scrollbars if they should never be visible
        if(args.neverShow){
            element.children("[scrollbar]").hide();
        }
        
        var hideVerticalTimeout = 0;
        var hideHorizontalTimeout = 0;
        var resetVerticalHideTime = function(){
            if(args.autoHide){
                clearTimeout(hideVerticalTimeout);
                hideVerticalTimeout = setTimeout(function(){
                    if(!hoverVertical && el.isVerticalScrollbarShown())
                        el.hideVerticalScrollbar();
                },args.autoHideTime);
            }
        };
        var resetHorizontalHideTime = function(){
            if(args.autoHide){
                clearTimeout(hideHorizontalTimeout);
                hideHorizontalTimeout = setTimeout(function(){
                    if(!hoverHorizontal && el.isHorizontalScrollbarShown())
                        el.hideHorizontalScrollbar();
                },args.autoHideTime);
            }
        };
        
        //set general functions for the element
        if(el.setVerticalBar===undefined){
            var disableVerticalListener = false;//if the listener should be disabled due to scrolling quickly because of focus
            var disableHorizontalListener = false;
            if(args.vertical){
                el.setVerticalBar = function(offset, dontcascade){
                    if(isNaN(offset)) offset=0;
                    var v = element.children("[scrollbar][v]");
                    var max = el.getMaxVerticalBar();
                    offset = Math.max(0,Math.min(max,offset));
                    v.find("[bar]").css("top",offset);
                    if(!dontcascade)
                        el.setVerticalPer(offset/max);
                    if(!el.isVerticalScrollbarShown() && (!args.hideIfNoOverflow || el.heightPer!=1))
                        el.showVerticalScrollbar();
                    if(el.searchSection) el.searchSection();
                      
                    if(args.fadeVertical){
                        if(offset<0.5)      element.children("[shadeTop]").hide();
                        else                element.children("[shadeTop]").show();
                        if(offset>max-0.5)  element.children("[shadeBottom]").hide();
                        else                element.children("[shadeBottom]").show();
                    }
                    if(args.autoHide) resetVerticalHideTime();
                    if(args.scrollListener) args.scrollListener(el.getVerticalOffset(),"vertical");
                };
                el.setVerticalOffset = function(offset, dontcascade){
                    if(isNaN(offset)) offset=0;
                    var c = element.children("[scrollPane]");
                    var max = el.getMaxVerticalOffset();
                    offset = Math.max(0,Math.min(max,offset));
                    c.scrollTop(offset);
                    if(!dontcascade)
                        el.setVerticalPer(offset/max);
                };
                el.setVerticalPer = function(per){
                    var barMax = el.getMaxVerticalBar();
                    var offsetMax = el.getMaxVerticalOffset();
                    el.setVerticalBar(barMax*per, true);
                    el.setVerticalOffset(offsetMax*per, true);
                };
                el.getMaxVerticalBar = function(){
                    var v = element.children("[scrollbar][v]");
                    return v.height()-v.find("[bar]").outerHeight(true);
                };
                el.getMaxVerticalOffset = function(){
                    return Math.max(0,element.children("[scrollPane]")[0].scrollHeight-element.height());
                };
                el.getVerticalBar = function(){
                    return parseFloat(element.children("[scrollbar][v]").find("[bar]").css("top"))||0;
                };
                el.getVerticalOffset = function(){
                    return element.children("[scrollPane]").scrollTop();
                };
                el.getVerticalPer = function(){
                    var v = element.children("[scrollbar][v]");
                    var max = v.height()-v.find("[bar]").outerHeight(true);
                    return el.getVerticalbar()/max;
                };
                
                el.focusVertical = function(offset, duration){
                    duration = duration||args.focusDuration;
                    var curOffset = el.getVerticalOffset();
                    if(typeof element!="number"){
                        var top = args.focusOffset&&args.focusOffset.top?args.focusOffset.top:element.outerHeight(true)/2;
                        offset = (curOffset+offset.offset().top+offset.outerHeight(true)/2)-(element.offset().top+top);
                    }
                    disableVerticalListener = true;
                    $({offset:curOffset}).animate({offset:offset}, {duration:duration, step:function(val){
                        el.setVerticalOffset(val);
                    },complete:function(){
                        disableVerticalListener = false;    
                        if(el.searchSection) el.searchSection();
                    }});
                }
            }
            if(args.horizontal){
                el.setHorizontalBar = function(offset, dontcascade){
                    if(isNaN(offset)) offset=0;
                    var h = element.children("[scrollbar][h]");
                    var max = el.getMaxHorizontalBar();
                    offset = Math.max(0,Math.min(max,offset));
                    h.find("[bar]").css("left",offset);
                    if(!dontcascade)
                        el.setHorizontalPer(offset/max);
                    if(!el.isHorizontalScrollbarShown() && (!args.hideIfNoOverflow || el.widthPer!=1))
                        el.showHorizontalScrollbar();
                    
                    if(args.fadeHorizontal){
                        if(offset<0.5)      element.children("[shadeLeft]").hide();
                        else                element.children("[shadeLeft]").show();
                        if(offset>max-0.5)  element.children("[shadeRight]").hide();
                        else                element.children("[shadeRight]").show();
                    }
                    if(args.autoHide) resetHorizontalHideTime();
                    if(args.scrollListener) args.scrollListener(el.getHorizontalOffset(),"horizontal");
                };
                el.setHorizontalOffset = function(offset, dontcascade){
                    if(isNaN(offset)) offset=0;
                    var c = element.children("[scrollPane]");
                    var max = el.getMaxHorizontalOffset();
                    offset = Math.max(0,Math.min(max,offset));
                    c.scrollLeft(offset);
                    if(!dontcascade)
                        el.setHorizontalPer(offset/max);
                };
                el.setHorizontalPer = function(per){
                    var barMax = el.getMaxHorizontalBar();
                    var offsetMax = el.getMaxHorizontalOffset();
                    el.setHorizontalBar(barMax*per, true);
                    el.setHorizontalOffset(offsetMax*per, true);
                };
                el.getMaxHorizontalBar = function(){
                    var h = element.children("[scrollbar][h]");
                    return h.width()-h.find("[bar]").outerWidth(true);
                };
                el.getMaxHorizontalOffset = function(){
                    return Math.max(0,element.children("[scrollPane]")[0].scrollWidth-element.width());
                };
                el.getHorizontalBar = function(){
                    return parseFloat(element.children("[scrollbar][h]").find("[bar]").css("left"))||0;
                };
                el.getHorizontalOffset = function(){
                    return element.children("[scrollPane]").scrollLeft();
                };
                el.getHorizontalPer = function(){
                    var h = element.children("[scrollbar][h]");
                    var max = h.width()-h.find("[bar]").outerWidth(true);
                    return el.getHorizontalbar()/max;
                };
                
                el.focusHorizontal = function(offset, duration){
                    duration = duration||args.focusDuration;
                    var curOffset = el.getHorizontalOffset();
                    if(typeof element!="number"){
                        var left = args.focusOffset&&args.focusOffset.left?args.focusOffset.left:element.outerWidth(true)/2;
                        offset = (curOffset+offset.offset().left+offset.outerWidth(true)/2)-(element.offset().left+left);
                    }
                    disableHorizontalListener = true;
                    $({offset:curOffset}).animate({offset:offset}, {duration:duration, step:function(val){
                        el.setHorizontalOffset(val);
                    },complete:function(){
                        disableHorizontalListener = false; 
                        if(el.searchSection) el.searchSection();
                    }});
                }
            }
            
            if(args.vertical || args.horizontal){ //this should always be the case...
                el.focus = function(offset, duration){
                    if(args.vertical) el.focusVertical(offset, duration);
                    if(args.horizontal) el.focusHorizontal(offset, duration);
                }
                
                //section listener
                if(args.sectionListener){
                    //init options
                    var sl = args.sectionListener;
                    if(!sl.offset) 
                        sl.offset = {top:0, left:0};
                    if(typeof sl.selectors == "string")
                        sl.selectors = [sl.selectors];
                    
                    //create the selector    
                    var selectors = sl.selectors;
                    for(var i=0; i<selectors.length; i++){
                        var sel = selectors[i];
                        selectors[i] = sel+":not("+sel+" > "+sel+")";
                    }
                    
                    //create search function
                    var lastSection = null;
                    el.searchSection = function(){
                        if(!disableVerticalListener && !disableHorizontalListener){
                            var elOf = element.offset();
                            elOf.left+=sl.offset.left;
                            elOf.top+=sl.offset.top;
                            
                            var el = element;
                            for(var i=0; i<selectors.length; i++){
                                var elements = el.find(selectors[i]);
                                
                                var smallestDist = Infinity;
                                var closest = null;
                                elements.each(function(){
                                    var t = $(this);
                                    var f = t.offset();
                                    
                                    var dx = f.left-elOf.left;
                                    if(dx<0) dx = Math.min(dx+t.outerWidth(true), 0);
                                    var dy = f.top-elOf.top;
                                    if(dy<0) dy = Math.min(dy+t.outerHeight(true), 0);
                                    var dist = dx*dx+dy*dy;
                                    
                                    if(dist<smallestDist){
                                        smallestDist = dist;
                                        closest = this;
                                    }
                                });
                                if(el==null) return;
                                el = $(closest);
                            }
                            el = el[0];
                            if(el!=lastSection){
                                sl.listener(el);
                                lastSection = el;
                            }
                        }
                    }
                    el.searchSection();
                }
            }
            
            if(args.vertical){
                el.showVerticalScrollbar = function(duration, dontShowCorner){
                    var v = element.children("[scrollbar][v]");
                    if(args.moveAnimation){
                        v.stop(true).animate({"right":"0px"},duration!=null?duration:args.showDuration);
                    }else{
                        v.stop(true).animate({"opacity":"1"},duration!=null?duration:args.showDuration);
                    }
                    v.removeAttr("hide");
                    if(!dontShowCorner && el.isCornerShown && !el.isCornerShown())
                        el.showCorner(duration);
                };
                el.hideVerticalScrollbar = function(duration, dontHideCorner){
                    var v = element.children("[scrollbar][v]");
                    if(args.moveAnimation){
                        v.stop(true).animate({"right":-v.outerWidth(true)+"px"},duration!=null?duration:args.hideDuration);
                    }else{
                        v.stop(true).animate({"opacity":"0"},duration!=null?duration:args.hideDuration);
                    }
                    v.attr("hide","");
                    if(!dontHideCorner && el.isCornerShown && el.isCornerShown() && !el.isHorizontalScrollbarShown())
                        el.hideCorner(duration);
                };
                el.isVerticalScrollbarShown = function(){
                    return !element.children("[scrollbar][v]").is("[hide]");
                };
            }
            if(args.horizontal){
                el.showHorizontalScrollbar = function(duration, dontShowCorner){
                    var h = element.children("[scrollbar][h]");
                    if(args.moveAnimation){
                        h.stop(true).animate({"bottom":"0px"},duration!=null?duration:args.showDuration);
                    }else{
                        h.stop(true).animate({"opacity":"1"},duration!=null?duration:args.showDuration);
                    }
                    h.removeAttr("hide");
                    if(!dontShowCorner && el.isCornerShown && !el.isCornerShown())
                        el.showCorner(duration);
                };
                el.hideHorizontalScrollbar = function(duration, dontHideCorner){
                    var h = element.children("[scrollbar][h]");
                    if(args.moveAnimation){
                        h.stop(true).animate({"bottom":-h.outerHeight(true)+"px"},duration!=null?duration:args.hideDuration);
                    }else{
                        h.stop(true).animate({"opacity":"0"},duration!=null?duration:args.hideDuration);
                    }
                    h.attr("hide","");
                    if(!dontHideCorner && el.isCornerShown && el.isCornerShown() && !el.isVerticalScrollbarShown())
                        el.hideCorner(duration);
                };
                el.isHorizontalScrollbarShown = function(){
                    return !element.children("[scrollbar][h]").is("[hide]");
                };
            }
            if(args.horizontal && args.vertical){
                el.showCorner = function(duration){
                    var c = element.children("[scrollbarCorner]");
                    if(args.moveAnimation){
                        c.stop(true).animate({"bottom":"0px","right":"0px"},duration!=null?duration:args.showDuration);
                    }else{
                        c.stop(true).animate({"opacity":"1"},duration!=null?duration:args.showDuration);
                    }
                    c.removeAttr("hide");
                };
                el.hideCorner = function(duration){
                    var c = element.children("[scrollbarCorner]");
                    if(args.moveAnimation){
                        c.stop(true).animate({"bottom":-c.outerHeight(true)+"px","right":-c.outerWidth(true)+"px"},duration!=null?duration:args.hideDuration);
                    }else{
                        c.stop(true).animate({"opacity":"0"},duration!=null?duration:args.hideDuration);
                    }
                    c.attr("hide","");
                };
                el.isCornerShown = function(){
                    return !element.children("[scrollbarCorner]").is("[hide]");
                };
            }
            
            
            //the function that decides how big the scrollbar's bar should be
            el.updateSize = function(firstTime){
                var pane = element.children("[scrollPane]");
                var widthPer = Math.min(1, element.width()/pane[0].scrollWidth);
                var heightPer = Math.min(1, element.height()/pane[0].scrollHeight);
                element[0].widthPer = widthPer;
                element[0].heightPer = heightPer;
                
                var widthBarSize = Math.max(args.minBarSize, element.children("[scrollbar][h]").width()*widthPer);
                var heightBarSize = Math.max(args.minBarSize, element.children("[scrollbar][v]").height()*heightPer);
                
                element.children("[scrollbar][h]").find("[bar]").width(widthBarSize);
                element.children("[scrollbar][v]").find("[bar]").height(heightBarSize);
                
                if(args.hideIfNoOverflow){
                    var el = element[0];
                    if(args.vertical)
                        if(heightPer==1){
                            if(el.isVerticalScrollbarShown()) el.hideVerticalScrollbar(firstTime?0:null); //hide instantly if it is the first time updateSize() is called (the initialisation of the element)
                        }else
                            if(!el.isVerticalScrollbarShown() && !args.autoHide) el.showVerticalScrollbar(firstTime?0:null);
                    if(args.horizontal)
                        if(widthPer==1){
                            if(el.isHorizontalScrollbarShown()) el.hideHorizontalScrollbar(firstTime?0:null);
                        }else
                            if(!el.isHorizontalScrollbarShown() && !args.autoHide) el.showHorizontalScrollbar(firstTime?0:null);
                }
            }
        }
        
        //initialise the size of the scrolbars
        el.updateSize(true);
        if(el.setVerticalOffset) el.setVerticalOffset(0); //initialise vertical position
        if(el.setHorizontalOffset) el.setHorizontalOffset(0); //initialise horizontal position
        if(args.autoHide){
            if(args.vertical) el.hideVerticalScrollbar(0);   
            if(args.horizontal) el.hideHorizontalScrollbar(0);
        }
    }
    //change position by dragging scrollbar
    $(document).mousemove(function(e){
        if(selectedBar){
            var scrollbar = selectedBar.parent();
            var element = scrollbar.parent();
            if(scrollbar.is("[v]")){
                var max = element[0].getMaxVerticalBar();
                var top = Math.max(0,Math.min(max, e.clientY-scrollStart));
                element[0].setVerticalPer(top/max);
            }else{
                var max = element[0].getMaxHorizontalBar();
                var left = Math.max(0,Math.min(max, e.clientX-scrollStart));
                element[0].setHorizontalPer(left/max);
            }
        }
    }).mouseup(function(){
        if(selectedBar!=null){
            enableSelect();
            $("[scrollbar].selected").removeClass("selected");
        }
        selectedBar = null;
        
    });
    
    //disable text selection for when dragging the scrollbar
    function disableSelect(){
        $("body").attr("disableSelect","");
    }
    function enableSelect(){
        $("body").removeAttr("disableSelect");
    }
    
    //setup the default style for the elements
    function setupStyle(){
        scrollbarInitialised = true;
        $("head").append("<style>"+
            "[scrollPane]{"+
            "   position:relative;"+
            "   overflow: scroll;"+
            "   height:100%;"+
            "   width:100%;"+
            "}"+
            "[scrollPane]::-webkit-scrollbar{"+
            "    display: none;"+//hide scrollbar on mac
            "}"+
            "[scrollContent]{"+
            "   position:relative;"+
            "   min-height:100%;"+
            "   min-width:100%;"+
            "   width:fit-content;"+
            "   height:fit-content;"+
            "   padding: 0.1px;"+ //prevent margin collapse
            "}"+
            "[scrollbar]{"+
            "   z-index:100;"+
            "   position:absolute;"+
            "   box-sizing:border-box;"+
            "}"+
            "[scrollbar]>[bar]{"+
            "   left:0px;"+
            "   top:0px;"+
            "   background-color:#CCC;"+
            "   border: 1px #EEE solid;"+
            "   position:relative;"+
            "   cursor:default;"+
            "   box-sizing:border-box;"+
            "}"+
            "[scrollbar]>[bar]:hover,[scrollbar].selected>[bar]{"+
            "   background-color:#AAA;"+
            "}"+
            "[scrollbar][v]{"+
            "   right:0px;"+
            "   top:0px;"+
            "   width:10px;"+
            "   height:100%;"+
            "}"+
            "[scrollbar][v]>[bar]{"+
            "   width:100%;"+
            "}"+
            "[scrollbar][h]{"+
            "   left:0px;"+
            "   bottom:0px;"+
            "   width:100%;"+
            "   height:10px;"+
            "}"+
            "[scrollbar][h]>div[bar]{"+
            "   height:100%;"+
            "}"+
            "[scrollbarCorner]{"+
            "   z-index:100;"+
            "   position:absolute;"+
            "   bottom:0px;"+
            "   right:0px;"+
            "}"+
            "[disableSelect]{"+
            "   -moz-user-select: none;"+
            "   -webkit-user-select: none;"+
            "   -ms-user-select: none;"+
            "   user-select: none;"+
            "}"+
            "[shadeTop],[shadeBottom],[shadeLeft],[shadeRight]{"+
            "   pointer-events:none;"+
            "   position:absolute;"+
            "   z-index:100;"+
            "}"+
            "[shadeLeft],[shadeRight]{"+
            "   top:0px;"+
            "   height:100%;"+
            "   width:30px;"+
            "}"+
            "[shadeTop],[shadeBottom]{"+
            "   height:30px;"+
            "   width:100%;"+
            "}"+
            "[shadeTop]{"+
            "   top:0px;"+
            "}"+
            "[shadeBottom]{"+
            "   bottom:0px;"+
            "}"+
            "[shadeLeft]{"+
            "   left:0px;"+
            "}"+
            "[shadeRight]{"+
            "   right:0px;"+
            "}"+
        "</style>");
    }
})();