/*global variables Inherit, Style, $StyleHandler,*/
loadOnce("../Style");
$StyleHandler.registerStyle(
    class StyleDark extends Style{
        constructor(){
            super({
                background: ["#222", "#555"],
                border: ["#777", "#AAA"],
                font: ["#DDD", "#888"],
                errorFont: ["#900","#D00"],
                highlightBackground: ["#af4900", "#ce5f10"],
                warningBlack: "#FF00FF"
            });
        }
    }
);