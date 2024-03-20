import React, { useEffect, useState } from 'react';

const component = ({ sceneKey, editable, onSceneKeyChange }) => {
    const [newSceneKey, setNewSceneKey] = useState(sceneKey);

    useEffect(() => {
        setNewSceneKey(sceneKey);
    }, [sceneKey]);

    console.log('SCENE: ' + sceneKey);

    return (
        <div className="dialogue-meta">
            <input
                type="text"
                value={newSceneKey}
                disabled={!editable}
                onChange={({ target: { value } }) => {
                    setNewSceneKey(value);
                }}
                onBlur={() => {
                    onSceneKeyChange(newSceneKey, sceneKey);
                }}
            />
        </div>
    );
};

export default component;
