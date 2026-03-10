import { GameObject } from "./GameObject.js";

/**
 * Verifica colisão entre dois retângulos (AABB collision). Essa técnica é chamada de Axis-Aligned Bounding Box (AABB).
 * @param {GameObject} objectA 
 * @param {GameObject} objectB 
 * @returns 
 */
export function isOverlapping(objectA, objectB) {
    //evita colisão consigo mesmo
    if(objectA === objectB) return;

    return (
        objectA.x < objectB.x + objectB.width &&
        objectA.x + objectA.width > objectB.x &&
        objectA.y < objectB.y + objectB.height &&
        objectA.y + objectA.height > objectB.y
    );
}