import { Player } from "../entities/Player.js";
import { getAnchor } from "../mathh/GetAnchor.js";
import { GameObject } from "./GameObject.js";

/**
 * Função que seta a layers do player pela profundidade (Y) entre ele e o colisor.
 * @param {Player} entityA 
 * @param {GameObject} entityB 
 * @param {number} gridsize 
 */
export function sortLayer(entityA, entityB, gridsize){
    if (!entityA || !entityB || !Number.isFinite(gridsize) || gridsize <= 0) return;

    // Compara profundidade pelo "pé" do objeto (âncora bottomCenter).
    const posyA = getAnchor(entityA, gridsize, "bottomCenter").y;
    const posyB = getAnchor(entityB, gridsize, "bottomCenter").y;

    if (posyA < posyB) {
        entityA.sortLayer = entityB.sortLayer - 1;
    } else {
        entityA.sortLayer = entityB.sortLayer + 1;
    }
}
