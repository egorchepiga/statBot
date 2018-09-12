import colorPresets from './colors.json'

export default function colors(presetIndex = 0) {
    let presets = colorPresets.presets,
        color = presetIndex != 10 ? presets[presetIndex].color :  presets[getRandomPreset()].color;
    return color.slice().sort(compareRandom);
}
function compareRandom(a, b) {
    return a<b;
}

export function getRandomPreset() {
    return parseInt(Math.random() * 9);    // Math.random() * (max (9) - min (0)) + min (0);
}