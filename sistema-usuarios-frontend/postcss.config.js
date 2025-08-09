// postcss.config.js (o .mjs)
export default {
    plugins: {
        // Usa el plugin específico de Tailwind v4.x
        "@tailwindcss/postcss": {},
        // autoprefixer sigue siendo necesario
        autoprefixer: {},
    },
};