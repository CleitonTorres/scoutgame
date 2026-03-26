/**
 * Classe InputManager
 * Gerencia inputs unificados de Teclado e Gamepad.
 */
export class InputManager {
    constructor() {
        // Estado atual que o jogo deve ler (up, down, left, right, etc.)
        this.state = {
            up: false,
            down: false,
            left: false,
            right: false,
            shift: false,
            dialog: false,
            inventory: false,
            quest: false,
            shootPressed: false,
            leftPressed: false,
            rightPressed: false
        };

        // Buffer interno para o estado do teclado (baseado em eventos)
        this._keyboardState = { ...this.state };

        // Buffer interno para o estado anterior do gamepad (para detectar cliques únicos)
        this._prevGamepadButtons = new Array(16).fill(false);

        // Configurações de sensibilidade do controle analógico gamepad.
        this.deadzone = 0.15;

        // Inicializa os listeners de teclado
        this._initKeyboardListeners();
    }

    /**
     * Configura os event listeners do navegador para o teclado.
     */
    _initKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            e.preventDefault();
            this._handleKey(e.key, true)
        });
        window.addEventListener('keyup', (e) => this._handleKey(e.key, false));
    }

    /**
     * Mapeia as teclas para as ações do jogo.
     * @param {string} key
     * @param {boolean} isPressed
     */
    _handleKey(key, isPressed) {
        let action = null;
        let pressAction = null;
        
        switch (key) {
            case 'ArrowUp': case 'w': case 'W': action = 'up'; break;
            case 'ArrowDown': case 's': case 'S': action = 'down'; break;
            case 'ArrowLeft': case 'a': case 'A': 
                action = 'left'; 
                if (isPressed && !this._keyboardState.left) pressAction = 'leftPressed';
                break;
            case 'ArrowRight': case 'd': case 'D': 
                action = 'right'; 
                if (isPressed && !this._keyboardState.right) pressAction = 'rightPressed';
                break;
            case 'e': case 'E': case 'Enter':
                if (isPressed && !this._keyboardState.dialog) action = 'dialog'; 
                break;
            case 'i': case 'I': 
                if (isPressed && !this._keyboardState.inventory) action = 'inventory'; 
                break;
            case 'q': case 'Q': 
                if (isPressed && !this._keyboardState.quest) action = 'quest'; 
                break;
            case ' ': 
                if (isPressed && !this._keyboardState.shootPressed) action = 'shootPressed';  
                break;
            case 'h': case 'H': action = 'help'; break;
            case 'Escape': action = 'escape'; break;
            case 'ShiftLeft': case 'Shift': action = 'shift'; break;
        }

        // Sincroniza o estado público imediatamente para o teclado
        if (action) {
            this._keyboardState[action] = isPressed;            
            this.state[action] = isPressed;
        }
        if (pressAction) {
            this._keyboardState[pressAction] = isPressed;
            this.state[pressAction] = isPressed;
        }
    }

    /**
     * Atualiza o estado combinando Teclado e Gamepad.
     * Deve ser chamado no INÍCIO de cada frame do loop de update.
     */
    update() {
        // 1. Resetamos o estado público para o que o teclado está enviando
        Object.assign(this.state, this._keyboardState);

        // 2. Tenta ler o Gamepad
        const gamepad = navigator.getGamepads()[0];
        if (!gamepad) {
            this._prevGamepadButtons.fill(false);
            return;
        }

        // 3. Processa Analógicos (Direções)
        const x = this._applyDeadzone(gamepad.axes[0]);
        const y = this._applyDeadzone(gamepad.axes[1]);

        // Direção contínua (para movimento)
        if (x < -0.5) this.state.left = true;
        if (x >  0.5) this.state.right = true;
        if (y < -0.5) this.state.up = true;
        if (y >  0.5) this.state.down = true;

        // Direção única (para menus)
        const wasLeft = this._prevGamepadButtons[14]; // D-pad Left
        const wasRight = this._prevGamepadButtons[15]; // D-pad Right
        const isLeft = gamepad.buttons[14]?.pressed || x < -0.7;
        const isRight = gamepad.buttons[15]?.pressed || x > 0.7;

        if (isLeft && !wasLeft) this.state.leftPressed = true;
        if (isRight && !wasRight) this.state.rightPressed = true;

        // 4. Processa Botões (Hold e Just Pressed)
        const isJustPressed = (index) => {
            const pressed = gamepad.buttons[index]?.pressed || false;
            const wasPressed = this._prevGamepadButtons[index];
            return pressed && !wasPressed;
        };

        // Segurar (Hold)
        if (gamepad.buttons[4]?.pressed) this.state.shift = true; // LB

        // Clique Único (Just Pressed)
        if (isJustPressed(0)) this.state.dialog = true;       // Botão A
        if (isJustPressed(7)) this.state.shootPressed = true; // Gatilho RT
        if (isJustPressed(3)) this.state.inventory = true;    // Botão Y
        if (isJustPressed(2)) this.state.quest = true;        // Botão X

        // 5. Salva o estado dos botões para o próximo frame
        for (let i = 0; i < gamepad.buttons.length; i++) {
            this._prevGamepadButtons[i] = gamepad.buttons[i].pressed;
        }
        // Também salva o estado do analógico no buffer de botões para detecção de clique
        this._prevGamepadButtons[14] = x < -0.7;
        this._prevGamepadButtons[15] = x > 0.7;

        this.scrollControl(gamepad)
    }

    /**
     * Limpa os inputs de "ação única" (cliques) após serem processados.
     * Deve ser chamado no FINAL do loop de update do Game.
     */
    clearPresses() {
        const actionsToClear = ['dialog', 'shootPressed', 'inventory', 'quest', 'help', 'escape', 'leftPressed', 'rightPressed'];
        actionsToClear.forEach(action => {
            this.state[action] = false;
            this._keyboardState[action] = false;
        });
    }

    /**
     * Aplica zona morta ao analógico.
     */
    _applyDeadzone(value) {
        return Math.abs(value) < this.deadzone ? 0 : value;
    }

    /**
     * 
     * @param {Gamepad} gamepad 
     */
    scrollControl(gamepad){
        if (gamepad) {
            const ry = this._applyDeadzone(gamepad.axes[3]); // vertical (direito)
            const rx = this._applyDeadzone(gamepad.axes[2]); // horizontal (direito)

            const scrollSpeed = 20;

            if (ry !== 0) {
                window.scrollBy(0, ry * scrollSpeed);
            }
            if(rx){
                window.scrollBy(rx * scrollSpeed, 0);
            }
        }
    }
}