import { setFacingDirection } from "../engine/FacingDirectio.js";
import { GameObject } from "../engine/GameObject.js";
import { NPCController } from "../engine/NPCController.js";
import { sortLayer } from "../engine/SortLayer.js";
import Canvas from "../settings/Canvas.js";
import { layers } from "../settings/layers.js";
import { FloatingLabel } from "../tools/DrawLabel.js";

export class NPC extends GameObject {
    constructor(options= {}) {        
        super({...options});
        this.controller = new NPCController(
            this, 
            options?.patrolPoints || [],
            this.speed
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
    update(grid, _game, worldTransform) {        
        this.controller.update();
        const { inputX, inputY } = this.controller.getMovement();

        //atualiza o facingDirection para ser usado no disparo.
        setFacingDirection(this, inputX, inputY);

        const state = this.controller.getState();
        this.state = state;

        const collidables = grid.query(this.x, this.y);
                
        // Chama o movimento base (que já atualiza todos os hitboxes internamente)
        super.update(inputX, inputY, collidables, worldTransform);

        this.floatingLabel.update();
    }

    draw(){
        super.draw();
        this.floatingLabel.draw(Canvas.getContext(), this);
    }
}
