import { setFacingDirection } from "../engine/FacingDirectio.js";
import { GameObject } from "../engine/GameObject.js";
import { sortLayer } from "../engine/SortLayer.js";
import { layers } from "../settings/layers.js";
import { drawLabel } from "../tools/DrawLabel.js";

export class Player extends GameObject {
    constructor(options= {}) {        
        super({...options});
        this.inventory = options?.inventory || null;
        this.hp = 100; //vida do personagem.
        this.facingDirection = { x: 0, y: 1 };
        this.controller = options?.controller || null;
    }

    /**
     * Atualização do Player
     * Aqui poderíamos futuramente:
     * - Adicionar sistema de vida
     * - Energia
     * - Inventário
     * - Ataque
     */
    update(grid) {        
        //se tiver um controller setado pega os valores dos inputs, se não retorna sempre o.
        const { inputX, inputY } = this.controller?.getMovement() || {x: 0, y: 0};

        //se tiver um controller setado pegar o estado atual da animação, se não, retorna idle por padrão.
        this.state = this.controller?.getState(inputX, inputY) || "idle";

        //atualiza o facingDirection para ser usado no disparo.
        setFacingDirection(this, inputX, inputY); 

        //atualiza dados dos NPCs e do Player.
        const collidables = grid?.query(this.x, this.y);

        // Chama o movimento base (que já atualiza todos os hitboxes internamente)
        super.update(inputX, inputY, collidables);

        // Busca automaticamente se algum hitbox detectou colisão
        const collidedHitbox = [...this.hitboxes, ...this.collides].find(box => box.hit);

        //sistema de coleta de itens.
        this.itemPickup()

        if(collidedHitbox){
            // O sortLayer agora recebe o objeto colidido (box.hit)
            sortLayer(this, collidedHitbox.hit, this.gridSize); 
        } else {
            this.sortLayer = layers.player;
        }
    }

    draw(){
        if (!this.canvas) return;
        const ctx = this.canvas.getContext("2d");
        super.draw();
        drawLabel(this, ctx, this.name); //desenha o rótulo do personagem.
    }

    itemPickup(){
        this.hitboxes.forEach(box => {
            if(box.hit?.tag === "Item"){
                box.hit.tryCollect(this);
            }
        });
    }
}
