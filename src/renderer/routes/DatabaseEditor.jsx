import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import axios from 'axios';
import { toast } from 'react-toastify';

import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import Languages from '../components/left/Languages';
import Categories from '../components/left/Categories';
import CategoryData from '../components/left/CategoryData';

import userAtom from '../atoms/User.atom';
import CategoryItemDataTable from '../components/center/database/CategoryItemDataTable';
import CategoryDataTable from '../components/center/database/CategoryDataTable';

import EditableInput from '../components/EditableInput';
import { createLocalizationBlock } from '../data/languages';
import Cacher from '../components/Cacher';

let interval;
export default () => {
    const [selectedCategory, setSelectedCategory] = useState();
    const [selectedCategoryItem, setSelectedCategoryItem] = useState();
    const [categories, setCategories] = useState({});
    const [categoryData, setCategoryData] = useState({});

    const [language, setLanguage] = useState('en');
    const [defaultLanguage, setDefaultLanguage] = useState('en');
    const [script, setScript] = useState({});
    const [editable, setEditable] = useState(true);

    useEffect(() => {
        loadScript();
    }, []);

    useEffect(() => {
        return window.electron.ipcRenderer.on('start-save-file', () => {
            let updatedScript = {...script, categoryData, categories};
            window.electron.ipcRenderer.sendMessage('save-file', updatedScript);
            setScript(updatedScript);
            toast.info("Project Saved");
        });
    }, [categoryData, categories]);

    const loadScript = async () => {
        try {
            const script = await window.electron.ipcRenderer.sendMessage("loadScript");
            setCategories(script.categories);
            setCategoryData(script.categoryData);
            setScript(script);
        } catch (e) {
            console.error(e);
            toast.error('Load Failed');
        }
    };

    const updateCategoryKey = (oldCategoryKey, newCategoryKey) => {
        let categoriesCopy = {};
        let categoryDataCopy = {};

        newCategoryKey = newCategoryKey
            .replace(' ', '_')
            .replace(/[^a-zA-Z0-9_]/, '');

        for (let key in categories) {
            if (key === '_id') {
                continue;
            }

            let newKey = key;
            if (oldCategoryKey === key) {
                newKey = newCategoryKey;
            }
            categoriesCopy[newKey] = { ...categories[key] };
        }
        for (let key in categoryData) {
            if (key === '_id') {
                continue;
            }

            let newKey = key;
            if (oldCategoryKey === key) {
                newKey = newCategoryKey;
            }
            categoryDataCopy[newKey] = { ...categoryData[key] };
        }
        if (selectedCategory === oldCategoryKey) {
            setSelectedCategory(newCategoryKey);
        }
        setCategories(categoriesCopy);
        setCategoryData(categoryDataCopy);
    }

    const updateCategoryItemKey = (oldCategoryItemKey, newCategoryItemKey) => {
        let categoryDataItemCopy = {};

        newCategoryItemKey = newCategoryItemKey
            .replace(' ', '_')
            .replace(/[^a-zA-Z0-9_]/, '');

        for (let key in categoryData[selectedCategory]) {
            if (key === '_id') {
                continue;
            }

            let newKey = key;
            if (oldCategoryItemKey === key) {
                newKey = newCategoryItemKey;
            }
            categoryDataItemCopy[newKey] = { ...categoryData[selectedCategory][key], id: newKey };
        }
        if (selectedCategoryItem === oldCategoryItemKey) {
            setSelectedCategoryItem(newCategoryItemKey);
        }

        let categoryDataCopy = {...categoryData};
        categoryDataCopy[selectedCategory] = categoryDataItemCopy;
        setCategoryData(categoryDataCopy);
    }

    const updateCategoryMetadata = (category, updated) => {
        let categoriesCopy = {...categories};
        categoriesCopy[category] = updated;
        setCategories(categoriesCopy);
    }

    const updateCategoryData = (category, categoryItem, updated) => {
        let categoryDataCopy = {...categoryData};
        categoryDataCopy[category][categoryItem] = updated;
        setCategoryData(categoryDataCopy);
    }

    const addCategory = () => {
        let categoriesCopy = {...categories};
        categoriesCopy[`_category${Object.keys(categories).length}`] = {
            title: createLocalizationBlock(`_category${Object.keys(categories).length}`),
            nameField: 'name',
            template: [
                {
                    key: 'name',
                    label: 'Name',
                    collectionType: 'none',
                    dataType: 'text',
                    localized: false
                }
            ]
        };
        let categoryItemCopy = {...categoryData};
        categoryItemCopy[`_category${Object.keys(categories).length}`] = {};
        setCategories(categoriesCopy);
        setCategoryData(categoryItemCopy);
    }

    const addCategoryItem = () => {
        let categoryDataCopy = {...categoryData};
        let categoryItemsCopy = {...categoryData[selectedCategory]};
        let newItem = {};

        let category = categories[selectedCategory];
        category.template.forEach(({key, dataType, localized, collectionType}) => {
            if (localized && collectionType === 'array') {
                newItem[key] = createLocalizationBlock(() => new Array());
                return;
            } else if (localized && dataType === 'text') {
                newItem[key] = createLocalizationBlock('')
                return;
            }

            if (collectionType === 'array') {
                newItem[key] = [];
                return;
            }

            switch(dataType) {
                case 'number':
                    newItem[key] = 0;
                    break;
                case 'text':
                    newItem[key] = '';
                    break;
                case 'checkbox':
                    newItem[key] = false;
                    break;
            }
        });

        newItem.id = `_category-item${Object.keys(categoryData[selectedCategory]).length}`;
        categoryItemsCopy[`_category-item${Object.keys(categoryData[selectedCategory]).length}`] = newItem;
        categoryDataCopy[selectedCategory] = categoryItemsCopy;
        setCategoryData(categoryDataCopy);
    }

    let selectedCategoryComponent;
    if (categories[selectedCategory]) {
        let categoryData =
            categories[selectedCategory];
        selectedCategoryComponent = (
            <Cacher
                cacheMap={{
                    category: {
                        updateFn: 'onUpdate',
                        keyProp: 'mapKey'
                    }
                }}
                updateTimeout={1000}
            >
                <CategoryDataTable
                    mapKey={selectedCategory}
                    category={categoryData}
                    defaultLanguage={defaultLanguage}
                    language={language}
                    onUpdate={(category, updated) => {updateCategoryMetadata(category, updated)}}
                />
            </Cacher>
        );
    }

    let selectedCategoryItemComponent;
    if (categories[selectedCategory] && selectedCategoryItem) {
        let categoryItemData =
            categoryData[selectedCategory][selectedCategoryItem];
        selectedCategoryItemComponent = (
            <Cacher
                cacheMap={{
                    categoryItemData: {
                        updateFn: 'onUpdate',
                        keyProp: 'mapKey'
                    }
                }}
                updateTimeout={1000}
            >
                <CategoryItemDataTable
                    mapKey={selectedCategoryItem}
                    category={categories[selectedCategory]}
                    categoryItemData={categoryItemData}
                    defaultLanguage={defaultLanguage}
                    language={language}
                    onUpdate={(selectedCategoryItem, updated) => {updateCategoryData(selectedCategory, selectedCategoryItem, updated)}}
                />
            </Cacher>
        );
    }

    return (
        <div className="container">
            <div className="left">
                <h2>Database</h2>
                <div>
                    <table className="key-value-table">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{script.name}</td>
                            </tr>
                            <tr>
                                <td>Editor</td>
                                <td>{script.editor}</td>
                            </tr>
                            <tr>
                                <td>Mode</td>
                                <td>
                                    {editable ? (
                                        <span style={{ color: 'green' }}>
                                            Editing
                                        </span>
                                    ) : (
                                        <span style={{ color: 'red' }}>
                                            Read Only
                                        </span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Categories
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={(newSelectedCategory) => {
                        setSelectedCategory(newSelectedCategory);
                        setSelectedCategoryItem(null);
                    }}
                    onCreate={addCategory}
                    onKeyChange={updateCategoryKey}
                    onRemove={}
                    editable={editable}
                />

                {selectedCategory ? (
                    <CategoryData
                        categoryData={categoryData}
                        selectedCategory={selectedCategory}
                        selectedCategoryItem={selectedCategoryItem}
                        onSelect={(newSelectedCategoryItem) => {
                            setSelectedCategoryItem(newSelectedCategoryItem);
                        }}
                        onCreate={addCategoryItem}
                        onKeyChange={updateCategoryItemKey}
                        onRemove={}
                        editable={editable}
                    />
                ) : null}
                <Languages
                    selectedLanguage={language}
                    defaultLanguage={defaultLanguage}
                    onSelectLanguage={setLanguage}
                    onSelectDefaultLanguage={setDefaultLanguage}
                />
            </div>
            <div className="center" style={{ textAlign: 'center' }}>
                {!selectedCategoryItemComponent ? selectedCategoryComponent : null}
                {selectedCategoryItemComponent}
            </div>
        </div>
    );
};
