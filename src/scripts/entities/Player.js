import { GameObject } from "../engine/GameObject.js";
import { isOverlapping } from "../engine/IsOverLapping.js";
import { sortLayer } from "../engine/SortLayer.js";
import { layers } from "../settings/layers.js";

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
        for (const object of collidables) {
            if(isOverlapping(this, object) && this.tag === "Player"){
                //ordena a layer do player de acordo com o colisor.
                sortLayer(this, object, this.gridSize); 
                this.sortLayer = this.currentSortLayer;
            }else{
                this.sortLayer = layers.player;
            }
        }
    }

    draw(){
        const ctx = this.canvas.getContext("2d");
        this.drawHP(ctx); //desenha o HP do personagem.
        this.drawLabel(ctx); //desenha o rótulo do personagem.

        super.draw();        
    }

    drawHP(ctx){
        if(!ctx) return;

        //desenha a barra do plano de fundo do HP.
        ctx.fillStyle = "grey";
        ctx.fillRect(10, 10, 100, 20);

        //desenha a barra do plano superior do HP.
        ctx.fillStyle = "red";
        ctx.fillRect(10, 10, this.hp, 20);

        //salva o estado atual do contexto antes de transformar.
        ctx.save();
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