export function drawLabel(entity, ctx, text){
    if(!ctx || !entity) return;

    //estilo do texto.
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center"; // left | center | right
    ctx.textBaseline = "bottom"; // top | middle | bottom

    const posx = (entity.x * entity.gridSize) + (entity.width * entity.gridSize) / 2;
    const posy = (entity.y * entity.gridSize);
    //desenha o texto.
    ctx.fillText(text, posx, posy);
}