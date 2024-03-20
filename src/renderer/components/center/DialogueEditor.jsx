import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUp,
    faArrowDown,
    faTrashCan,
    faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { getDiff } from '../../util/util';

const Component = ({
    scene,
    language,
    defaultLanguage,
    index,
    editable,
    diff,
    path,
    onDialogueIndexChange,
    onDialogueChange,
    onDialogueAdd,
    onDialogueRemove,
    onDialogueRearrange,
}) => {
    if (!scene?.dialogue) {
        return <></>;
    }

    const updateDialogueText = (index, language, value) => {
        let entry = { ...scene.dialogue[index] };
        entry.text[language] = value;
        onDialogueChange(index, entry);
    };

    const updateDialogueChoices = (index, language, value) => {
        let entry = { ...scene.dialogue[index] };
        entry.choices[language] = value;
        onDialogueChange(index, entry);
    };

    const updateDialogue = (field, index, value) => {
        let entry = { ...scene.dialogue[index] };
        entry[field] = value;
        onDialogueChange(index, entry);
    };

    const swapDialogues = (index, otherIndex) => {
        let copy = [...scene.dialogue];
        let temp = { ...copy[index] };
        copy[index] = copy[otherIndex];
        copy[otherIndex] = temp;
        onDialogueRearrange(copy);
    };

    const dialogCount = scene.dialogue.length;

    console.log('PATH: ' + path);

    return (
        <>
            <h2>Dialogue</h2>
            <div className="dialogue-text">
                <table className="dialogue-table">
                    <tbody>
                        {scene.dialogue.map((entry, dialogueIndex) => {
                            let choices = entry.choices[language];
                            let defaultChoices = entry.choices[defaultLanguage];
                            let notes = entry.notes;

                            if (choices) {
                                choices = choices.join('\n');
                            }

                            if (defaultChoices) {
                                defaultChoices = defaultChoices.join('\n');
                            }

                            return (
                                <tr
                                    key={`dialogue${dialogueIndex}`}
                                    className={`${
                                        index === dialogueIndex
                                            ? 'selected'
                                            : null
                                    }`}
                                    onClick={() => {
                                        onDialogueIndexChange(dialogueIndex);
                                    }}
                                >
                                    <td>
                                        {dialogueIndex > 0 ? (
                                            <>
                                                <button
                                                    tabIndex={
                                                        dialogueIndex +
                                                        dialogCount
                                                    }
                                                    onClick={(e) => {
                                                        swapDialogues(
                                                            dialogueIndex,
                                                            dialogueIndex - 1
                                                        );
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                    disabled={!editable}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faArrowUp}
                                                    />
                                                </button>
                                                <br />
                                            </>
                                        ) : null}
                                        {dialogueIndex <
                                        scene.dialogue.length - 1 ? (
                                            <button
                                                tabIndex={
                                                    dialogueIndex +
                                                    1 +
                                                    dialogCount
                                                }
                                                onClick={(e) => {
                                                    swapDialogues(
                                                        dialogueIndex,
                                                        dialogueIndex + 1
                                                    );
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                }}
                                                disabled={!editable}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faArrowDown}
                                                />
                                            </button>
                                        ) : null}
                                    </td>
                                    <td>
                                        <div className="dialogue-text-col">
                                            <textarea
                                                placeholder="Dialogue"
                                                tabIndex={
                                                    dialogueIndex +
                                                    1 +
                                                    dialogCount * 2
                                                }
                                                className={
                                                    getDiff(
                                                        `${path}[${dialogueIndex}].text.${language}`,
                                                        diff
                                                    )
                                                        ? 'editor-text changed'
                                                        : 'editor-text'
                                                }
                                                onChange={({
                                                    target: { value },
                                                }) => {
                                                    updateDialogueText(
                                                        dialogueIndex,
                                                        language,
                                                        value
                                                    );
                                                }}
                                                value={entry.text[language]}
                                                disabled={!editable}
                                            ></textarea>
                                            <pre
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '0px',
                                                    margin: '0px',
                                                    color: 'white',
                                                }}
                                            >
                                                <b>
                                                    {defaultLanguage.toUpperCase()}
                                                </b>
                                                : {entry.text[defaultLanguage]}
                                            </pre>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="dialogue-choice-col">
                                            <textarea
                                                placeholder="Choices"
                                                tabIndex={
                                                    dialogueIndex +
                                                    1 +
                                                    dialogCount * 3
                                                }
                                                className={
                                                    getDiff(
                                                        `${path}[${dialogueIndex}].choices.${language}`,
                                                        diff
                                                    )
                                                        ? 'editor-choice changed'
                                                        : 'editor-choice'
                                                }
                                                onFocus={() => {
                                                    onDialogueIndexChange(
                                                        dialogueIndex
                                                    );
                                                }}
                                                onChange={({
                                                    target: { value },
                                                }) => {
                                                    updateDialogueChoices(
                                                        dialogueIndex,
                                                        language,
                                                        value.split('\n')
                                                    );
                                                }}
                                                value={choices}
                                                disabled={!editable}
                                            ></textarea>
                                            <pre
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '0px',
                                                    margin: '0px',
                                                    color: 'white',
                                                }}
                                            >
                                                {defaultChoices}
                                            </pre>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="dialogue-notes-col">
                                            <textarea
                                                placeholder="Notes"
                                                tabIndex={
                                                    dialogueIndex +
                                                    1 +
                                                    dialogCount * 4
                                                }
                                                className={
                                                    getDiff(
                                                        `${path}[${dialogueIndex}].notes`,
                                                        diff
                                                    )
                                                        ? 'editor-notes changed'
                                                        : 'editor-notes'
                                                }
                                                onFocus={() => {
                                                    onDialogueIndexChange(
                                                        dialogueIndex
                                                    );
                                                }}
                                                onChange={({
                                                    target: { value },
                                                }) => {
                                                    updateDialogue(
                                                        'notes',
                                                        dialogueIndex,
                                                        value
                                                    );
                                                }}
                                                value={notes}
                                                disabled={!editable}
                                            ></textarea>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            tabIndex={
                                                dialogueIndex +
                                                1 +
                                                dialogCount * 5
                                            }
                                            onClick={(e) => {
                                                onDialogueAdd(dialogueIndex);
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            disabled={!editable}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                        <button
                                            tabIndex={
                                                dialogueIndex +
                                                1 +
                                                dialogCount * 5
                                            }
                                            onClick={(e) => {
                                                onDialogueRemove(dialogueIndex);
                                                onDialogueIndexChange(
                                                    Math.max(
                                                        0,
                                                        dialogueIndex - 1
                                                    )
                                                );
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            disabled={!editable}
                                        >
                                            <FontAwesomeIcon
                                                icon={faTrashCan}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Component;
