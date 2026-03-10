import { GameObject } from "../engine/GameObject.js";

/**
 * Parâmetros defaut para instanciar a classe.
 * 
 * {
        name = '',
        tag = 'Wall',

        transform = {
            width = 1,
            height = 1,
            scale = 1
        },
        position = {
            x = 0,
            y = 0
        },
        physical = {
            behavior = 'static',
            speed = 0,
            mass = 0,
            collision = true,
            smooth = 0
        },

        animation = {
            idle: {
                frames: [];
                fps: number;
                loop: boolean;
            },
            ...
        },

        showHitbox = false,
        offSetHitbox = { x: 0, y: 0 },
        offSetBoxCollide = { x: 0, y: 0 },

        gridSize = 64,
        canvas
    }
*/
export class Wall extends GameObject {
    constructor(options = {}) {        
        super({...options});
    }

    // Parede não precisa atualizar movimento
    update() {        
        if(this.animation){
            //verifica se precisa mudar de animação (idle, walkUp, walkDown...)
            this.state = "move";
             
            //update do gameObject
            super.update(0, 0, [])
        }
    }
}
