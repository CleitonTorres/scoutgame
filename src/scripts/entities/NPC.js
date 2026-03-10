import { setFacingDirection } from "../engine/FacingDirectio.js";
import { GameObject } from "../engine/GameObject.js";
import { isOverlapping } from "../engine/IsOverlapping.js";
import { NPCController } from "../engine/NPCController.js";
import { sortLayer } from "../engine/SortLayer.js";
import { layers } from "../settings/layers.js";

export class NPC extends GameObject {
    constructor(options= {}) {        
        super({...options});
        this.controller = new NPCController(
            this, 
            options?.patrolPoints || [],
            this.speed
        );
        this.hp = 100; //vida do personagem.
        this.facingDirection = { x: 0, y: 1 };
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
        this.controller.update();
        const { inputX, inputY } = this.controller.getMovement();

        //atualiza o facingDirection para ser usado no disparo.
        setFacingDirection(this, inputX, inputY);

        const state = this.controller.getState();
        this.state = state;

        const collides = grid.query(this.x, this.y);
        
        // layer dinâmica.
        if(this.tag === "NPC"){
            const collided =  collides.find((object)=> {
                const hitbox = 
                    object.getHitbox ? object.getHitbox(object.x, object.y) : object;
                return isOverlapping(this, hitbox)
            });

            if(collided){
                //ordena a layer do player de acordo com o colisor.
                sortLayer(this, collided, this.gridSize); 
            }else{
                this.sortLayer = layers.underFloor;
            }
        }

        super.update(inputX, inputY, collides);
    }

    draw(){
        if (!this.canvas) return;
        const ctx = this.canvas.getContext("2d");
        super.draw();
        this.drawLabel(ctx); //desenha o rótulo do personagem.
    }

    drawLabel(ctx){
        if(!ctx) return;

        //estilo do texto.
        ctx.font = "12px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center"; // left | center | right
        ctx.textBaseline = "bottom"; // top | middle | bottom

        const posx = (this.x * this.gridSize) + (this.width * this.gridSize) / 2;
        const posy = (this.y * this.gridSize);
        //desenha o texto.
        ctx.fillText(this.name, posx, posy);
    }
}
