/**
 * recebe o caminho da imagem a ser carregada.
 * @param {*} src - caminho da imagem a ser carregada.
 * @returns 
 */
export async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
        img.src = src;
    });
}