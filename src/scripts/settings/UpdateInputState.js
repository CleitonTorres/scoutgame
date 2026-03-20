/**
 * Atualiza o estado das teclas pressionadas com base no evento de teclado
 * @param {string} key 
 * @param {boolean} isPressed 
 * @param {{[key:string]: boolean}} inputState 
 */
export function updateInputState(key, isPressed, inputState) {
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            inputState.up = isPressed;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            inputState.down = isPressed;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            inputState.left = isPressed;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            inputState.right = isPressed;
            break;
        case 'ShiftLeft':
        case 'Shift':
            inputState.shift = isPressed;
            break;
        case 'e' :
        case 'E' :
            inputState.dialog = isPressed;
    }
}