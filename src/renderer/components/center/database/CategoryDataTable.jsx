export default ({
    language,
    defaultLanguage,
    category,
    onUpdate
}) => {
    const addField = () => {
        let copy = {...category};
        let template = [...category.template];
        template.push({
            key: `_field${template.length}`,
            label: `_field${template.length}`,
            collectionType: 'none',
            dataType: 'text',
            localized: false
        });
        copy.template = template;
        
        if (onUpdate) {
            onUpdate(copy);
        }
    }

    const updateField = (index, fieldName, fieldValue) => {
        let copy = {...category};
        let templateCopy = [ ...category.template ];
        templateCopy[index][fieldName] = fieldValue;
        
        copy.template = templateCopy;
        
        if (onUpdate) {
            onUpdate(copy);
        }
    };

    return (
        <>
            <table className='data-table'>
                <tbody>
                    <tr>
                        <td>Title</td>
                        <td><input style={{fontSize: '1.5rem', marginBottom: '10px'}} type="text" value={category.title[language]} /></td>
                        <td><input style={{fontSize: '1.5rem', marginBottom: '10px'}} type="text" value={category.title[defaultLanguage]} disabled /></td>
                    </tr>
                    <tr>
                        <td>Name Field</td>
                        <td>
                            <select value={category.nameField}>
                                { category.template.map(({key}) => (
                                    <option>{key}</option>
                                ))}
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className='data-table'>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Label</th>
                        <th>Collection Type</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Localized</th>
                    </tr>
                </thead>
                <tbody>
                    { category.template.map(({key, label, dataType, localized, collectionType}, index) => (
                        <tr>
                            <td><input type='text' onChange={({target: {value}}) => {updateField(index, 'key', value)}} value={key}/></td>
                            <td><input type='text' onChange={({target: {value}}) => {updateField(index, 'label', value)}} value={label}/></td>
                            <td>
                                <select onChange={({target: {value}}) => {updateField(index, 'collectionType', value)}} value={collectionType}>
                                    <option>none</option>
                                    <option>array</option>
                                </select>
                            </td>
                            <td>
                                <select onChange={({target: {value}}) => {updateField(index, 'dataType', value)}} value={dataType}>
                                    <option>text</option>
                                    <option>number</option>
                                    <option>boolean</option>
                                </select>
                            </td>
                            <td><input type='checkbox' onChange={({target: {checked}}) => {updateField(index, 'localized', checked)}} checked={localized} /></td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={6}><button type='button' onClick={() => {addField()}}>Add Field</button></td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};
