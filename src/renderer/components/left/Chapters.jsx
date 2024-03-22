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

    return (
        <div className="chapters">
            <h2>Chapters</h2>
            <div className="scrolling">
                <table>
                    <tbody>
                        {Object.keys(chapters).map((chapterName, index) => (
                            <React.Fragment key={`chapter-${index}`}>
                                <EditableInput
                                    ref={selectedChapter === chapterName ? selectedHook : null}
                                    currentValue={chapterName}
                                    isChanged={getDiff(`${path}.${chapterName}`, diff)}
                                    isEditable={editable}
                                    isSelected={selectedChapter === chapterName}
                                    onSelect={() => {
                                        onChapterSelect(chapterName);
                                    }}
                                    onSave={(newChapterName) => {
                                        onChapterNameChange(chapterName, newChapterName);
                                    }}
                                    onDelete={() => {
                                        onChapterRemove(chapterName);
                                    }}
                                />
                            </React.Fragment>
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
