/**
 * 
 * @param {import("../engine/GameObject").GameObject} objects 
 * @param {import("../engine/SpatialHashGrid").SpatialHashGrid} grid 
 */
export function updateWorld(objects, grid) {
    grid.clear();

    for (const obj of objects) {
        grid.insert(obj);
    }
}