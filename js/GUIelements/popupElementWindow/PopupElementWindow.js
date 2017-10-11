loadOnce("/window/Window");
window.PopupElementWindow = class PopupElementWindow extends Window{
    __initVars(){
        super.__initVars();
        this.frameTemplate = {
            html:   `<div class='pointer bd5'></div>
                    <div class='bd3 bg0 body'>
                        <div class=content>
                            _CONTENT_
                        </div>
                    </div>`,
            style:  `.body{                            
                        width: fit-content;
                        height: fit-content;
                        position: relative;
                        
                        overflow: hidden;
                        
                        margin: 10px;
                        margin-top: 0px;
                        box-shadow: 0px 0px 10px 2px rgba(0,0,0,0.2);
                          -webkit-user-select: none;
                          -webkit-app-region: no-drag;
                          
                          min-width: 50px;
                          min-height: 10px;
                          border-width: 1px;
                          
                          z-index: -1;
                    }
                    .pointer{
                        position: relative;
                        left: 50%;
                        width: 0px;
                        transform: translate(-50%, 0);
                        border-left-width: 20px;
                        border-right-width: 20px;
                        border-left-color: transparent;
                        border-right-color: transparent;
                        border-bottom-width: 10px;
                    }`
        };
    }
};