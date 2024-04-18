import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Chapters from '../components/left/Chapters';
import Languages from '../components/left/Languages';
import Scenes from '../components/left/Scenes';

import CharacterSprites from '../components/center/CharacterSprites';
import TextBox from '../components/center/TextBox';
import Characters from '../components/center/Characters';
import DialogueEditor from '../components/center/DialogueEditor';

import Option from '../components/center/Options';

import update from 'immutability-helper';

import Cacher from '../components/Cacher';
import {getDiff, merge} from '../util/nina';

let dialogCounter = 0;

function App() {
    const [language, setLanguage] = useState('en');
    const [defaultLanguage, setDefaultLanguage] = useState('en');

    const [script, setScript] = useState({});
    const [diff, setDiff] = useState([]);

    const [chapters, setChapters] = useState({});
    const [chapter, setChapter] = useState('');

    const [scene, setScene] = useState(null);

    const [dialogueIndex, setDialogueIndex] = useState(0);

    const [editable, setEditable] = useState(true);
    const [mergeFile, setMergeFile] = useState();

    useEffect(() => {
        loadScript();
    }, []);

    useEffect(() => {
        return window.electron.ipcRenderer.on('start-save-file', () => {
            window.electron.ipcRenderer.sendMessage('saveScript', {
                ...script,
                chapters,
            });
            toast.info('Project Saved');
        });
    }, [script]);

    const loadScript = async () => {
        try {
            const script =
                await window.electron.ipcRenderer.sendMessage('loadScript');
            script.name =
                await window.electron.ipcRenderer.sendMessage('getScriptName');

            if (!script.name) {
                script.name = 'New Script';
            }

            setChapters(script.chapters);
            setScript(script);
        } catch (e) {
            console.error(e);
            toast.error('Load Failed');
        }
    };

    const changeMapKey = (map, oldMapKey, newMapKey) => {
        let newMap = {};
        for (let key in map) {
            let newKey = key;
            if (oldMapKey === key) {
                newKey = newMapKey;
            }
            newMap[newKey] = { ...map[key] };
        }

        return newMap;
    };

    const changeChapterName = async (oldChapterName, newChapterName) => {
        let chaptersCopy = {};

        newChapterName = newChapterName
            .replace(' ', '_')
            .replace(/[^a-zA-Z0-9_]/, '');

        chaptersCopy = changeMapKey(chapters, oldChapterName, newChapterName);

        if (chapter === oldChapterName) {
            setChapter(newChapterName);
        }
        setScript({ ...script, chapters: chaptersCopy });
        setChapters(chaptersCopy);
    };

    const changeSceneKey = (oldSceneKey, newSceneKey) => {
        let chaptersCopy = { ...chapters };
        let scenesCopy = {};

        newSceneKey = newSceneKey
            .replace(' ', '_')
            .replace(/[^a-zA-Z0-9_]/g, '');

        scenesCopy = changeMapKey(
            chapters[chapter].scenes,
            oldSceneKey,
            newSceneKey,
        );

        chaptersCopy[chapter].scenes = scenesCopy;

        if (scene === oldSceneKey) {
            setScene(newSceneKey);
        }
        setScript({ ...script, chapters: chaptersCopy });
        setChapters(chaptersCopy);
    };

    const updateScene = (sceneKey, updated) => {
        let copy = update(chapters, {
            [chapter]: { scenes: { [sceneKey]: { $set: updated } } },
        });
        setChapters(copy);
    };

    const updateOptions = (options) => {
        let copy = update(chapters, {
            [chapter]: { scenes: { [scene]: { options: { $set: options } } } },
        });
        setChapters(copy);
    };

    const updateDialogue = (index, entry) => {
        let copy = update(chapters, {
            [chapter]: { scenes: { [scene]: { dialogue: { [index]: { $set: entry } } } } },
        });
        setChapters(copy);
    };

    const addChapter = () => {
        let chapterName = `Chapter${Object.keys(chapters).length}`;
        if (chapters.length === 0) {
            chapterName = 'Prologue';
        }
        let copy = { ...chapters };
        copy[chapterName.toLocaleLowerCase()] = {
            name: chapterName,
            scenes: [],
            updated: Date.now(),
        };
        setChapters(copy);
        setScene(null);
        setDialogueIndex(0);
        setChapter(chapterName.toLowerCase());
        setScript({ ...script, chapters: copy });
    };

    const createScene = () => {
        let newSceneKey = `scene${dialogCounter++}`;
        let newScene = {
            dialogue: [
                {
                    options: {
                        smallerPortraits: false,
                        disablePortraits: false,
                        keepBlackBars: false,
                    },
                    positions: {
                        left: {},
                        leftFront: {},
                        rightFront: {},
                        right: {},
                    },
                    text: {
                        en: '',
                        es: '',
                        jp: '',
                        fr: '',
                        br: '',
                        ch: '',
                    },
                    choices: {
                        en: [],
                        es: [],
                        jp: [],
                        fr: [],
                        br: [],
                        ch: [],
                    },
                    active: 'left',
                    emote: null,
                },
            ],
        };
        let copy = update(chapters, {
            [chapter]: { scenes: { [newSceneKey]: { $set: newScene } } },
        });

        console.log('CHAPTERS: ' + JSON.stringify(copy, null, 5));

        setDialogueIndex(0);
        setScene(newSceneKey);
        setChapters(copy);
        setScript({ ...script, chapters: copy });
    };

    const removeScene = (sceneKey) => {
        let copy = update(chapters, {
            [chapter]: { scenes: { $unset: [sceneKey] } },
        });
        setScene(null);
        setChapters(copy);
        setScript({ ...script, chapters: copy });
    };

    const removeChapter = (chapterKey) => {
        let copy = update(chapters, { $unset: [chapterKey] });
        setScene(null);
        setChapter(null);
        setChapters(copy);
        setScript({ ...script, chapters: copy });
    };

    if (mergeFile) {
        let diff = getDiff(script, mergeFile);

        return (
            <div>
                <h1>Merge Report</h1>
                <table className="merge-table">
                    <thead>
                        <tr>
                            <th>Path</th>
                            <th>Old</th>
                            <th></th>
                            <th>New</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            diff.map(({path, oldValue, newValue}) => (
                                <tr key={path}>
                                    <td>{path}</td>
                                    <td>{oldValue}</td>
                                    <td>=&gt;</td>
                                    <td>{newValue}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <div style={{textAlign: "center"}}>
                    <button onClick={() => {
                        let updatedScript = merge(script, mergeFile);
                        setScript(updatedScript);
                        setChapters(updatedScript.chapters);
                        setMergeFile(null);
                    }}>
                        Accept
                    </button>
                    <button onClick={() => {
                        setMergeFile(null);
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="left">
                <h2>Script Metadata</h2>
                <div>
                    <table className="key-value-table">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{script.name}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Chapters
                    selectedChapter={chapter}
                    chapters={chapters}
                    editable={editable}
                    diff={diff}
                    path={'chapters'}
                    onChapterSelect={(chapter) => {
                        setChapter(chapter);
                        setScene(null);
                    }}
                    onChapterCreate={addChapter}
                    onChapterRemove={removeChapter}
                    onChapterNameChange={changeChapterName}
                />
                <Scenes
                    scenes={chapters[chapter]?.scenes}
                    selectedScene={scene}
                    editable={editable}
                    diff={diff}
                    path={`chapters.${chapter}.scenes`}
                    onSelectScene={(key) => {
                        setScene(key);
                        setDialogueIndex(0);
                    }}
                    onCreateScene={createScene}
                    onSceneRemove={removeScene}
                    onSceneKeyChange={changeSceneKey}
                />
                <Languages
                    selectedLanguage={language}
                    defaultLanguage={defaultLanguage}
                    onSelectLanguage={setLanguage}
                    onSelectDefaultLanguage={setDefaultLanguage}
                />
                <h2>Actions</h2>
                <button
                    onClick={async () => {
                        let merge = await window.electron.ipcRenderer.sendMessage('mergeFile');
                        setMergeFile(merge);
                    }}
                >
                    Merge File
                </button>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(
                            JSON.stringify(
                                {
                                    ...script,
                                    chapters,
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
                <h2>{scene}</h2>
                <div className="preview">
                    <Characters
                        side="left"
                        scene={chapters?.[chapter]?.scenes?.[scene] ?? {}}
                        index={dialogueIndex}
                        characters={script.characters}
                        editable={editable}
                        diff={diff}
                        path={`chapters.${chapter}.scenes.${scene}.dialogue[${dialogueIndex}].positions`}
                        onPositionChange={updateDialogue}
                    />
                    <div>
                        <CharacterSprites
                            scene={chapters?.[chapter]?.scenes?.[scene] ?? {}}
                            index={dialogueIndex}
                        />
                        <TextBox
                            language={language}
                            defaultLanguage={defaultLanguage}
                            scene={chapters?.[chapter]?.scenes?.[scene] ?? {}}
                            index={dialogueIndex}
                            characters={script.characters}
                        />
                    </div>
                    <Characters
                        side="right"
                        scene={chapters?.[chapter]?.scenes?.[scene] ?? {}}
                        index={dialogueIndex}
                        characters={script.characters}
                        editable={editable}
                        diff={diff}
                        path={`chapters.${chapter}.scenes.${scene}.dialogue[${dialogueIndex}].positions`}
                        onPositionChange={updateDialogue}
                    />
                </div>
                {scene ? (
                    <Option
                        options={chapters?.[chapter]?.scenes?.[scene]?.options ?? {options: {}}}
                        editable={editable}
                        diff={diff}
                        path={`chapters.${chapter}.scenes.${scene}.options`}
                        onOptionsChange={(options) => {
                            updateOptions(options);
                        }}
                    />
                ) : null}
                <Cacher
                    cacheMap={{
                        scene: {
                            updateFn: 'onSceneUpdate',
                            keyProp: 'sceneKey'
                        }
                    }}
                    onTrigger={() => {
                        toast.info("Dialogue Updated");
                    }}
                    triggerEvent='cache-save'
                    updateTimeout={1000}
                >
                    <DialogueEditor
                        language={language}
                        defaultLanguage={defaultLanguage}
                        scene={chapters?.[chapter]?.scenes?.[scene] ?? {}}
                        index={dialogueIndex}
                        sceneKey={scene}
                        editable={editable}
                        diff={diff}
                        path={`chapters.${chapter}.scenes.${scene}.dialogue`}
                        onSceneUpdate={(sceneKey, updated) => {updateScene(sceneKey, updated)}}
                        onDialogueIndexChange={setDialogueIndex}
                    />
                </Cacher>
            </div>
        </div>
    );
}

export default App;
