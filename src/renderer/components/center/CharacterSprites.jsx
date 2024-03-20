import React from 'react';

import CharacterSprite from '../CharacterSprite';

const Component = ({ scene, index }) => {
    if (!scene?.dialogue?.[index]) {
        return <></>;
    }

    let { active } = scene.dialogue[index];

    return (
        <div
            style={{
                backgroundColor: 'teal',
                margin: 'auto',
                position: 'relative',
                width: '640px',
                height: `${290}px`,
            }}
        >
            <CharacterSprite
                position="left"
                dialogue={scene.dialogue[index]}
                active={active}
            />
            <CharacterSprite
                position="right"
                dialogue={scene.dialogue[index]}
                active={active}
            />
            <CharacterSprite
                position="leftFront"
                dialogue={scene.dialogue[index]}
                active={active}
            />
            <CharacterSprite
                position="rightFront"
                dialogue={scene.dialogue[index]}
                active={active}
            />
        </div>
    );
};

export default Component;
