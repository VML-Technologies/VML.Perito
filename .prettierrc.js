/** @type {import("prettier").Config} */
const config = {
    // Configuración para el tamaño de la sangría (espacios)
    tabWidth: 2, // Usa 2 espacios por sangría
    // tabWidth: 4, // Si prefieres 4 espacios

    // Si se usan tabs en lugar de espacios para la sangría
    useTabs: false, // Usar espacios (false) o tabs (true)

    // Longitud máxima de la línea antes de que Prettier la envuelva
    printWidth: 100,

    // Si se usan punto y coma al final de las declaraciones
    semi: true, // true para usar punto y coma, false para no usarlo

    // Si se usan comillas simples en lugar de dobles
    singleQuote: true,

    // Imprime comas colgantes donde sea válido en ES5 (objetos, arrays, etc.)
    trailingComma: 'es5', // 'none', 'es5', 'all'

    // Incluye siempre paréntesis alrededor de un único argumento de función de flecha
    arrowParens: 'always', // 'always' o 'avoid'

    // Espacio entre corchetes de objeto en literales de objeto.
    bracketSpacing: true,

    // Si se deben envolver los atributos HTML/JSX en una nueva línea si no caben en una sola línea.
    bracketSameLine: false, // true para poner el > final en la misma línea que el último atributo

    // Que Prettier decida cuándo envolver JSX
    jsxSingleQuote: false, // false para comillas dobles en JSX, true para simples

    // Deshabilita el auto-formateo de archivos de Markdown.
    proseWrap: 'preserve', // 'always', 'never', 'preserve'

    // Para archivos HTML, Vue, Angular
    htmlWhitespaceSensitivity: 'css', // 'css', 'strict', 'ignore'
};

module.exports = config;