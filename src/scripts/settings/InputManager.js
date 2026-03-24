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
            shootPressed: false
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
     */
    _handleKey(key, isPressed) {
        let action = null;
        switch (key) {
            case 'ArrowUp': case 'w': case 'W': action = 'up'; break;
            case 'ArrowDown': case 's': case 'S': action = 'down'; break;
            case 'ArrowLeft': case 'a': case 'A': action = 'left'; break;
            case 'ArrowRight': case 'd': case 'D': action = 'right'; break;
            case 'ShiftLeft': case 'Shift': action = 'shift'; break;
            case 'e': case 'E': action = 'dialog'; break;
            case 'i': case 'I': action = 'inventory'; break;
            case 'q': case 'Q': action = 'quest'; break;
            case ' ': action = 'shootPressed'; break;
            case 'h': case 'H': action = 'help'; break;
            case 'Escape': action = 'escape'; break;
        }

        if (action) {
            this._keyboardState[action] = isPressed;
            // Sincroniza o estado público imediatamente para o teclado
            this.state[action] = isPressed;
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

        if (x < -0.5) this.state.left = true;
        if (x >  0.5) this.state.right = true;
        if (y < -0.5) this.state.up = true;
        if (y >  0.5) this.state.down = true;

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

        this.scrollControl(gamepad)
    }

    /**
     * Limpa os inputs de "ação única" (cliques) após serem processados.
     * Deve ser chamado no FINAL do loop de update do Game.
     */
    clearPresses() {
        const actionsToClear = ['dialog', 'shootPressed', 'inventory', 'quest', 'help', 'escape'];
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