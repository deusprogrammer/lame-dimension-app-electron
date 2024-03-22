import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashCan,
    faPenToSquare,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';

export default React.forwardRef(({
    isSelected,
    isEditable,
    isChanged,
    currentValue,
    onSave,
    onDelete,
    onSelect
}, ref) => {
    const [editedValue, setEditedValue] = useState(currentValue);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <tr
            ref={ref}
            className={
                isChanged
                    ? 'changed'
                    : null
            }>
            <td
                onClick={onSelect}
                className={`selectable ${
                    isSelected
                        ? 'selected'
                        : null
                }`}
            >
                {isEditing ? (
                    <input
                        type="text"
                        onChange={({
                            target: { value },
                        }) => {
                            setEditedValue(value);
                        }}
                        value={editedValue}
                    />
                ) : (
                    currentValue
                )}
            </td>
            {isEditable ? (
                <>
                    {isEditing ? (
                        <td
                            className="check-button"
                            onClick={() => {
                                onSave(editedValue);
                                setIsEditing(false);
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faCheck}
                            />
                        </td>
                    ) : (
                        <td
                            className="edit-button"
                            onClick={() => {
                                if (isEditing) {
                                    return;
                                }

                                setIsEditing(true);
                            }}
                            style={{
                                opacity: isEditing
                                    ? 0.1
                                    : 1.0,
                                cursor: isEditing
                                    ? 'not-allowed'
                                    : 'pointer',
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faPenToSquare}
                            />
                        </td>
                    )}
                    <td
                        className="delete-button"
                        onClick={() => {
                            if (isEditing) {
                                return;
                            }

                            onDelete();
                        }}
                        style={{
                            opacity: isEditing ? 0.1 : 1.0,
                            cursor: isEditing
                                ? 'not-allowed'
                                : 'pointer',
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faTrashCan}
                        />
                    </td>
                </>
            ) : null}
        </tr>
    )
});
