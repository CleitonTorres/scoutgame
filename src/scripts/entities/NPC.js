import { setFacingDirection } from "../engine/FacingDirectio.js";
import { GameObject } from "../engine/GameObject.js";
import { NPCController } from "../engine/NPCController.js";
import Canvas from "../settings/Canvas.js";
import { FloatingLabel } from "../tools/DrawLabel.js";

export class NPC extends GameObject {
    /**
     * 
     * @param {import("../types/types.js").NPCType} options 
     */
    constructor(options= {}) {        
        super({
            ...options
        });
        this.controller = new NPCController(
            this,
            options.patrolPoints || [],
            options.physical.speed,
            options.autoPatrol,
        );
        /**
         * @type {import("../engine/Quest/QuestData.js").QuestData}
         */
        this.quest = options.quest || null;
        this.hp = 100; //vida do personagem.
        this.facingDirection = { x: 0, y: 1 };
        this.floatingLabel = new FloatingLabel({text: this.name});
    }

    /**
     * Atualização do Player
     * Aqui poderíamos futuramente:
     * - Adicionar sistema de vida
     * - Energia
     * - Inventário
     * - Ataque
     */
    update(grid, game) {  
        // 1. Busca os objetos próximos no grid
        const collidables = grid.query(this.x, this.y);

        // 3. O controlador decide o movimento baseado na colisão atualizada.
        this.controller.update(game);
        const { inputX, inputY } = this.controller.getMovement();

        // 4. Atualiza o estado e a direção visual do NPC com base no input do controlador.
        setFacingDirection(this, inputX, inputY);

        const state = this.controller.getState();
        this.state = state;
                
         // 5. Chama o movimento base (física, resolveAxis, etc.)
        super.update(inputX, inputY, collidables);

        this.floatingLabel.update();
    }

    draw(){
        super.draw();
        this.floatingLabel.draw(Canvas.getContext(), this);
    }
}
