import Animation from './Animation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAtom } from 'jotai';
import characterCacheAtom from '../atoms/Characters.atom';

const positionAdjustments = {
    left: {
        x: 0,
        y: 0,
        from: 'left',
    },
    leftFront: {
        x: 150,
        y: 0,
        from: 'left',
    },
    rightFront: {
        x: 150,
        y: 0,
        from: 'right',
    },
    right: {
        x: 0,
        y: 0,
        from: 'right',
    },
};

const getBase64 = async (url) => {
    let response = await axios.get(url, {
        responseType: 'arraybuffer',
    });
    return btoa(String.fromCharCode(...new Uint8Array(response.data)));
};

const Component = ({ position, dialogue, active }) => {
    const [fileList, setFileList] = useState([]);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [characterCache, setCharacterCache] = useAtom(characterCacheAtom);

    const loadTextures = async (character, emote) => {
        let cached = characterCache[`${character}:${emote}`];

        // If cached, don't pull again
        if (cached) {
            setHeight(cached.height);
            setWidth(cached.width);
            setFileList(cached.files);
            return;
        }

        try {
            let data = await window.electron.ipcRenderer.sendMessage('getSpriteData', character, emote);

            let height = data.height;
            let width = data.width;
            let files = await Promise.all(
                data.frames.map(async ({ name }) => {
                    return `sprites://${character}/${emote}/${name}`;
                })
            );

            let characterCacheCopy = { ...characterCache };
            characterCacheCopy[`${character}:${emote}`] = {
                height,
                width,
                files,
            };
            setCharacterCache(characterCacheCopy);
            setHeight(height);
            setWidth(width);

            setFileList(files);
        } catch (e) {
            console.error(e);
            setFileList([`seele.jpeg`]);
            setWidth(516 / 4);
            setHeight(1162 / 4);
        }
    };

    useEffect(() => {
        if (position && dialogue) {
            if (!dialogue.positions[position]) {
                return;
            }

            let character = dialogue.positions[position].name;
            let emote = dialogue.positions[position].emote;
            loadTextures(character, emote);
        }
        setIsSpeaking(active === position);
    }, [position, dialogue, active]);

    let x = 0;
    let y = 360 - 70 - (height || 0);
    let flip = false;

    let adjustments = positionAdjustments[position];
    if (adjustments.from === 'right') {
        x = 640 - width - adjustments.x;
        flip = true;
    } else if (adjustments.from === 'left') {
        x = adjustments.x;
    }

    // If position is null
    if (
        !dialogue.positions[position] ||
        !dialogue.positions[position].name ||
        dialogue.positions[position].name === 'none'
    ) {
        return <></>;
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: y,
                left: x,
                width,
                height,
            }}
        >
            <Animation
                flip={flip}
                isPlaying={isSpeaking}
                speed={100}
                label={position}
                images={fileList}
                width={width}
                height={height}
            />
        </div>
    );
};

export default Component;
