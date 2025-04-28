import React, { useEffect, useState, useRef } from 'react';

import { getDiff } from '../../util/util';
import EditableInput from '../EditableInput';

const component = ({
    path,
    scenes,
    editable,
    diff,
    selectedScene,
    onSelectScene,
    onCreateScene,
    onSceneRemove,
    onSceneKeyChange,
}) => {
    const selectedHook = useRef(null);

    useEffect(() => {
        if (selectedHook.current) {
            selectedHook.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedScene]);

    console.log("SCENES: " + scenes);

    if (!scenes && scenes !== {}) {
        return (
            <div className="scenes">
                <h2>Scenes</h2>
                <div className="scrolling"></div>
            </div>
        );
    }

    return (
        <div className="scenes">
            <h2>Scenes</h2>
            <div className="scrolling">
                <table>
                    <tbody>
                        {Object.keys(scenes).map((name, index) => {
                            return (
                                <React.Fragment key={`scene-${index}`}>
                                    <EditableInput
                                        ref={selectedScene === name ? selectedHook : null}
                                        currentValue={name}
                                        isChanged={getDiff(`${path}.${name}`, diff)}
                                        isEditable={editable}
                                        isSelected={selectedScene === name}
                                        onSelect={() => {
                                            onSelectScene(name);
                                        }}
                                        onSave={(newSceneName) => {
                                            onSceneKeyChange(name, newSceneName);
                                        }}
                                        onDelete={() => {
                                            onSceneRemove(name);
                                        }}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div>
                <button onClick={onCreateScene} disabled={!editable}>
                    Add Scene
                </button>
            </div>
        </div>
    );
};

export default component;
