import { Player } from "../entities/Player.js";
import { GameObject } from "./GameObject.js";

/**
 * Função que seta a layers do player pela profundidade (Y) entre ele e o colisor.
 * @param {Player} entityA 
 * @param {GameObject} entityB 
 * @param {number} gridsize 
 */
export function sortLayer(entityA, entityB, gridsize){
    if(!entityA.x || !entityB.y || !gridsize) return;

    const posyA = entityA.y * gridsize; //converte a posição logica (tile) para pixel.
    const posyB = entityB.y * gridsize; //converte a posição logica para pixel.

    if(posyA < posyB){
        entityA.currentSortLayer = entityB.sortLayer-1;
    }else{
        entityA.currentSortLayer = entityB.sortLayer+1;
    }
}