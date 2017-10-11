$ScriptLoader.setLocation("/GUIelements/");
loadOnce("ScrollElement");
$ScriptLoader.loadDir("labels/");
$ScriptLoader.loadDir("inputs/", true);
$ScriptLoader.loadDir("colorPicker/");
loadOnce("/styling/iconElement");
window.ElementTestWindow = class ElementTestWindow extends Window{
    __initVars(){
        super.__initVars()
        this.contentTemplate = {
            html: `<!--<c-scroll vertical fitContent>
                        <div class='p _ElementTestWindow_'>test</div>
                        <div class='p _ElementTestWindow_'>text</div>
                        <div class='p _ElementTestWindow_'>stff</div>
                        <div class='p _ElementTestWindow_'></div>
                        <div class='p _ElementTestWindow_'></div>
                        <div class='p _ElementTestWindow_'></div>
                        <div class='p _ElementTestWindow_'></div>
                        <div class='p _ElementTestWindow_'></div>
                        <div class='p _ElementTestWindow_'></div>
                        <div class='p _ElementTestWindow_'></div>
                    </c-scroll>
                    <c-scroll horizontal fitContent>
                        <div class='o _ElementTestWindow_'>test</div>
                        <div class='o _ElementTestWindow_'>text</div>
                        <div class='o _ElementTestWindow_'>stff</div>
                        <div class='o _ElementTestWindow_'></div>
                        <div class='o _ElementTestWindow_'></div>
                        <div class='o _ElementTestWindow_'></div>
                        <div class='o _ElementTestWindow_'></div>
                        <div class='o _ElementTestWindow_'></div>
                        <div class='o _ElementTestWindow_'></div>
                        <div class='o _ElementTestWindow_'></div>
                    </c-scroll>--!>
                    <c-error>shit is up son</c-error>
                    <c-warning>you did something that is potentially dangerous?</c-warning>
                    <c-success>you did done good</c-success>
                    <c-info>here is some god damn info</c-info>
                    <c-number-input min=0 max=20 decimals=2></c-number-input>
                    <div class=icons>
                        <c-icon src="resources/images/icons/complex test icon.png" size=14></c-icon>cool shit
                    </div>
                    <c-gradient begin=red end=orange direction=diagonalup style=width:50px;height:50px;></c-gradient>
                    <c-color-input></c-color-input>
                    <c-color-input></c-color-input>
                    <c-option-manager-input>
                        <option>poop</option>
                        <option selected>stuff</option>
                        <option>last</option>
                    </c-option-manager-input>
                    <c-shortcut-input shortcut=""></c-shortcut-input>
                    <c-option-manager-input style=width:200px;>
                        <option>poop</option>
                        <option selected>stuff</option>
                        <option>last</option>
                        <option>poop</option>
                        <option selected>stuff</option>
                        <option>last</option>
                        <option>more</option>
                        <option>and more</option>
                    </c-option-manager-input>
                    `,
            style:`.root{
                        min-width: 200px;
//                        height: 200px;
                    }
                    c-scroll[vertical]{
                        width: 20px;
                        height: 200px;
                    }
                    c-scroll[horizontal]{
                        width: 200px;
                        height: 200px;
                        white-space: nowrap;
                    }
                    .p{
                        margin: 10px;
                        background-color: purple;
                    
                        height: 30px;
                        width: 300px;
                    }
                    .o{
                        display: inline-block;
                        word-space: nowrap;
                        width: 30px;
                        height: 200px;
                        margin: 10px;
                        background-color: purple
                    }
                    c-color-input{
                        width: 20px;
                        height: 20px;
                        margin: 5px;
                    }
                    c-option-manager-input{
                        margin: 10px;
                    }`
        }
    }
    __initHtml(){
        super.__initHtml();
    }    
}