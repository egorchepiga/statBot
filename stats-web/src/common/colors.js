import colorPresets from './colors.json'

let colorNames = {
    "Orange" : 0,
    "Yellow-Gray" : 1,
    "Green": 2,
    "Aqua": 3,
    "Purple-Gray": 4,
    "Pink": 5,
    "Random": 6};

export default function colors(colorName = "Random") {
    let presetIndex = colorNames[colorName];
    presetIndex = presetIndex !== 6 ? presetIndex : parseInt(Math.random() * 5);
    let presets = colorPresets.presets,
        color = presets[presetIndex].color ;
    let theme;
    for(let color in colorNames)
        if(colorNames[color] === presetIndex) theme = color;
    let colors = shuffle(color.slice());
    return { colors: colors, theme : theme };
}
function compareRandom(a, b) {
    return Math.random() * 10 > Math.random() * 10;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

export function staticColors(colorName = "Random") {
    let presetIndex = colorNames[colorName];
    presetIndex = presetIndex !== 6 ? presetIndex : parseInt(Math.random() * 5);
    let presets = colorPresets.presets,
        color = presets[presetIndex].color ;
    let theme;
    for(let color in colorNames)
        if(colorNames[color] === presetIndex) theme = color;
    return { colors: color.slice(), theme : theme };
}
