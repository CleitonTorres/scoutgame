import { GameObject } from "../engine/GameObject.js";
import { isOverlapping } from "../engine/IsOverlapping0.js";
import { sortLayer } from "../engine/SortLayer.js";

export class Player extends GameObject {
    constructor(options= {}) {        
        super({...options});
        
        this.hp = 100; //vida do personagem.
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

        // layer dinâmica do player.
        if(this.tag === "Player"){
            const collided =  collidables.find((object)=> isOverlapping(this, object));
            if(collided){
                //ordena a layer do player de acordo com o colisor.
                sortLayer(this, collided, this.gridSize); 
                this.sortLayer = this.currentSortLayer;
            }
        }
    }

    draw(){
        const ctx = this.canvas.getContext("2d");
        this.drawLabel(ctx); //desenha o rótulo do personagem.

        super.draw();        
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