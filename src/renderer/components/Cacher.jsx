import React, { useEffect, useState, useRef, useCallback } from 'react';

export default ({ children, cacheMap, updateTimeout, onTrigger }) => {
    const [cache, setCache] = useState([]);
    const updateInterval = useRef([]);
    const previousCallback = useRef(() => {});
    const callbacks = useRef([]);

    const enterListener = useCallback((evt, cache, index) => {
        if (evt.key === 'Enter') {
            triggerUpdate(cache, index);
        }
    });

    const setupCache = () => {
        let tempCache = [];
        callbacks.current = [];
        React.Children.forEach(children, (child) => {
            let cacheEntry = {};
            let callbackMap = {};
            Object.keys(cacheMap).forEach((key) => {
                let value = child.props[key];
                let mapKey = child.props[cacheMap[key].keyProp];
                callbackMap[key] = child.props[cacheMap[key].updateFn];

                cacheEntry[key] =  {
                    value,
                    mapKey
                };
            });
            callbacks.current.push(callbackMap);
            tempCache.push(cacheEntry);
        });
        setCache(tempCache);
    };

    const updateCache = (index, key, value) => {
        let cacheCopy = [...cache];
        let cacheEntryCopy = {...cacheCopy[index]};
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
        removeEventListener('keyup', previousCallback.current);
        clearTimeout(updateInterval.current[index]);

        if (
            cache === undefined ||
            index === undefined ||
            cache[index] === undefined
        ) {
            return;
        }

        let cacheEntry = cache[index];
        Object.keys(cacheEntry).forEach((key) => {
            let {value, mapKey} = cacheEntry[key];
            let onUpdate = callbacks.current[index][key];

            if (onUpdate && mapKey) {
                onUpdate(mapKey, value);
            } else if (onUpdate && !mapKey) {
                onUpdate(index, value);
            }

            if (onTrigger) {
                onTrigger();
            }
        });
    };

    useEffect(() => {
        addEventListener('keyup', previousCallback.current);
        return () => {
            removeEventListener('keyup', previousCallback.current);
            cache.forEach((cacheEntry, index) => {
                triggerUpdate(cache, index);
            });
        };
    }, []);

    useEffect(() => {
        setupCache();
    }, [children]);

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
