import { languages } from "../../../data/languages";

export default ({
    language,
    defaultLanguage,
    category,
    categoryItemData: entry,
    onUpdate
}) => {
    const { template } = category;

    const updateField = (fieldName, fieldValue, index) => {
        let copy = {...entry};
        let field = category.template.find(({key}) => key === fieldName);
        if (index === undefined) {
            if (field.localized) {
                copy[fieldName][language] = fieldValue;
            } else {
                copy[fieldName] = fieldValue;
            }
        } else {
            if (field.localized) {
                copy[fieldName][language][index] = fieldValue;
            } else {
                copy[fieldName][index] = fieldValue;
            }
        }
        onUpdate(copy);
    };

    const addElementToField = (fieldName) => {
        let copy = {...entry};
        let valueToPush;
        let field = category.template.find(({key}) => key === fieldName);
        switch(field?.dataType) {
            case 'text':
                valueToPush = '';
                break;
            case 'number':
                valueToPush = 0;
                break;
            case 'checkbox':
                valueToPush = false;
                break;
        }
        if (field?.localized) {
            languages.forEach((lang) => {
                copy[fieldName][lang].push(valueToPush);
            })
        } else {
            copy[fieldName].push(valueToPush);
        }
        onUpdate(copy);
    }

    if (!entry) {
        return null;
    }

    return (
        <>
            <table className="data-table">
                {template.map(
                    ({ label, key, dataType, collectionType, localized }) => {
                        if (collectionType === 'array') {
                            let collection = localized
                                ? (entry?.[key]?.[language] ?? [])
                                : entry?.[key] ?? [];

                            if (collection.length === 0) {
                                return (
                                    <tbody className="grouped" key={`category-group-${key}`}>
                                        <tr>
                                            <td>{label}</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3}>
                                                <button type="button" onClick={() => {addElementToField(key)}}>
                                                    Add Element
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                )
                            }

                            return (
                                <tbody className="grouped" key={`table-group-${key}`}>
                                    {collection.map((collectionEntry, index) => {
                                        let translation = entry?.[key]?.[defaultLanguage]?.[index] ?? '';
                                        return (
                                            <tr key={`category-group-${key}-item${index}`}>
                                                <td>{`${label} ${
                                                    index + 1
                                                }`}</td>
                                                <td>
                                                    <input
                                                        onChange={({
                                                            target: { value },
                                                        }) => {
                                                            updateField(
                                                                key,
                                                                value,
                                                                index
                                                            );
                                                        }}
                                                        type={dataType}
                                                        value={collectionEntry}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type={dataType}
                                                        value={localized ? translation : null}
                                                        disabled
                                                        readOnly={true}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr>
                                        <td colSpan={3}>
                                            <button type="button" onClick={() => {addElementToField(key)}}>
                                                Add Element
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            );
                        }

                        return (
                            <tbody key={`category-${key}`}>
                                <tr>
                                    <td>{label}</td>
                                    <td>
                                        <input
                                            onChange={({
                                                target: { value },
                                            }) => {
                                                updateField(key, value);
                                            }}
                                            type={dataType}
                                            value={
                                                localized
                                                    ? entry[key][language]
                                                    : entry[key]
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type={dataType}
                                            value={
                                                localized
                                                    ? entry[key][defaultLanguage]
                                                    : null
                                            }
                                            disabled
                                            readOnly
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        );
                    }
                )}
            </table>
        </>
    );
};
