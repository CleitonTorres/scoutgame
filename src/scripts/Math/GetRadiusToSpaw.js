import { getCenter } from "./GetCenter.js";

/**
 * Método para calcular um spaw pointer a partir do centro do spawner.
 * @param {*} spawner - objeto que invoca o spaw.
 * @param {number} spawnGap - distância extra em pixel entre spawner e spaw.
 * @param {*} gridSize - tamanho do tile em px.
 * @returns - retorna a posição de spaw do objeto.
 */
export function getRadiusToSpaw (spawner, spawnGap, gridSize){
    const ballonSizeTiles = 0.35;
    const { centerX: playerCenterX, centerY: playerCenterY } = getCenter(spawner, gridSize);
    const playerRadiusPx = (spawner.width * gridSize) / 2;
    const ballonRadiusPx = (ballonSizeTiles * gridSize) / 2;
    const spawnGapPx = spawnGap;
    const spawnDistancePx = playerRadiusPx + ballonRadiusPx + spawnGapPx;
    const ballonCenterX = playerCenterX + (spawner.facingDirection.x * spawnDistancePx);
    const ballonCenterY = playerCenterY + (spawner.facingDirection.y * spawnDistancePx);
    const spawnX = (ballonCenterX - ballonRadiusPx) / gridSize;
    const spawnY = (ballonCenterY - ballonRadiusPx) / gridSize;

    return{
        spawnX,
        spawnY
    }
}