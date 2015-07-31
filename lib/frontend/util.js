export function intersectionExists(a, b) {
    for (let item of a.values()) {
        if (b.has(item)) {
            return true;
        }
    }
    return false;
}
