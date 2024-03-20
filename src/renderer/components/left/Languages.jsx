import React from 'react';
import {languages} from '../../data/languages';

const component = ({
    onSelectLanguage,
    onSelectDefaultLanguage,
    selectedLanguage,
    defaultLanguage,
}) => {
    return (
        <div className="languages">
            <h2>Languages</h2>
            <div className="language-grid">
                {languages.map((language) => {
                    return (
                        <div
                            key={language}
                            onClick={() => {
                                onSelectLanguage(language);
                            }}
                            className={`selectable ${
                                selectedLanguage === language
                                    ? 'selected'
                                    : null
                            }`}
                        >
                            {language.toUpperCase()}
                        </div>
                    );
                })}
            </div>
            <label>Default Language</label>
            <select
                value={defaultLanguage}
                onChange={({ target: { value } }) =>
                    onSelectDefaultLanguage(value)
                }
            >
                {languages.map((language) => {
                    return (
                        <option key={`def-${language}`} value={language}>
                            {language.toUpperCase()}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default component;
