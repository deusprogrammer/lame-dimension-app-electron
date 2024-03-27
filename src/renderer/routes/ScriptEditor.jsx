import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';

import Chapters from '../components/left/Chapters';
import Languages from '../components/left/Languages';
import Scenes from '../components/left/Scenes';

import CharacterSprites from '../components/center/CharacterSprites';
import TextBox from '../components/center/TextBox';
import Characters from '../components/center/Characters';
import DialogueEditor from '../components/center/DialogueEditor';

import Option from '../components/center/Options';
import userAtom from '../atoms/User.atom';

import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

import update from 'immutability-helper';

import deepDiff from 'deep-diff-pizza';
import { mergePulled } from '../util/util';

let dialogCounter = 0;
let interval;

function App() {
    const [language, setLanguage] = useState('en');
    const [defaultLanguage, setDefaultLanguage] = useState('en');

    const [script, setScript] = useState({});
    const [rootScript, setRootScript] = useState({});

    const [diff, setDiff] = useState([]);

    const [chapters, setChapters] = useState({});
    const [chapter, setChapter] = useState('');

    const [scene, setScene] = useState(null);
    const [sceneCache, setSceneCache] = useState(null);

    const [dialogueIndex, setDialogueIndex] = useState(0);

    const [editable, setEditable] = useState(true);

    const [user] = useAtom(userAtom);

    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const jwtToken = localStorage.getItem('jwtToken');
    const as = searchParams.get('as');

    useEffect(() => {
        loadScript();
    }, []);

    useEffect(() => {
        return window.electron.ipcRenderer.on('start-save-file', () => {
            let chapters = storeScene();
            window.electron.ipcRenderer.sendMessage('save-file', {
                ...script,
                chapters,
            });
            toast.info('Project Saved');
        });
    }, [script]);

    const deepCopyObject = (object) => {
        return JSON.parse(JSON.stringify(object));
    };

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

    const storeScene = () => {
        if (!sceneCache) {
            return chapters;
        }

        let copy = update(chapters, {
            [chapter]: {
                scenes: { [scene]: { $set: sceneCache } },
            },
        });
        setChapters(copy);
        setScript({ ...script, chapters: copy });
        return copy;
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

    const updateOptions = (options) => {
        let copy = update(sceneCache, {
            options: { $set: options },
        });
        setSceneCache(copy);
    };

    const updateScene = (sceneKey, updated) => {
        let copy = update(chapters, {
            [chapter]: { scenes: { [sceneKey]: { $set: updated } } },
        });
        setChapters(copy);
    };

    const updateDialogue = (index, entry) => {
        let copy = update(sceneCache, {
            dialogue: { [index]: { $set: entry } },
        });
        setSceneCache(copy);
    };

    const addDialogue = (afterIndex) => {
        let copy = deepCopyObject(sceneCache);
        let positions = {
            left: {},
            leftFront: {},
            rightFront: {},
            right: {},
        };
        let active = 'left';

        if (afterIndex >= 0) {
            ({ positions, active } = copy.dialogue[afterIndex]);
        }

        copy.dialogue.splice(afterIndex + 1, 0, {
            positions: {
                left: { ...positions?.left },
                right: { ...positions?.right },
                leftFront: { ...positions?.leftFront },
                rightFront: { ...positions?.rightFront },
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
            active,
            emote: null,
        });
        setDialogueIndex(afterIndex + 1);
        setSceneCache(copy);
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

    const storeDialogues = (newDialogs) => {
        let copy = update(sceneCache, {
            dialogue: { $set: newDialogs },
        });
        setSceneCache(copy);
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
        setSceneCache(newScene);
        setChapters(copy);
        setScript({ ...script, chapters: copy });
    };

    const removeScene = (sceneKey) => {
        let copy = update(chapters, {
            [chapter]: { scenes: { $unset: [sceneKey] } },
        });
        setScene(null);
        setSceneCache(null);
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

    const removeDialogue = (dialogueIndex) => {
        let copy = update(sceneCache, {
            dialogue: { $splice: [[dialogueIndex, 1]] },
        });
        setSceneCache(copy);
    };

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
                        if (sceneCache) {
                            storeScene();
                        }
                        setChapter(chapter);
                        setScene(null);
                        setSceneCache(null);
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
                        if (sceneCache) {
                            storeScene();
                        }
                        setScene(key);
                        setDialogueIndex(0);
                        setSceneCache({ ...chapters[chapter].scenes[key] });
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
                        scene={sceneCache}
                        index={dialogueIndex}
                        characters={script.characters}
                        editable={editable}
                        diff={diff}
                        path={`chapters.${chapter}.scenes.${scene}.dialogue[${dialogueIndex}].positions`}
                        onPositionChange={updateDialogue}
                    />
                    <div>
                        <CharacterSprites
                            scene={sceneCache}
                            index={dialogueIndex}
                        />
                        <TextBox
                            language={language}
                            defaultLanguage={defaultLanguage}
                            scene={sceneCache}
                            index={dialogueIndex}
                            characters={script.characters}
                        />
                    </div>
                    <Characters
                        side="right"
                        scene={sceneCache}
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
                        options={sceneCache.options}
                        editable={editable}
                        diff={diff}
                        path={`chapters.${chapter}.scenes.${scene}.options`}
                        onOptionsChange={(options) => {
                            updateOptions(options);
                        }}
                    />
                ) : null}
                <DialogueEditor
                    language={language}
                    defaultLanguage={defaultLanguage}
                    scene={sceneCache}
                    index={dialogueIndex}
                    sceneKey={scene}
                    editable={editable}
                    diff={diff}
                    path={`chapters.${chapter}.scenes.${scene}.dialogue`}
                    onDialogueIndexChange={setDialogueIndex}
                    onDialogueChange={updateDialogue}
                    onDialogueAdd={addDialogue}
                    onDialogueRearrange={storeDialogues}
                    onDialogueRemove={removeDialogue}
                />
            </div>
        </div>
    );
}

export default App;
