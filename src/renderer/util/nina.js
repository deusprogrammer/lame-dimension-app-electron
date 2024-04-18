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

    for (let token of tokens) {
        let match = pattern.exec(token);
        if (match) {
            let key = match[1];
            let index = match[2];

            if (key && index) {
                if ((typeof current[key][index]) !== "object") {
                    current[key][index] = value;
                    return;
                }
                current = current[key][index];
            } else {
                if ((typeof current[key]) !== "object") {
                    current[key] = value;
                    return;
                }
                current = current[key];
            }
        }
    };
}

// Path: foo[0].key1, bar.key1.subKey1[0], bar.key2
export const getDiff = (obj1, obj2, path = '') => {
    if (!obj1 || !obj2) {
        return null;
    }

    let diffs = [];
    if (obj1.constructor !== Array && obj1.constructor !== Object) {
        if (obj1 !== obj2) {
            return [
                {
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

        let diff = getDiff(obj1[key], obj2[key], newPath);
        if (diff) {
            diffs = [...diffs, ...diff];
        }
    }

    return diffs;
}

export const merge = (obj1, obj2) => {
    let diff = getDiff({...obj1}, obj2);

    diff.forEach(({path, oldValue, newValue}) => {
        if (getValueAtPath(obj1, path) && getValueAtPath(obj2, path)) {
            setValueAtPath(obj1, path, newValue);
        }
    })

    return obj1;
}
