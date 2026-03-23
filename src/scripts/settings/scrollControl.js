import { InputManager } from "./InputManager";

/**
 * 
 * @param {InputManager} inputManager 
 */
export function scrollControl(inputManager){
    const gamepad = navigator.getGamepads()[0];

    if (gamepad) {
        const ry = inputManager.applyDeadzone(gamepad.axes[3]); // vertical (direito)
        const rx = inputManager.applyDeadzone(gamepad.axes[2]); // horizontal (direito)

        const scrollSpeed = 20;

        if (ry !== 0) {
            window.scrollBy(0, ry * scrollSpeed);
        }
        if(rx){
            window.scrollBy(rx * scrollSpeed, 0);
        }
    }
}