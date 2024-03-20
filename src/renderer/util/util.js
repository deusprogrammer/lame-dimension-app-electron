import deepDiff from 'deep-diff-pizza';

export const getDiff = (elementPath, diff) => {
    if (!diff) {
        return false;
    }

    let found = diff.filter(({ path }) => path.startsWith(elementPath));

    if (!found) {
        return false;
    }

    return found.length > 0;
};

export const byString = (o, s) => {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, ''); // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
};

export const mergePulled = (mine, theirs, snapshot) => {
    let diff = deepDiff(snapshot, mine).filter(
        ({ path, operation }) =>
            !path.startsWith('characters') &&
            !['editor', 'type', '_id'].includes(path) &&
            !path.includes('_id') &&
            operation !== 'UNCHANGED'
    );

    diff.forEach(({ operation, path }) => {
        if (operation === 'UPDATED' && theirs[path] && mine[path]) {
            console.log('FARTS: ' + path);
            eval(`theirs.${path} = mine.${path}`);
        }
    });

    return theirs;
};
