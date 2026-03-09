import { GameObject } from "../engine/GameObject.js";

/**
 * Pega um ponto de ancoragem de um gameObjeto.
 * @param {GameObject} entity - objeto o qual quer-se pegar o centro.
 * @param {number} gridSize - medida do tile.
 * @param {string} anchor - âncora desejada:
 * topLeft, topCenter, topRight,
 * middleLeft, middle, middleRight,
 * bottomLeft, bottomCenter, bottomRight.
 * Também aceita aliases com "botton*".
 * @returns {{number, number}}  - um objeto contendo centerX e centerY.
 */
export function getAnchor(entity, gridSize, anchor = "middle"){
    if(!entity) return;

    const scale = entity.scale ?? 1;
    const x = entity.x * gridSize;
    const y = entity.y * gridSize;
    const widthPx = (entity.width * gridSize) * scale;
    const heightPx = (entity.height * gridSize) * scale;

    const normalizedAnchor = String(anchor).trim().toLowerCase();
    const anchorAlias = {
        center: "middle",
        topleft: "topLeft",
        topcenter: "topCenter",
        topright: "topRight",
        middleleft: "middleLeft",
        middle: "middle",
        middleright: "middleRight",
        bottomleft: "bottomLeft",
        bottomcenter: "bottomCenter",
        bottomright: "bottomRight",
        bottonleft: "bottomLeft",
        bottoncenter: "bottomCenter",
        bottonright: "bottomRight",
    };
    const resolved = anchorAlias[normalizedAnchor] ?? "middle";

    const points = {
        topLeft: { x, y },
        topCenter: { x: x + widthPx / 2, y },
        topRight: { x: x + widthPx, y },
        middleLeft: { x, y: y + heightPx / 2 },
        middle: { x: x + widthPx / 2, y: y + heightPx / 2 },
        middleRight: { x: x + widthPx, y: y + heightPx / 2 },
        bottomLeft: { x, y: y + heightPx },
        bottomCenter: { x: x + widthPx / 2, y: y + heightPx },
        bottomRight: { x: x + widthPx, y: y + heightPx },
    };

    const point = points[resolved];

    return {
        x: point.x,
        y: point.y
    }
}
