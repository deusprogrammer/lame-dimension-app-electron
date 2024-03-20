import React from 'react';
import { getDiff } from '../../util/util';

const component = ({ onOptionsChange, options, editable, diff, path }) => {
    if (!options || options == {}) {
        onOptionsChange({
            smallerPortraits: false,
            disabledPortraits: false,
            keepBlackBars: false,
        });

        return <></>;
    }

    return (
        <div>
            <h2>Options</h2>
            <div className="options">
                <div>
                    <input
                        type="checkbox"
                        checked={options.smallerPortraits}
                        disabled={!editable}
                        onChange={({ target: { checked } }) => {
                            onOptionsChange({
                                ...options,
                                smallerPortraits: checked,
                            });
                        }}
                    />
                    <label
                        className={
                            getDiff(`${path}.smallerPortraits`, diff)
                                ? 'changed'
                                : null
                        }
                    >
                        Smaller Portraits
                    </label>
                </div>

                <div>
                    <input
                        type="checkbox"
                        checked={options.disablePortraits}
                        disabled={!editable}
                        onChange={({ target: { checked } }) => {
                            onOptionsChange({
                                ...options,
                                disablePortraits: checked,
                            });
                        }}
                    />
                    <label
                        className={
                            getDiff(`${path}.disablePortraits`, diff)
                                ? 'changed'
                                : null
                        }
                    >
                        Disable Portraits
                    </label>
                </div>

                <div>
                    <input
                        type="checkbox"
                        checked={options.keepBlackBars}
                        disabled={!editable}
                        onChange={({ target: { checked } }) => {
                            onOptionsChange({
                                ...options,
                                keepBlackBars: checked,
                            });
                        }}
                    />
                    <label
                        className={
                            getDiff(`${path}.keepBlackBars`, diff)
                                ? 'changed'
                                : null
                        }
                    >
                        Keep Black Bars
                    </label>
                </div>
            </div>
        </div>
    );
};

export default component;
