import React, { useEffect, useRef } from 'react';

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
    onChapterReorder,
    chaptersNeedingAttention,
}) => {
    const selectedHook = useRef(null);

    useEffect(() => {
        console.log('Chapters component - chaptersNeedingAttention updated:', chaptersNeedingAttention);
    }, [chaptersNeedingAttention]);

    useEffect(() => {
        if (selectedHook.current) {
            selectedHook.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedChapter]);

    if (!chapters) {
        return <div className="chapters"></div>;
    }

    return (
        <div className="chapters">
            <h2>Chapters</h2>
            <div className="scrolling">
                <table>
                    <tbody>
                        {Object.entries(chapters).sort(([aName, aData], [bName, bData]) => {
                            const aOrder = aData.order ?? Number.MAX_SAFE_INTEGER;
                            const bOrder = bData.order ?? Number.MAX_SAFE_INTEGER;
                            return aOrder - bOrder;
                        }).map(([chapterName], index) => {
                            const needsAttention = chaptersNeedingAttention?.[chapterName] || false;
                            return (
                                <React.Fragment key={`chapter-${index}`}>
                                    <EditableInput
                                        ref={selectedChapter === chapterName ? selectedHook : null}
                                        currentValue={chapterName}
                                        isChanged={getDiff(`${path}.${chapterName}`, diff)}
                                        isEditable={editable}
                                        isSelected={selectedChapter === chapterName}
                                        needsAttention={needsAttention}
                                        onSelect={() => {
                                            onChapterSelect(chapterName);
                                        }}
                                        onSave={(newChapterName) => {
                                            onChapterNameChange(chapterName, newChapterName);
                                        }}
                                        onDelete={() => {
                                            onChapterRemove(chapterName);
                                        }}
                                        onReorderUp={() => {
                                            onChapterReorder(chapterName, 'up');
                                        }}
                                        onReorderDown={() => {
                                            onChapterReorder(chapterName, 'down');
                                        }}
                                    />
                                </React.Fragment>
                            );
                        })}
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
