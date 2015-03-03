import WglCache from "src/webgl/WglCache.js"
import WglArg from "src/webgl/WglArg.js"

/**
 * Stores pixel data for/from/on the gpu... or something along those lines. You can render to and pull data out of it.
 */
export default class WglTexture {
    /**
     * @param {!int} width
     * @param {!int} height
     */
    constructor(width, height) {
        /** @type {!int} */
        this.width = width;
        /** @type {!int} */
        this.height = height;
        /** @type {!ContextStash} */
        this.contextStash = new Map();
    };

    /**
     * Returns, after initializing if necessary, the resources representing this texture bound to the given context.
     * @param {!WglCache} cache
     * @returns {!{texture:*, framebuffer:*, renderbuffer:*}}
     */
    instanceFor(cache) {
        return cache.retrieveOrCreateAssociatedData(this.contextStash, () => {
            var g = cache.webGLRenderingContext;

            var result = {
                texture: g.createTexture(),
                framebuffer: g.createFramebuffer(),
                renderbuffer: g.createRenderbuffer()
            };

            var s = WebGLRenderingContext;
            g.bindTexture(s.TEXTURE_2D, result.texture);
            g.bindFramebuffer(s.FRAMEBUFFER, result.framebuffer);
            g.bindRenderbuffer(s.RENDERBUFFER, result.renderbuffer);

            g.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, s.NEAREST);
            g.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.NEAREST);
            g.texImage2D(s.TEXTURE_2D, 0, s.RGBA, this.width, this.height, 0, s.RGBA, s.FLOAT, null);
            g.framebufferTexture2D(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, result.texture, 0);
            g.renderbufferStorage(s.RENDERBUFFER, s.RGBA4, this.width, this.height);

            g.bindTexture(s.TEXTURE_2D, null);
            g.bindFramebuffer(s.FRAMEBUFFER, null);
            g.bindRenderbuffer(s.RENDERBUFFER, null);

            return result;
        });
    }

    /**
     * Binds, after initializing if necessary, the frame buffer representing this texture to the webgl context related
     * to the given cache.
     * @param {!WglCache} cache
     */
    bindFramebufferFor(cache) {
        cache.webGLRenderingContext.bindFramebuffer(
            WebGLRenderingContext.FRAMEBUFFER,
            this.instanceFor(cache).framebuffer);
    };
}
