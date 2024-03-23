import React, { useEffect, useRef, useState } from 'react';

import { getDiff } from '../../util/util';
import EditableInput from '../EditableInput';

const component = ({
    categoryData,
    selectedCategory,
    selectedCategoryItem,
    editable,
    diff,
    path,
    onSelect,
    onRemove,
    onCreate,
    onKeyChange,
}) => {
    const selectedHook = useRef(null);
    if (!categoryData) {
        return <div className="chapters"></div>;
    }

    useEffect(() => {
        if (selectedHook.current) {
            selectedHook.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedCategoryItem]);

    return (
        <div className='chapters'>
            <h2>Items</h2>
            <div className="scrolling">
                <table>
                    <tbody>
                        {Object.keys(
                            categoryData[selectedCategory]
                        )
                        .filter((key) => key !== '_id')
                        .map((key) => {
                            return (
                                <React.Fragment key={`_category-item-${key}`}>
                                    <EditableInput
                                        currentValue={key}
                                        isEditable={editable}
                                        isSelected={selectedCategoryItem === key}
                                        onSelect={() => {
                                            onSelect(key);
                                        }}
                                        onSave={(newCategoryItemKey) => {
                                            onKeyChange(key, newCategoryItemKey);
                                        }}
                                        onDelete={() => {

                                        }}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button type="button" onClick={onCreate} disabled={!selectedCategory}>Add Category Item</button>
        </div>
    );
};

export default component;
