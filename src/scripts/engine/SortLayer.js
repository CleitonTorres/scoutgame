import { getAnchor } from "../mathh/GetAnchor.js";

/**
 * Função que seta a layers do player pela profundidade (Y) entre ele e o colisor.
 * @param {import("../entities/Player.js").Player} entityA 
 * @param {import("./GameObject.js").GameObject} entityB 
 * @param {number} gridsize 
 */
export function sortLayer(entityA, entityB, gridsize){
    if (!entityA || !entityB || !Number.isFinite(gridsize) || gridsize <= 0) return;
    if(entityA.name === entityB.owner?.name) return;

    // Se entityB for um colisor, usamos o 'owner' dele.
    const target = entityB.owner ? entityB.owner : entityB;

    // Compara profundidade pelo "pé" do objeto (âncora bottomCenter).
    const posyA = getAnchor(entityA, "bottomCenter").y;
    const posyB = getAnchor(target, "bottomCenter").y;

    if (posyA < posyB) {
        entityA.sortLayer = target.sortLayer - 1;
    } else {
        entityA.sortLayer = target.sortLayer + 1;
    }
}
