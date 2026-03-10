import { setFacingDirection } from "../engine/FacingDirectio.js";
import { GameObject } from "../engine/GameObject.js";
import { isOverlapping } from "../engine/IsOverlapping.js";
import { sortLayer } from "../engine/SortLayer.js";
import { layers } from "../settings/layers.js";
import { drawLabel } from "../tools/DrawLabel.js";

export class Player extends GameObject {
    constructor(options= {}) {        
        super({...options});
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
        const { inputX, inputY } = this.controller.getMovement();

        this.state = this.controller.getState(inputX, inputY);

        //atualiza o facingDirection para ser usado no disparo.
        setFacingDirection(this, inputX, inputY); 

        //atualiza dados dos NPCs e do Player.
        const collidables = grid?.query(this.x, this.y);

        // Chama comportamento base de movimento
        super.update(inputX, inputY, collidables);

        // layer dinâmica do player.
        const collided =  collidables.find((object)=> {
            const hitbox = object.getHitbox ? object.getHitbox(object.x, object.y) : object;
            return isOverlapping(this, hitbox)
        });

        if(collided){
            //ordena a layer do player de acordo com o colisor.
            sortLayer(this, collided, this.gridSize); 
        }else{
            this.sortLayer = layers.player;
        }
    }

    draw(){
        if (!this.canvas) return;
        const ctx = this.canvas.getContext("2d");
        super.draw();
        drawLabel(this, ctx, this.name); //desenha o rótulo do personagem.
    }
}
