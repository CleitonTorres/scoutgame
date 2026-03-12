import { getAnchor } from "./GetAnchor.js";

/**
 * Método para calcular um spaw pointer a partir do centro do spawner.
 * @param {*} spawner - objeto que invoca o spaw.
 * @param {number} spawnGap - distância extra em pixel entre spawner e spaw.
 * @param {*} gridSize - tamanho do tile em px.
 * @returns {{x: number, y: number}}- retorna a posição de spaw do objeto em tiles.
 */
export function getRadiusToSpaw (spawner, spawnGap, gridSize){
    const ballonSizeTiles = 0.35;
    const { x: playerCenterX, y: playerCenterY } = getAnchor(spawner, "middle");
    const playerRadiusPx = spawner.width / 2;
    const ballonRadiusPx = ballonSizeTiles / 2;
    const spawnGapPx = spawnGap / gridSize;
    const spawnDistancePx = playerRadiusPx + ballonRadiusPx + spawnGapPx;
    const ballonCenterX = playerCenterX + (spawner.facingDirection.x * spawnDistancePx);
    const ballonCenterY = playerCenterY + (spawner.facingDirection.y * spawnDistancePx);
    const spawnX = (ballonCenterX - ballonRadiusPx);
    const spawnY = (ballonCenterY - ballonRadiusPx);

    return{
        x: spawnX,
        y: spawnY
    }
}