import { tags } from "../settings/tags.js";
import { loadImage } from "./LoadImage.js";

//verifica se existe uma animação.
export const hasAnimation= (animation={})=> {
    return Object.keys(animation).length > 0;
}

/**
 * NORMALIZAÇÃO DE ANIMAÇÕES
 * ------------------------------------------------------
 * Esse método recebe o objeto de animações configurado
 * pelo desenvolvedor e converte tudo para um formato
 * interno padrão da engine.
 * 
 * Ele permite dois formatos de entrada:
 * 
 * 1) Forma simples:
 *    idle: [img1, img2, img3]
 * 
 * 2) Forma completa:
 *    idle: {
 *       frames: [
 *       //se for um sprite sheet
 *         * { 
 *              image: spriteSheet,
 *              sx: 0,
 *              sy: 0,
 *              sw: 32, //largura sprite
 *              sh: 32 // altura sprite
 *           },
 *        // se for uma imagem frame.
 *          img1,
 *          ...
 *       ],
 *       fps: 12,
 *       loop: false
 *    }
 * 
 * O objetivo é padronizar tudo para:
 * {
 *   frames: [],
 *   fps: number,
 *   loop: boolean
 * }
 * @typedef {{[anim:string]:{frames: [], fps: number, loop: boolean}}} AnimationType
 * @returns {AnimationType} - retorna um objeto padronizado com as animações possiveis.
 */
export function normalizeAnimation(animation = {}) {
    if(!hasAnimation(animation)) return {};

    // Objeto final normalizado que será retornado.
    const normalized = {};

    // Percorre todos os estados recebidos (ex: idle, walkUp, move, hit...)
    for (const [key, clip] of Object.entries(animation)) {

        // Se o desenvolvedor não definiu essa animação,
        // simplesmente ignora.
        if (!clip) continue;

        /**
         * CASO 1: O desenvolvedor passou apenas um array
         * Exemplo:
         * walkDown: [img1, img2, img3]
         */
        if (Array.isArray(clip)) {
            normalized[key] = {
                frames: clip.filter(Boolean), // Remove valores inválidos (null/undefined)
                fps: 8, // FPS padrão da engine
                loop: true, // Por padrão animações entram em loop
            };
            continue;
        }

        /**
         * CASO 2: O desenvolvedor passou objeto completo
         * Exemplo:
         * idle: {
         *   frames: [...],
         *   fps: 12,
         *   loop: false
         * }
         */
        const frames = Array.isArray(clip.frames) ? clip.frames.filter(Boolean) : [];
        
        // Se não houver frames válidos, ignora essa animação
        if (frames.length === 0) continue;

        normalized[key] = {
            frames,
            fps: Math.max(1, clip.fps ?? 8), // Garante FPS mínimo de 1
            // Se loop for explicitamente false, respeita.
            // Caso contrário, assume true.
            loop: clip.loop !== false,
        };
    }

    // Retorna o objeto já padronizado
    return normalized;
} 

/**
 * DESENHA A ANIMAÇÃO ATUAL
 * --------------------------------------------------
 * Esse método tenta desenhar o frame atual
 * da animação ativa no canvas.
 * 
 * Ele suporta:
 * 1) Frames como imagem direta (Image, Canvas, Bitmap)
 * 2) Frames como recorte de sprite sheet
 * 
 * Retorna:
 * true  -> se conseguiu desenhar
 * false -> se não havia animação válida
 * @param {import("./GameObject.js").GameObject} entity - entity é o this da classe.
 * @param {CanvasRenderingContext2D} ctx - contexto do canvas onde será desenha.
 * @returns {boolean} - se conseguiu desenhar retorna true, se não false.
 */
export function drawAnimation(entity, ctx) {
    // Pega o clip da animação atual (ex: idle, walkDown...)
    const clip = entity.animation[entity.currentAnimation];

    /**
    * Converte posição lógica (grid)
    * para posição real em pixels
    */
    const drawX = entity.x * entity.gridSize;
    const drawY = entity.y * entity.gridSize;
    const drawW = (entity.gridSize * (entity.width ?? 1)) * (entity.scale ?? 1);
    const drawH = (entity.gridSize * (entity.height ?? 1)) * (entity.scale ?? 1);

    // Se não houver animação válida, verifica se tem um sprite para desenhar.
    if (!clip || clip.frames.length === 0) {
        if(entity.sprite){
            const img = new Image();
            img.src = entity.sprite;
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            return true;
        }
        
        return false;
    };

    // Seleciona o frame atual da animação
    const frame = clip.frames[entity.animationFrame] || clip.frames[0];
    if (!frame) return false;

    

    /**
    * Detecta se o frame é uma imagem direta
    * (sprite independente)
    */
    const isImage = typeof HTMLImageElement !== 'undefined' && frame instanceof HTMLImageElement;
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && frame instanceof HTMLCanvasElement;
    const isBitmap = typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap;

    // Detecta se precisa espelhar
    const flipX = entity.facingDirection?.x === -1;
    
    // Caso 1: frame é uma imagem direta
    if (isImage || isCanvas || isBitmap) {        
        if(entity.tag === tags.PLAYER && flipX && entity.state === "push" ){ 
            ctx.save();
            ctx.scale(-1, 1);
            const x = flipX ? -drawX - drawW : drawX;
            ctx.drawImage(frame, x, drawY, drawW, drawH);
            ctx.restore();
            return true;
        }

        ctx.drawImage(frame, drawX, drawY, drawW, drawH);
        return true;
    }

    /**
    * Caso 2: frame é parte de uma sprite sheet
    * 
    * Exemplo de estrutura esperada:
    * {
    *   image: spriteSheet,
    *   sx: 0,
    *   sy: 0,
    *   sw: 32,
    *   sh: 32
    * }
    */
    if (frame.image && frame.sx !== undefined) {
        const sx = frame.sx ?? 0;
        const sy = frame.sy ?? 0;

        // Define largura e altura do recorte
        const sw = frame.sw ?? frame.frameWidth ?? frame.image.width;
        const sh = frame.sh ?? frame.frameHeight ?? frame.image.height;        

        if(entity.tag === tags.PLAYER && flipX && entity.state === "push" ){ 
            ctx.save();
            ctx.scale(-1, 1);
            const x = flipX ? -drawX - drawW : drawX;
            ctx.drawImage(frame.image, sx, sy, sw, sh, x, drawY, drawW, drawH);
            ctx.restore();
            return true;
        }

        ctx.drawImage(frame.image, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
        return true;
    }

    // Se não conseguiu desenhar, retorna false
    return false;
}

/**
 * Recebe os caminhos de sprites que serão usados em animações.
 * @param {Array} pathToAnimations - objeto contendo os caminhos dos sprites de cada estado de animação.
 * @param {number} fps - velocidade da animação.
 * @param {boolean} loop - se a animação vai rodar em loop.
 * @returns {Promise<{string: {frames: [], fps: number, loop: boolean }}>} - um objeto com com as animaçoes possiveis, já com imagens já carregadas.
 */
export async function loadAnimations(pathToAnimations, fps=6, loop=true) {
  const loadFrames = async (paths = []) =>
    Promise.all(paths.map(loadImage));

  const animations = {};

  for (const key in pathToAnimations) {
    animations[key] = {
        frames: await loadFrames(pathToAnimations[key]),
        fps,
        loop
    };
  }

  return animations;
}
// -------------------------------------------------
