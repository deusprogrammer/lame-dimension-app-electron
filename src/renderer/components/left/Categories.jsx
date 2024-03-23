import React, { useEffect, useRef, useState } from 'react';

import { getDiff } from '../../util/util';
import EditableInput from '../EditableInput';

const component = ({
    categories,
    selectedCategory,
    editable,
    diff,
    path,
    onSelect,
    onRemove,
    onCreate,
    onKeyChange,
}) => {
    const selectedHook = useRef(null);
    if (!categories) {
        return <div className="chapters"></div>;
    }

    useEffect(() => {
        if (selectedHook.current) {
            selectedHook.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedCategory]);

    return (
        <div className="chapters">
            <h2>Categories</h2>
            <div className="scrolling">
                <table>
                    <tbody>
                        {Object.keys(categories).map((category, index) => (
                            <React.Fragment key={`category-${index}`}>
                                <EditableInput
                                    ref={selectedCategory === category ? selectedHook : null}
                                    currentValue={category}
                                    isEditable={editable}
                                    isSelected={selectedCategory === category}
                                    onSelect={() => {
                                        onSelect(category);
                                    }}
                                    onSave={(newCategoryName) => {
                                        onKeyChange(category, newCategoryName);
                                    }}
                                    onDelete={() => {
                                        onRemove(category);
                                    }}
                                />
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <button onClick={onCreate} disabled={!editable}>
                    Add Category
                </button>
            </div>
        </div>
    );
};

export default component;
