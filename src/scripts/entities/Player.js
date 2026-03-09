import { GameObject } from "../engine/GameObject.js";
import { isOverlapping } from "../engine/IsOverlapping.js";
import { sortLayer } from "../engine/SortLayer.js";
import { layers } from "../settings/layers.js";

export class Player extends GameObject {
    constructor(options= {}) {        
        super({...options});
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
    update(inputX, inputY, collidables = []) {
        //atualiza o facingDirection para ser usado no disparo.
        const moving = Math.abs(inputX) > 0.001 || Math.abs(inputY) > 0.001;
        if (moving) {
            //hypot calcula a distância de um vetor, mais útil para estabilizar o movimento na diagonal.
            //hypot realiza o calculo de pitagoras para estabelecer um valor equilibrado para o movimento diagonal (hipotenusa)
            const length = Math.hypot(inputX, inputY) || 1;
            this.facingDirection = {
                x: inputX / length,
                y: inputY / length,
            };
        }
        //-----------------------------------------------------

        //verifica se precisa mudar de animação (idle, walkUp, walkDown...)
        this.updateMovementState(inputX, inputY);

        // Chama comportamento base de movimento
        super.update(inputX, inputY, collidables);

        // layer dinâmica do player.
        if(this.tag === "Player"){
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
    }

    updateMovementState (inputX, inputY) {
        const moving = Math.abs(inputX) > 0.001 || Math.abs(inputY) > 0.001;
        if (!moving) {
            this.state = "idle";
            return;
        }

        if (Math.abs(inputX) > Math.abs(inputY)) {
            this.state = inputX > 0 ? "walkRight" : "walkLeft";
            return;
        }

        this.state = inputY > 0 ? "walkDown" : "walkUp";
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
