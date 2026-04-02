import { anchorsPoints } from "../settings/anchorsPoints.js";

/**
 * Pega um ponto de ancoragem de um gameObjeto.
 * @param {import("../types/types.js").GameObjectInstance} entity - objeto o qual quer-se pegar o centro.
 * @param {number} gridSize - medida do tile.
 * @param {anchorsPoints} anchor - âncora desejada:
 * topLeft, topCenter, topRight,
 * middleLeft, middle, middleRight,
 * bottomLeft, bottomCenter, bottomRight.
 * Também aceita aliases com "botton*".
 * @returns {{x:number, y:number}}  - um objeto contendo X e Y em tiles.
 */
export function getAnchor(entity, anchor = "middle"){
    if(!entity) return {x:0 , y:0 };

    const scale = entity.scale ?? 1;
    const x = entity.nextPosX || entity.x; //em tiles
    const y = entity.nextPosY || entity.y; //em tiles
    const width = (entity.width * scale); //em tiles
    const height = (entity.height * scale); //em tiles

    const normalizedAnchor = String(anchor).trim().toLowerCase();
    const anchorAlias = {
        center: anchorsPoints.middle,
        topleft: anchorsPoints.topLeft,
        topcenter: anchorsPoints.topCenter,
        topright: anchorsPoints.topRight,
        middleleft: anchorsPoints.middleLeft,
        middle: anchorsPoints.middle,
        middleright: anchorsPoints.middleRight,
        bottomleft: anchorsPoints.bottomLeft,
        bottomcenter: anchorsPoints.bottomCenter,
        bottomright: anchorsPoints.bottomRight,
        bottonleft: anchorsPoints.bottomLeft,
        bottoncenter: anchorsPoints.bottomCenter,
        bottonright: anchorsPoints.bottomRight,
    };
    const resolved = anchorAlias[normalizedAnchor] ?? "middle";


    const points = {
        topLeft: { x, y },
        topCenter: { x: x + width / 2, y },
        topRight: { x: x + width, y },
        middleLeft: { x, y: y + height / 2 },
        middle: { x: x + width / 2, y: y + height / 2 },
        middleRight: { x: x + width, y: y + height / 2 },
        bottomLeft: { x, y: y + height },
        bottomCenter: { x: x + width / 2, y: y + height },
        bottomRight: { x: x + width, y: y + height },
    };

    const point = points[resolved];

    return {
        x: point.x,
        y: point.y
    }
}
