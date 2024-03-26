import React, { useEffect, useState, useRef, useCallback } from 'react';

export default ({ children, cacheMap, updateTimeout }) => {
    const [cache, setCache] = useState([]);
    const updateInterval = useRef([]);
    const previousCallback = useRef(() => {});

    const enterListener = useCallback((evt, cache, index) => {
        if (evt.key === 'Enter') {
            triggerUpdate(cache, index);
        }
    });

    const setupCache = () => {
        let tempCache = [];
        React.Children.forEach(children, (child) => {
            let cacheEntry = {};
            Object.keys(cacheMap).forEach((key) => {
                let value = child.props[key];
                let onUpdate = child.props[cacheMap.updateFn];
                cacheEntry[key] =  {
                    value,
                    onUpdate
                };
            });
            tempCache.push(cacheEntry);
        });
        setCache(tempCache);
    };

    const updateCache = (index, key, value) => {
        let cacheCopy = [...cache];
        let cacheEntryCopy = [...cacheCopy[index]];
        cacheEntryCopy[key].value = value;
        cacheCopy[index] = cacheEntryCopy;
        setCache(cacheCopy);

        clearTimeout(updateInterval.current[index]);
        updateInterval.current[index] = setTimeout(() => {
            triggerUpdate(cacheCopy, index);
        }, updateTimeout);

        removeEventListener('keyup', previousCallback.current);
        previousCallback.current = (evt) => {
            enterListener(evt, cache, index);
        };
        addEventListener('keyup', previousCallback.current);
    };

    const triggerUpdate = (cache, index) => {
        if (
            cache === undefined ||
            index === undefined ||
            cache[index] === undefined
        ) {
            return;
        }

        removeEventListener('keyup', previousCallback.current);
        clearTimeout('keyup', updateInterval.current[index]);

        let cacheEntry = cache[index];
        Object.keys(cacheEntry).forEach((key) => {
            let {value, onUpdate} = cacheEntry[key].value;

            if (onUpdate) {
                onUpdate(index, value);
            }
        });
    };

    useEffect(() => {
        addEventListener('keyup', previousCallback.current);
        return () => {
            removeEventListener('keyup', previousCallback.current);
        };
    }, []);

    useEffect(() => {
        console.log('CACHE: ' + JSON.stringify(cache, null, 5));
    }, [cache]);

    useEffect(() => {
        setupCache();
        return () => {
            cache.forEach((cacheEntry, index) => {
                triggerUpdate(cache, index);
            });
        };
    }, [children, cacheMap]);

    if (cache.length === 0) {
        return <></>;
    }

    return React.Children.map(children, (child, index) => {
        let childProps = { ...child.props };
        Object.keys(cache[index]).forEach((key) => {
            childProps[key] = cache[index][key].value;
            childProps[cacheMap[key].updateFn] = (value) => {
                updateCache(index, key, value);
            };
        });
        return React.cloneElement(child, childProps);
    });
};
