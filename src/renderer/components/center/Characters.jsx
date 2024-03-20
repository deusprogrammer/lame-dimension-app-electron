import React from 'react';
import { getDiff } from '../../util/util';

const component = ({
    characters,
    side,
    scene,
    index,
    editable,
    diff,
    path,
    onPositionChange,
}) => {
    if (!characters || !scene?.dialogue?.[index]) {
        return <div className="characters"></div>;
    }

    let { positions, active } = scene.dialogue[index];

    const updatePositionName = (position, characterKey) => {
        let dialogueCopy = { ...scene.dialogue[index] };
        let copy = { ...dialogueCopy.positions };
        if (!copy[position]) {
            copy[position] = {};
        }

        copy[position] = null;
        if (characterKey !== 'none') {
            copy[position] = {
                name: characterKey,
                emote: 'neutral',
            };
        }
        dialogueCopy.positions = copy;
        onPositionChange(index, dialogueCopy);
    };

    const updatePositionEmote = (position, emote) => {
        let dialogueCopy = { ...scene.dialogue[index] };
        let copy = { ...dialogueCopy.positions };
        if (!copy[position]) {
            copy[position] = {};
        }
        copy[position].emote = emote;
        dialogueCopy.positions = copy;
        onPositionChange(index, dialogueCopy);
    };

    const updatePositionOverride = (position, override) => {
        let dialogueCopy = { ...scene.dialogue[index] };
        let copy = { ...dialogueCopy.positions };
        if (!copy[position]) {
            copy[position] = {};
        }
        copy[position].override = override;
        dialogueCopy.positions = copy;
        onPositionChange(index, dialogueCopy);
    };

    const updateActivePosition = (position) => {
        let dialogueCopy = { ...scene.dialogue[index] };
        dialogueCopy.active = position;
        onPositionChange(index, dialogueCopy);
    };

    return (
        <div>
            <div className="characters">
                {['left', 'leftFront', 'right', 'rightFront']
                    .filter((position) => position.toLowerCase().includes(side))
                    .map((position) => {
                        return (
                            <div key={`pos-${position}`}>
                                <div>{position.toUpperCase()}</div>
                                <div>
                                    <select
                                        className={
                                            getDiff(
                                                `${path}.${position}.name`,
                                                diff
                                            )
                                                ? 'changed'
                                                : null
                                        }
                                        onChange={({ target: { value } }) =>
                                            updatePositionName(position, value)
                                        }
                                        value={
                                            positions[position]?.name || 'none'
                                        }
                                        disabled={!editable}
                                    >
                                        <option value="none">none</option>
                                        {Object.keys(characters).map((key) => {
                                            return (
                                                <option value={key} key={key}>
                                                    {characters[key].name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>Override</div>
                                <div>
                                    <input
                                        type="text"
                                        className={
                                            getDiff(
                                                `${path}.${position}.override`,
                                                diff
                                            )
                                                ? 'changed'
                                                : null
                                        }
                                        onChange={({ target: { value } }) => {
                                            updatePositionOverride(
                                                position,
                                                value
                                            );
                                        }}
                                        value={
                                            positions[position]?.override ||
                                            'none'
                                        }
                                        disabled={!editable}
                                    />
                                </div>
                                <div>Emote</div>
                                <div>
                                    <select
                                        className={
                                            getDiff(
                                                `${path}.${position}.emote`,
                                                diff
                                            )
                                                ? 'changed'
                                                : null
                                        }
                                        onChange={({ target: { value } }) => {
                                            updatePositionEmote(
                                                position,
                                                value
                                            );
                                        }}
                                        value={positions[position]?.emote}
                                        disabled={!editable}
                                    >
                                        {characters[
                                            positions[position]?.name
                                        ]?.emotes.map((emote) => {
                                            return (
                                                <option
                                                    key={`${position}-${emote}`}
                                                    value={emote}
                                                >
                                                    {emote}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="checkbox"
                                        className={getDiff(
                                            `${path}.${position}.active`,
                                            diff
                                        )}
                                        checked={active === position}
                                        onChange={({ target: { checked } }) => {
                                            if (
                                                checked &&
                                                positions[position]?.name
                                            )
                                                updateActivePosition(position);
                                        }}
                                        disabled={
                                            !positions[position]?.name ||
                                            !editable
                                        }
                                    />
                                    Speaking
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default component;
