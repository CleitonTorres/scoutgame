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
        this.hp = 100; //vida do NPC.
        this.isDead = false; //estado de vida do NPC.
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
     * @param {import("../types/types.js").SpatialHashGridInstance} grid
     * @param {import("../types/types.js").GameInstance} game
     */
    update(grid, game) { 
        // Se o NPC estiver morto, ele não deve realizar nenhuma ação além de atualizar sua animação de morte. 
        if (this.isDead) {
            this.state = "dead";
            this.animator.setState(this.state);
            this.animator.update(1 / 60);
            game.removeObject(this); // Remove o NPC do jogo após a animação de morte (opcional, dependendo do design do jogo)
            return;
        }
        
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

    // Novo método para processar o dano
    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.state = "dead";
            // Desativa explicitamente todos os hitboxes e colliders
            this.hitboxes.forEach(h => h.collision = false);
            this.collides.forEach(c => c.collision = false);
        }
    }
}
