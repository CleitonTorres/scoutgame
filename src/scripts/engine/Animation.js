import { loadImage } from "./LoadImage.js";

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
 * @returns {{string:{frames: [], fps: number, loop: boolean}}} - retorna um objeto padronizado com as animações possiveis.
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

 //verifica se existe uma animação.
export const hasAnimation= (animation={})=> {
    return Object.keys(animation).length > 0;
}


/**
 * Define qual animação deve tocar com base na direção do input.
 *  Exemplo:
 *  inputX = 1  -> walkRight
 *  inputY = -1 -> walkUp
 * @param {number} inputX 
 * @param {number} inputY 
 * @param {} entity - objeto classe a ter a animação setada.
 * @returns {{}} - currentAnimation, animationFrame, animationElapsed
 */
export function setAnimationState(inputX, inputY, entity) {
    if (!hasAnimation(entity.animation)) return;

    const moving = Math.abs(inputX) > 0.001 || Math.abs(inputY) > 0.001;
    let next = ['Ballon', 'Tree'].includes(entity.tag) ? 'move' : 'idle';

    if (moving) {
        if(['Ballon', 'Tree'].includes(entity.tag)){
            next = 'move';
        }
        else if (Math.abs(inputY) >= Math.abs(inputX)) {
            next = inputY < 0 ? 'walkUp' : 'walkDown';
        } else {
            next = inputX < 0 ? 'walkLeft' : (entity.animation.walkRight ? 'walkRight' : 'walkLeft');
        }
    }

    //se não existir a animação setada em next tenta setar para idle ou para a primeira animação do objeto.
    if (!entity.animation[next]) {
        next = entity.animation.idle ? 'idle' : Object.keys(entity.animation)[0];
    }

    // se a animação atual for diferente a animação verificada em next. Troca ela resentando os valores.
    if (entity.currentAnimation !== next) {
        entity.currentAnimation = next;
        entity.animationFrame= 0;
        entity.animationElapsed= 0;
    }
}

/**
 * 
 * @param {number} deltaSeconds - time do loop FPS.
 * @param {{}} animation - animações possíveis.
 * @param {string} currentAnimation - key da animação atual.
 * @param {number} animationElapsed - tempo decorrido entre animações.
 * @param {number} animationFrame - indice da animação atual.
 * @returns {void} - chamada no update.
 */
export function updateAnimation(entity, deltaSeconds = 1 / 60) {
    if (!hasAnimation(entity.animation) || !entity) return;
    

    const clip = entity.animation[entity.currentAnimation];
    if (!clip || clip.frames.length <= 1) return;

    entity.animationElapsed += deltaSeconds;
    const frameDuration = 1 / Math.max(1, clip.fps);

    while (entity.animationElapsed >= frameDuration) {
        entity.animationElapsed -= frameDuration;
        entity.animationFrame += 1;

        if (entity.animationFrame >= clip.frames.length) {
            entity.animationFrame = clip.loop ? 0 : clip.frames.length - 1;
        }
    }
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
 * @param - entity é o this da classe.
 * @param - contexto do canvas onde será desenha.
 * @returns {boolean} - se conseguiu desenhar retorna true, se não false.
 */
export function drawAnimation(entity, ctx) {
    // Pega o clip da animação atual (ex: idle, walkDown...)
    const clip = entity.animation[entity.currentAnimation];

    // console.log("clip", entity.tag, entity.animation, clip)

    // Se não houver animação válida, não desenha
    if (!clip || clip.frames.length === 0) return false;

    // Seleciona o frame atual da animação
    const frame = clip.frames[entity.animationFrame] || clip.frames[0];
    if (!frame) return false;

    /**
    * Converte posição lógica (grid)
    * para posição real em pixels
    */
    const drawX = entity.x * entity.gridSize;
    const drawY = entity.y * entity.gridSize;
    const drawW = entity.gridSize * (entity.width ?? 1) * (entity.scale ?? 1);
    const drawH = entity.gridSize * (entity.height ?? 1) * (entity.scale ?? 1);

    /**
    * Detecta se o frame é uma imagem direta
    * (sprite independente)
    */
    const isImage = typeof HTMLImageElement !== 'undefined' && frame instanceof HTMLImageElement;
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && frame instanceof HTMLCanvasElement;
    const isBitmap = typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap;

    // Caso 1: frame é uma imagem direta
    if (isImage || isCanvas || isBitmap) {
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
