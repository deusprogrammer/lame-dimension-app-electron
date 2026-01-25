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
    const [name, setName] = useState();
    const [categories, setCategories] = useState({});
    const [categoryData, setCategoryData] = useState({});

    const [language, setLanguage] = useState('en');
    const [defaultLanguage, setDefaultLanguage] = useState('en');
    const [editable, setEditable] = useState(true);

    useEffect(() => {
        loadScript();
    }, []);

    useEffect(() => {
        return window.electron.ipcRenderer.on('start-save-file', () => {
            let updatedScript = {name, categoryData, categories};
            window.electron.ipcRenderer.sendMessage('saveDatabase', updatedScript);
            toast.info("Project Saved");
        });
    }, [categoryData, categories]);

    const loadScript = async () => {
        try {
            const db = await window.electron.ipcRenderer.sendMessage("loadDatabase");
            setCategories(db.categories);
            setCategoryData(db.categoryData);
            setName(db.name);
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

    const ensureFieldsExist = (category, item) => {
        // Ensure all fields from the template exist on the item
        let template = categories[category]?.template;
        if (!template) return item;

        let updatedItem = { ...item };
        let wasUpdated = false;

        template.forEach(({ key, dataType, localized, collectionType }) => {
            // Check if field is missing or null/undefined
            const fieldExists = key in updatedItem && updatedItem[key] != null;

            // For arrays, also check if the structure is valid
            if (fieldExists && collectionType === 'array') {
                if (localized) {
                    // Ensure each language has an array
                    if (typeof updatedItem[key] === 'object' && !Array.isArray(updatedItem[key])) {
                        for (let lang in updatedItem[key]) {
                            if (!Array.isArray(updatedItem[key][lang])) {
                                updatedItem[key][lang] = [];
                                wasUpdated = true;
                            }
                        }
                    } else {
                        // Field exists but isn't properly structured
                        updatedItem[key] = createLocalizationBlock([]);
                        wasUpdated = true;
                    }
                } else if (!Array.isArray(updatedItem[key])) {
                    updatedItem[key] = [];
                    wasUpdated = true;
                }
            } else if (!fieldExists) {
                wasUpdated = true;

                // Initialize missing field with proper default
                if (localized && collectionType === 'array') {
                    updatedItem[key] = createLocalizationBlock([]);
                } else if (localized && dataType === 'text') {
                    updatedItem[key] = createLocalizationBlock('');
                } else if (collectionType === 'array') {
                    updatedItem[key] = [];
                } else {
                    switch (dataType) {
                        case 'number':
                            updatedItem[key] = 0;
                            break;
                        case 'text':
                            updatedItem[key] = '';
                            break;
                        case 'checkbox':
                        case 'boolean':
                            updatedItem[key] = false;
                            break;
                        default:
                            updatedItem[key] = '';
                    }
                }
            }
        });

        return wasUpdated ? updatedItem : item;
    };

    const restructureLocalizedData = (category, field, isLocalized) => {
        let categoryDataCopy = {...categoryData };
        for (let key in categoryDataCopy[category]) {
            if (isLocalized && typeof categoryDataCopy[category][key][field] === 'string') {
                let parsed = "";
                try {
                    parsed = JSON.parse(categoryDataCopy[category][key][field]);
                } catch (e) {
                    parsed = createLocalizationBlock(categoryDataCopy[category][key][field]);
                }
                categoryDataCopy[category][key][field] = parsed;
            } else if (!isLocalized && typeof categoryDataCopy[category][key][field] !== 'string') {
                categoryDataCopy[category][key][field] = JSON.stringify(categoryDataCopy[category][key][field]);
            } else if (isLocalized && !categoryDataCopy[category][key][field]) {
                categoryDataCopy[category][key][field] = createLocalizationBlock('');
            }
        }

        setCategoryData(categoryDataCopy);
    }

    const renameChangedFields = (category, updatedCategory) => {
        let categoryDataCopy = {...categoryData };
        let keyChanges = [];
        let oldCategory = structuredClone(categories[category]);

        // Build a set of all keys in the new template for quick lookup
        let newKeys = new Set(updatedCategory.template.map(field => field.key));

        // Compare templates by position to detect renames
        const maxLength = Math.max(oldCategory.template.length, updatedCategory.template.length);
        for (let i = 0; i < maxLength; i++) {
            // Skip if we're past the end of either array
            if (i >= oldCategory.template.length || i >= updatedCategory.template.length) {
                continue;
            }

            let oldKey = oldCategory.template[i].key;
            let newKey = updatedCategory.template[i].key;

            // If keys are different at the same position
            if (oldKey !== newKey) {
                // Check if the old key still exists anywhere in new template
                if (!newKeys.has(oldKey)) {
                    // Old key doesn't exist in new template = it was renamed
                    keyChanges.push([oldKey, newKey]);
                }
                // If old key exists elsewhere, it was reordered, not renamed
            }
        }

        // Apply the renames to all category items
        for (let [oldKey, newKey] of keyChanges) {
            for (let itemKey in categoryDataCopy[category]) {
                let item = categoryDataCopy[category][itemKey];
                if (oldKey in item) {
                    categoryDataCopy[category][itemKey][newKey] = categoryDataCopy[category][itemKey][oldKey];
                    delete categoryDataCopy[category][itemKey][oldKey];
                }
            }
        }

        setCategoryData(categoryDataCopy);
    }

    const updateCategoryMetadata = (category, updated) => {
        console.log("CATEGORY: " + category);
        console.log("UPDATED: " + updated);

        let categoriesCopy = {...categories};

        updated.template.forEach(({localized, key}) => {
            restructureLocalizedData(category, key, localized);
        });

        renameChangedFields(category, updated);

        // Backfill missing fields on all existing items
        let categoryDataCopy = {...categoryData};
        if (categoryDataCopy[category]) {
            // Create temporary categories with updated template for field checking
            let tempCategories = {...categories, [category]: updated};

            for (let itemKey in categoryDataCopy[category]) {
                // Pass temp categories to a modified ensureFieldsExist check
                let template = tempCategories[category]?.template;
                if (template) {
                    let updatedItem = { ...categoryDataCopy[category][itemKey] };
                    let wasUpdated = false;

                    template.forEach(({ key, dataType, localized, collectionType }) => {
                        if (key in updatedItem) return;
                        wasUpdated = true;

                        if (localized && collectionType === 'array') {
                            updatedItem[key] = createLocalizationBlock([]);
                        } else if (localized && dataType === 'text') {
                            updatedItem[key] = createLocalizationBlock('');
                        } else if (collectionType === 'array') {
                            updatedItem[key] = [];
                        } else {
                            switch (dataType) {
                                case 'number':
                                    updatedItem[key] = 0;
                                    break;
                                case 'text':
                                    updatedItem[key] = '';
                                    break;
                                case 'checkbox':
                                case 'boolean':
                                    updatedItem[key] = false;
                                    break;
                                default:
                                    updatedItem[key] = '';
                            }
                        }
                    });

                    if (wasUpdated) {
                        categoryDataCopy[category][itemKey] = updatedItem;
                    }
                }
            }
            setCategoryData(categoryDataCopy);
        }

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
                newItem[key] = createLocalizationBlock([]);
                return;
            } else if (localized && dataType === 'text') {
                newItem[key] = createLocalizationBlock('');
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

    const removeCategoryItem = (categoryItemKey) => {
        let categoryDataCopy = {...categoryData};
        let categoryItemsCopy = {...categoryData[selectedCategory]};
        delete categoryItemsCopy[categoryItemKey];
        categoryDataCopy[selectedCategory] = categoryItemsCopy;
        setCategoryData(categoryDataCopy);

        // Clear selection if we deleted the selected item
        if (selectedCategoryItem === categoryItemKey) {
            setSelectedCategoryItem(null);
        }
    }

    const cleanupDeletedFields = () => {
        let categoryDataCopy = {...categoryData};
        let cleaned = false;

        // For each category
        for (let categoryKey in categories) {
            let template = categories[categoryKey].template;
            let validKeys = new Set(template.map(field => field.key));

            // For each item in that category
            if (categoryDataCopy[categoryKey]) {
                for (let itemKey in categoryDataCopy[categoryKey]) {
                    let item = categoryDataCopy[categoryKey][itemKey];

                    // Remove any fields that aren't in the template
                    for (let fieldKey in item) {
                        if (!validKeys.has(fieldKey) && fieldKey !== 'id' && fieldKey !== '_id') {
                            delete categoryDataCopy[categoryKey][itemKey][fieldKey];
                            cleaned = true;
                        }
                    }
                }
            }
        }

        if (cleaned) {
            setCategoryData(categoryDataCopy);
            toast.success('Deleted fields cleaned up successfully');
        } else {
            toast.info('No cleanup needed');
        }
    };

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
                onTrigger={() => {
                    toast.info("Categories Updated");
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

        // Ensure all fields from template exist on the item before rendering
        let ensuredItemData = ensureFieldsExist(selectedCategory, categoryItemData);

        // If fields were added, persist them to state
        if (ensuredItemData !== categoryItemData) {
            let categoryDataCopy = {...categoryData};
            categoryDataCopy[selectedCategory] = {
                ...categoryDataCopy[selectedCategory],
                [selectedCategoryItem]: ensuredItemData
            };
            setCategoryData(categoryDataCopy);
            categoryItemData = ensuredItemData;
        }

        selectedCategoryItemComponent = (
            <Cacher
                cacheMap={{
                    categoryItemData: {
                        updateFn: 'onUpdate',
                        keyProp: 'mapKey'
                    }
                }}
                onTrigger={() => {
                    toast.info("Category Data Updated");
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
                                <td>{name}</td>
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
                    onRemove={()=>{}}
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
                        onRemove={removeCategoryItem}
                        editable={editable}
                    />
                ) : null}
                <Languages
                    selectedLanguage={language}
                    defaultLanguage={defaultLanguage}
                    onSelectLanguage={setLanguage}
                    onSelectDefaultLanguage={setDefaultLanguage}
                />
                <h2>Actions</h2>
                <button onClick={() => {
                    let updatedScript = {name, categoryData, categories};
                    window.electron.ipcRenderer.sendMessage('saveDatabase', updatedScript);
                    toast.info("Project Saved");
                }}>
                    Save
                </button>
                <button
                    onClick={() => {
                        window.electron.ipcRenderer.sendMessage('openProjectDirectory');
                    }}
                >
                    Open Script Directory
                </button>
                <button onClick={() => {
                    cleanupDeletedFields();
                    let updatedScript = {name, categoryData, categories};
                    window.electron.ipcRenderer.sendMessage('saveDatabase', updatedScript);
                    toast.info("Project Cleaned Up and Saved");
                }}>
                    Clean Up and Save
                </button>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(
                            JSON.stringify(
                                {
                                    name, categoryData, categories
                                },
                                null,
                                5,
                            ),
                        );
                        toast.info('JSON Payload Copied to Clipboard');
                    }}
                >
                    Dump JSON to Clipboard
                </button>
            </div>
            <div className="center" style={{ textAlign: 'center' }}>
                {!selectedCategoryItemComponent ? selectedCategoryComponent : null}
                {selectedCategoryItemComponent}
            </div>
        </div>
    );
};
