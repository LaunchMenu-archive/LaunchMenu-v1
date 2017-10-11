loadOnce("/window/WindowController.js");
class TestWindow extends Window{
    //src = testFile
    constructor(){
        super();
        console.log("init w2");
        
        //create a third window
        this.controller = new WindowController(class Test2Window extends Window{
            //src = testFile
            constructor(){
                super();
                console.log("init w3");
                $StyleHandler.styles[1].enable();
            }
            receiveSomething(arg1){
                console.log(arg1);
                return "shit";
            }
        }).ready(function(){
            this.sendSomething("w2 -> w3", function(returnVal){
                console.log(returnVal);
            });
        });
    }
    __initVars(){
        super.__initVars();

        this.contentTemplate = {
            html:   `<div class=n></div>`,
            style:  `.n{
                        background-color: orange;
                        min-height: 200px;
                    }`
        };
    }
    __onClose(){
        this.controller.close();
    }
    receiveShit(arg1){
        console.log(arg1);
    }
    __receiveResponseRequest(arg1, arg2, arg3){
        this.sendResponse(arg3, arg2, arg1);
    }
    
    receiveCustomSend(arg1){
        console.log(arg1);
    }
}
class TestWindowController extends WindowController{
    constructor(){
        super({
            load: ["testFile2","WindowController"],
            class: TestWindow
        });
    }
    __initVars(){
        super.__initVars();
        this.windowArgs.title = "TestWindow";
        this.windowArgs.resizable = true;
    }
    receiveResponse(arg1, arg2, arg3){
        console.log(arg1, arg2, arg3);
    }
    __readyFunc(){
        this.sendShit("w1 -> w2");
        this.__sendResponseRequest("w1","->","w2");
        this.sendCustomSend("something");
    }
    
    sendCustomSend(message){
        this.ipc.send("customSend", "AlteredData: "+message);
    }
}

window.controller = new TestWindowController();