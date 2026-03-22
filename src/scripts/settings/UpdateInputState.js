let prevGamepadButtons = [];

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
            inputState.kp.up = isPressed;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            inputState.kp.down = isPressed;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            inputState.kp.left = isPressed;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            inputState.kp.right = isPressed;
            break;
        case 'ShiftLeft':
        case 'Shift':
            inputState.kp.shift = isPressed;
            break;
        case 'e' :
        case 'E' :
            inputState.kp.dialog = isPressed;
        case 'i' :
        case 'I' :
            inputState.kp.inventory = isPressed;
            break;
        case 'q' :
        case 'Q' :
            inputState.kp.quest = isPressed;
            break;
    }
}

export function updateGamepadInput(inputState) {
    reset(inputState, 'gp');

    const gamepad = navigator.getGamepads()[0];
    if (!gamepad) return;

    const x = applyDeadzone(gamepad.axes[0]);
    const y = applyDeadzone(gamepad.axes[1]);

    // 🎮 DIREÇÕES (analógico vira digital)
    inputState.gp.left  = x < -0.5 || inputState.gp.left;
    inputState.gp.right = x >  0.5 || inputState.gp.right;
    inputState.gp.up    = y < -0.5 || inputState.gp.up;
    inputState.gp.down  = y >  0.5 || inputState.gp.down;

    // 🎮 BOTÕES
    // 🎯 DETECÇÃO DE CLIQUE (toggle)
    const justPressed = (index) => {
        const pressed = gamepad.buttons[index]?.pressed;
        const prev = prevGamepadButtons[index];
        prevGamepadButtons[index] = pressed;
        return pressed && !prev;
    };

    inputState.gp.shift  = gamepad.buttons[4]?.pressed || inputState.gp.shift; // LB
    inputState.gp.dialog = justPressed(0); // A
    inputState.gp.shootPressed = justPressed(7); // RT
    inputState.gp.inventory = justPressed(3); // Y
    inputState.gp.quest = justPressed(2); // X
}

function applyDeadzone(value, threshold = 0.15) {
    return Math.abs(value) < threshold ? 0 : value;
}

function reset(inputState, type="kp"){
    // reset
    inputState[type].up = false;
    inputState[type].down = false;
    inputState[type].left = false;
    inputState[type].right = false;
    inputState[type].shift = false;
    inputState[type].dialog = false;
    inputState[type].shootHeld = false;
    inputState[type].shootPressed = false;
    inputState[type].inventory = false;
    inputState[type].quest = false;
}