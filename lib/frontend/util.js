function intersectionToArray(a, b) {
    return [...a].filter(item => b.has(item));
}

export function intersection(a, b) {
    return new Set(intersectionToArray(a, b));
}

export function intersectionExists(a, b) {
    return intersectionToArray(a, b).length !== 0;
}
