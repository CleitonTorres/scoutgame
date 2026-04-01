export class CharacterController {
    /**
     * 
     * @param {{
     *   up: boolean,
     *   down: boolean,
     *   left: boolean,
     *   right: boolean,
     *   shift: boolean,
     *   dialog:  boolean,
     * }} input 
     */
    constructor() {
        this.input = null;
    }

    getMovement() {
        if(!this.input) return {inputX: 0, inputY: 0};
        
        const inputX =
            (this.input.right ? 1 : 0) -
            (this.input.left ? 1 : 0);

        const inputY =
            (this.input.down ? 1 : 0) -
            (this.input.up ? 1 : 0);

        return { inputX, inputY };
    }

    isPushing() {
        return this.input.shift;
    }

    isDialog(){
        return this.input.dialog;
    }
    
    /**
     * 
     * @param {number} inputX 
     * @param {number} inputY 
     * @param {{x: number, y: number}} facingDirection 
     * @returns 
     */
    getState(inputX, inputY, facingDirection) {
        const moving = inputX !== 0 || inputY !== 0;

        if (!moving) {
            if(facingDirection.x === 1){
               return "idleRight" 
            }else if(facingDirection.x === -1){
                return "idleLeft" 
            }else if (facingDirection.y === 1){
                return "idleDown"
            }else if (facingDirection.y === -1){
                return "idleUp"
            }else {
                return "idle"
            }
        };

        if (this.isPushing()) return "push";

        if (Math.abs(inputY) >= Math.abs(inputX)) {
            return inputY < 0 ? "walkUp" : "walkDown";
        }

        return inputX < 0 ? "walkLeft" : "walkRight";
    }

    /**
     * 
     * @param {import("../settings/InputManager.js").InputManager} inputs 
     */
    update(inputs){
        this.input = inputs.state;
        console.log(this.input);
    }
}