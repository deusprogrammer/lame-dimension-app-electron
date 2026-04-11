import React, { useEffect, useRef } from 'react';

import { getDiff } from '../../util/util';
import EditableInput from '../EditableInput';

const component = ({
    path,
    scenes,
    editable,
    diff,
    selectedScene,
    searchMode,
    onSelectScene,
    onCreateScene,
    onSceneRemove,
    onSceneKeyChange,
    onSceneReorder,
    scenesNeedingAttention,
}) => {
    const selectedHook = useRef(null);

    useEffect(() => {
        console.log('Scenes component - scenesNeedingAttention updated:', scenesNeedingAttention);
    }, [scenesNeedingAttention]);

    useEffect(() => {
        if (selectedHook.current) {
            selectedHook.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedScene]);

    if (!scenes && scenes !== {}) {
        return (
            <div className="scenes">
                {!searchMode && <h2>Scenes</h2>}
                <div className={searchMode ? undefined : 'scrolling'}></div>
            </div>
        );
    }

    return (
        <div className="scenes">
            {!searchMode && <h2>Scenes</h2>}
            <div className={searchMode ? undefined : 'scrolling'}>
                <table>
                    <tbody>
                        {Object.entries(scenes).sort(([aName, aData], [bName, bData]) => {
                            const aOrder = aData.order ?? Number.MAX_SAFE_INTEGER;
                            const bOrder = bData.order ?? Number.MAX_SAFE_INTEGER;
                            return aOrder - bOrder;
                        }).map(([name, data], index) => {
                            const needsAttention = scenesNeedingAttention?.[name] || false;
                            return (
                                <React.Fragment key={`scene-${index}`}>
                                    <EditableInput
                                        ref={selectedScene === name ? selectedHook : null}
                                        currentValue={name}
                                        isChanged={getDiff(`${path}.${name}`, diff)}
                                        isEditable={editable}
                                        isSelected={selectedScene === name}
                                        needsAttention={needsAttention}
                                        onSelect={() => {
                                            onSelectScene(name);
                                        }}
                                        onSave={(newSceneName) => {
                                            onSceneKeyChange(name, newSceneName);
                                        }}
                                        onDelete={() => {
                                            onSceneRemove(name);
                                        }}
                                        onReorderUp={() => {
                                            onSceneReorder(name, 'up');
                                        }}
                                        onReorderDown={() => {
                                            onSceneReorder(name, 'down');
                                        }}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {!searchMode ? (
                <div>
                    <button onClick={onCreateScene} disabled={!editable}>
                        Add Scene
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export default component;
