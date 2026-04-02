import { GameObject } from "../engine/GameObject.js";

/**
 * Classe de objetos staticos especialmente árvores e plantas.
*/
export class Nature extends GameObject {
    /**
     * 
     * @param {import("../types/types.js").GameObjectType} options 
     */
    constructor(options = {}) {        
        super({...options});
    }    

    /**
     * 
     * @param {import("../types/types.js").SpatialHashGridInstance} _grid 
     * @param {import("../types/types.js").GameInstance} _game
     * @param {{width: number, height: number}} worldTransform 
     * @returns 
     */
    update(_grid, _game, worldTransform){ 
        if(this.animation){
            //verifica se precisa mudar de animação (idle, walkUp, walkDown...)
            this.state = "move";
             
            // Atualiza animação pelo controlador centralizado.
            this.animator?.setState(this.state);
            this.animator?.update(1 / 60);
        }
        super.update(0, 0, [], worldTransform);
    }

    draw() {
        if(this.animation){
            super.draw();
            // drawLabel(this, this.canvas.getContext("2d"), this.x); //desenha o rótulo do personagem.
        }else{
            const ctx = this.canvas.getContext('2d');
            const size = this.gridSize;

            const pixelX = this.x * size;
            const pixelY = this.y * size;

            const width = size * (this.width ?? 1) * (this.scale ?? 1);
            const height = size * (this.height ?? 1) * (this.scale ?? 1);

            const centerX = pixelX + width / 2;

            // Tronco
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(
                centerX - width * 0.1,   // centraliza o tronco
                pixelY + height * 0.5,   // metade da altura
                width * 0.2,             // 20% da largura
                height * 0.5             // metade da altura
            );

            // Copa
            ctx.fillStyle = "#246c1d";

            ctx.beginPath();
            ctx.arc(
                centerX,
                pixelY + height * 0.4,
                width * 0.4,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
}
