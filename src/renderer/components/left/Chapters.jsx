import React, { useEffect, useRef, useState } from 'react';

import { getDiff } from '../../util/util';
import EditableInput from '../EditableInput';

const component = ({
    chapters,
    selectedChapter,
    editable,
    diff,
    path,
    onChapterSelect,
    onChapterRemove,
    onChapterCreate,
    onChapterNameChange,
}) => {
    const selectedHook = useRef(null);
    if (!chapters) {
        return <div className="chapters"></div>;
    }

    useEffect(() => {
        if (selectedHook.current) {
            selectedHook.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedChapter]);

    const updateChapterName = (oldChapterName, newChapterName) => {
        setEditing(null);
        setEditValue(null);
        onChapterNameChange(oldChapterName, newChapterName);
    };

    return (
        <div className="chapters">
            <h2>Chapters</h2>
            <div className="scrolling">
                <table>
                    <tbody>
                        {Object.keys(chapters).map((chapterName) => (
                            <EditableInput 
                                key={chapterName}
                                currentValue={chapterName}
                                isChanged={getDiff(`${path}.${chapterName}`, diff)}
                                isEditable={editable}
                                isSelected={selectedChapter === chapterName}
                                onSelect={() => {
                                    onChapterSelect(chapterName);
                                }}
                                onSave={(newChapterName) => {
                                    updateChapterName(chapterName, newChapterName);
                                }}
                                onDelete={() => {
                                    onChapterRemove(chapterName);
                                }}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <button onClick={onChapterCreate} disabled={!editable}>
                    Add Chapter
                </button>
            </div>
        </div>
    );
};

export default component;
