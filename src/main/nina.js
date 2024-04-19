const pattern = /(\w+)(?:\[([0-9]+)\])*/;

export const getValueAtPath = (obj, path) => {
    let tokens = path.split(".");
    let current = obj;

    for (let token of tokens) {
        let match = pattern.exec(token);
        if (match) {
            let key = match[1];
            let index = match[2];

            if (index && key) {
                if (!current[key] || !current[key][index]) {
                    return null;
                }
                current = current[key][index];
            } else {
                if (!current[key]) {
                    return null;
                }
                current = current[key];
            }
        }
    }

    return current;
}

export const setValueAtPath = (obj, path, value) => {
    let tokens = path.split(".");
    let current = obj;

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        let match = pattern.exec(token);
        if (match) {
            let key = match[1];
            let index = match[2];

            console.log("PATH: " + path);
            console.log(`${key}[${index}]`);
            console.log(`TOKEN COUNT: ${i} of ${tokens.length}`)

            if (key && index) {
                if (i === tokens.length - 1) {
                    if (current.constructor !== Object && current[key].constructor !== Array) {
                        throw "Path value doesn't match structure of object";
                    }

                    current[key][index] = value;
                    return;
                }
                current = current[key][index];
            } else if (key && !index) {
                if (i === tokens.length - 1) {
                    if (current.constructor !== Object) {
                        throw "Path value doesn't match structure of object";
                    }

                    current[key] = value;
                    return;
                }
                current = current[key];
            } else {
                throw "Invalid path syntax";
            }
        }
    };
}

const getAdditions = (obj1, obj2, path = '') => {
    if (!obj1 || !obj2) {
        return null;
    }

    let additions = [];
    let sep = "";

    if (path) {
        sep = ".";
    }

    if (obj1.constructor !== Array && obj1.constructor !== Object) {
        return null;
    }

    for (let key in obj2) {
        let keyStr = !isNaN(key) ? `[${key}]` : sep + key;
        let newPath = path + `${keyStr}`;

        if (!(key in obj1)) {
            additions.push({
                op: "ADDED",
                path: newPath,
                oldValue: null,
                newValue: obj2[key]
            });
        }

        let addition = getAdditions(obj1[key], obj2[key], newPath);
        if (addition) {
            additions = [...additions, ...addition];
        }
    }

    return additions;
}

// Path: foo[0].key1, bar.key1.subKey1[0], bar.key2
const getChangesAndRemovals = (obj1, obj2, path = '') => {
    if (!obj1 || !obj2) {
        return null;
    }

    let diffs = [];
    if (obj1.constructor !== Array && obj1.constructor !== Object) {
        if (obj1 !== obj2) {
            return [
                {
                    op: "CHANGED",
                    path,
                    oldValue: obj1,
                    newValue: obj2
                }
            ];
        } else {
            return null;
        }
    }

    let sep = "";
    if (path) {
        sep = ".";
    }

    for (let key in obj1) {
        let keyStr = !isNaN(key) ? `[${key}]` : sep + key;
        let newPath = path + `${keyStr}`;

        if (!(key in obj2)) {
            diffs.push({
                op: "REMOVED",
                path: newPath,
                oldValue: obj1[key],
                newValue: null
            });
            break;
        }

        let diff = getChangesAndRemovals(obj1[key], obj2[key], newPath);
        if (diff) {
            diffs = [...diffs, ...diff];
        }
    }

    return diffs;
}

export const getDiff = (obj1, obj2) => {
    let changesAndRemovals = getChangesAndRemovals(obj1, obj2);
    let additions = getAdditions(obj1, obj2);

    return [...changesAndRemovals, ...additions];
}

export const mergeFiles = (obj1, obj2) => {
    let diff = getDiff({...obj1}, obj2);

    diff.forEach(({op, path, newValue}) => {
        setValueAtPath(obj1, path, newValue);
    })

    return obj1;
}

export const mergeDiff = (obj1, diff) => {
    diff.forEach(({op, path, newValue}) => {
        setValueAtPath(obj1, path, newValue);
    })

    return obj1;
}
