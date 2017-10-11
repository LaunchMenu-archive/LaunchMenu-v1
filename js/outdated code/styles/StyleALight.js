/*global variables Inherit, Style, $StyleHandler,*/
loadOnce("../Style");
$StyleHandler.registerStyle(
    window.StyleLight = class StyleLight extends Style{
        constructor(){
            super({
                background: ["#FFF", "#CCC"],
                border: ["#EEE", "#888"],
                font: ["#000", "#BBB"],
                errorFont: ["#900","#D00"],
                highlightBackground: ["#00e9ff", "#8cf5ff"]
            });
        }
    }
);