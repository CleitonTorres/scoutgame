export class AnimationController {
    constructor(entity) {
        // 1️⃣ Referência para a entidade dona desta animação.
        // Normalmente será um GameObject (Player, Ballon, Tree, etc).
        // Isso permite acessar os dados de animação armazenados na entidade.
        this.entity = entity;

        // 2️⃣ Nome da animação atual (ex: "idle", "move", "hit").
        this.current = null;

        // 3️⃣ Índice do frame atual dentro da animação.
        // Exemplo: se a animação possui 4 frames → índices 0,1,2,3.
        this.frame = 0;

        // 4️⃣ Tempo acumulado desde a última troca de frame.
        // Usado para controlar a velocidade da animação.
        this.elapsed = 0;
    }

    // 5️⃣ Getter que retorna o "clip" da animação atual.
    // Um clip contém os frames, fps, loop, etc.
    get clip() {
        return this.entity.animation?.[this.current];
    }

    setState(state) {
        // 6️⃣ Obtém o objeto de animações da entidade.
        const animation = this.entity?.animation;

        // 7️⃣ Se não existir animação ou o objeto estiver vazio,
        // não há nada para atualizar.
        if (!animation || Object.keys(animation).length === 0) return;

        // 8️⃣ Resolve qual animação será usada.
        // A ordem de fallback é:
        // - animação solicitada
        // - "idle"
        // - primeira animação disponível
        const resolved =
            animation[state]
            ? state
            : animation.idle
            ? "idle"
            : Object.keys(animation)[0];

        // 9️⃣ Se já estamos na animação correta,
        // não é necessário reiniciar a animação.
        if (this.current === resolved) return;

        // 🔟 Define a nova animação atual.
        this.current = resolved;

        // 11️⃣ Reinicia o frame da animação.
        this.frame = 0;

        // 12️⃣ Reinicia o tempo acumulado da animação.
        this.elapsed = 0;
    }

    update(delta = 1/60) {
        // 13️⃣ Obtém o clip da animação atual.
        const clip = this.clip;

        // 14️⃣ Se não houver animação definida, não faz nada.
        if (!clip) return;

        // 15️⃣ Soma o tempo passado desde o último update.
        this.elapsed += delta;

        // 16️⃣ Calcula quanto tempo cada frame deve durar.
        // Exemplo: fps = 8 → cada frame dura 0.125 segundos.
        const frameDuration = 1 / Math.max(1, clip.fps ?? 8);

        // 17️⃣ Avança os frames enquanto o tempo acumulado
        // for maior que o tempo necessário para trocar de frame.
        // O while garante que frames não sejam perdidos
        // caso ocorra queda de FPS.
        while (this.elapsed >= frameDuration) {

            // 18️⃣ Remove o tempo correspondente a um frame.
            this.elapsed -= frameDuration;

            // 19️⃣ Avança para o próximo frame.
            this.frame++;

            // 20️⃣ Verifica se chegou ao final da animação.
            if (this.frame >= clip.frames.length) {

                // 21️⃣ Se a animação for loopável,
                // reinicia a partir do primeiro frame.
                if (clip.loop) {
                    this.frame = 0;
                } else {

                    // 22️⃣ Caso contrário, mantém no último frame.
                    // Isso é útil para animações como "hit" ou "death".
                    this.frame = clip.frames.length - 1;
                }

            }
        }

        // 23️⃣ Sincroniza os dados da animação com a entidade.
        // Isso permite que o sistema de render use
        // currentAnimation e animationFrame normalmente.
        this.entity.currentAnimation = this.current;
        this.entity.animationFrame = this.frame;
    }

    isFinished() {
        // 24️⃣ Obtém o clip da animação atual.
        const clip = this.clip;

        // 25️⃣ Se não existir animação, consideramos que terminou.
        if (!clip) return true;

        // 26️⃣ Se a animação estiver em loop,
        // ela nunca termina.
        if (clip.loop) return false;

        // 27️⃣ Verifica se o frame atual já chegou ao último frame.
        // Isso indica que a animação foi completamente executada.
        return this.frame >= clip.frames.length - 1;
    }
}