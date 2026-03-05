import { GameObject } from "../engine/GameObject.js";

export class Player extends GameObject {
    constructor(options= {}) {        
        super({...options});
    }

    /**
     * Atualização do Player
     * Aqui poderíamos futuramente:
     * - Adicionar sistema de vida
     * - Energia
     * - Inventário
     * - Ataque
     */
    update(inputX, inputY, collidables = []) {
        // Chama comportamento base de movimento
        super.update(inputX, inputY, collidables);
    }
}