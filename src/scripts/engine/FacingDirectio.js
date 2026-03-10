import { GameObject } from "./GameObject.js";

/**
 * atualiza o facingDirection para ser usado no disparo.
 * @param {GameObject} entity 
 * @param {number} inputX 
 * @param {number} inputY 
 */
export function setFacingDirection (entity, inputX, inputY){
    const moving = Math.abs(inputX) > 0.001 || Math.abs(inputY) > 0.001;
    if (moving) {
        //hypot calcula a distância de um vetor, mais útil para estabilizar o movimento na diagonal.
        //hypot realiza o calculo de pitagoras para estabelecer um valor equilibrado para o movimento diagonal (hipotenusa)
        const length = Math.hypot(inputX, inputY) || 1;
        entity.facingDirection = {
            x: inputX / length,
            y: inputY / length,
        };
    }
}