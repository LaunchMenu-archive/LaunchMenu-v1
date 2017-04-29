/*global lm*/
function Menu(){
    
};
var ItemMenu = (function(){
    var ItemMenu = {};
    ItemMenu.show = function(){
        lm(".menu").removeClass("hidden");
    };
    ItemMenu.hide = function(){
        lm(".menu").addClass("hidden");
    };
    return ItemMenu;
})();