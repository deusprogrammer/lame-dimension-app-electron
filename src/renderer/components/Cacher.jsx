import React, { useEffect, useState, useRef, useCallback } from 'react';

export default ({ children, cacheMap, updateTimeout, updateOnKeyPress, onTrigger, triggerEvent }) => {
    const [cache, setCache] = useState([]);

    const updateInterval = useRef([]);

    const enterPressCallback = useRef(() => {});
    const triggerEventCallback = useRef()
    const parentUpdateCallbacks = useRef([]);

    const triggerEventListener = useCallback((evt, cache, index) => {
        cache.forEach((cacheEntry, index) => {
            triggerUpdate(cache, index);
        });
    });

    const enterListener = useCallback((evt, cache, index, triggerKey) => {
        if (evt.key === triggerKey) {
            triggerUpdate(cache, index);
        }
    });

    const setupCache = () => {
        let tempCache = [];
        parentUpdateCallbacks.current = [];
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
            parentUpdateCallbacks.current.push(callbackMap);
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

        removeEventListener('keyup', enterPressCallback.current);
        enterPressCallback.current = (evt) => {
            enterListener(evt, cache, index, updateOnKeyPress);
        };
        addEventListener('keyup', enterPressCallback.current);

        removeEventListener(triggerEvent, triggerEventCallback.current);
        triggerEventCallback.current = (evt) => {
            triggerEventListener(evt, cache, index);
        };
        addEventListener(triggerEvent, triggerEventCallback.current);
    };

    const triggerUpdate = (cache, index) => {
        removeEventListener('keyup', enterPressCallback.current);
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
            let onUpdate = parentUpdateCallbacks.current[index][key];

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
        addEventListener('keyup', enterPressCallback.current);
        return () => {
            removeEventListener('keyup', enterPressCallback.current);
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
