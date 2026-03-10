export class CharacterController {
    constructor(input) {
        this.input = input;
    }

    getMovement() {
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

    getState(inputX, inputY) {
        const moving = inputX !== 0 || inputY !== 0;

        if (!moving) return "idle";

        if (this.isPushing()) return "push";

        if (Math.abs(inputY) >= Math.abs(inputX)) {
            return inputY < 0 ? "walkUp" : "walkDown";
        }

        return inputX < 0 ? "walkLeft" : "walkRight";
    }
}