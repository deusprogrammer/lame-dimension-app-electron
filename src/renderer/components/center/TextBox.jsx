import React, { useCallback } from 'react';

let styleMap = {
    en: {
        speaker: {
            align: 'left',
            fontSize: '16pt',
            fontFamily: 'gameFont',
            fontWeight: 'bolder',
            color: '#F1AA1C',
        },
        text: {
            align: 'left',
            fontSize: '15pt',
            fontFamily: 'gameFont',
            fontWeight: 'bold',
            color: '#C6C7C6',
        },
    },
    es: {
        speaker: {
            align: 'left',
            fontSize: '16pt',
            fontFamily: 'gameFont',
            fontWeight: 'bolder',
            color: '#F1AA1C',
        },
        text: {
            align: 'left',
            fontSize: '15pt',
            fontFamily: 'gameFont',
            fontWeight: 'bold',
            color: '#C6C7C6',
        },
    },
    jp: {
        speaker: {
            align: 'left',
            fontSize: '16pt',
            fontFamily: 'gameFont',
            fontWeight: 'bolder',
            color: '#F1AA1C',
        },
        text: {
            align: 'left',
            fontSize: '13pt',
            fontFamily: 'gameFont',
            fontWeight: 'bold',
            color: '#C6C7C6',
        },
    },
    fr: {
        speaker: {
            align: 'left',
            fontSize: '16pt',
            fontFamily: 'gameFont',
            fontWeight: 'bolder',
            color: '#F1AA1C',
        },
        text: {
            align: 'left',
            fontSize: '15pt',
            fontFamily: 'gameFont',
            fontWeight: 'bold',
            color: '#C6C7C6',
        },
    },
    br: {
        speaker: {
            align: 'left',
            fontSize: '16pt',
            fontFamily: 'gameFont',
            fontWeight: 'bolder',
            color: '#F1AA1C',
        },
        text: {
            align: 'left',
            fontSize: '15pt',
            fontFamily: 'gameFont',
            fontWeight: 'bold',
            color: '#C6C7C6',
        },
    },
    ch: {
        speaker: {
            align: 'left',
            fontSize: '16pt',
            fontFamily: 'gameFont',
            fontWeight: 'bolder',
            color: '#F1AA1C',
        },
        text: {
            align: 'left',
            fontSize: '15pt',
            fontFamily: 'gameFont',
            fontWeight: 'bold',
            color: '#C6C7C6',
        },
    },
};

const Component = ({ scene, language, index, characters }) => {
    const draw = useCallback((g) => {
        g.clear();
        g.beginFill(0x0c0d0d);
        g.drawRect(0, 0, 640, 70);
        g.endFill();
    }, []);

    if (!scene?.dialogue?.[index]) {
        return <></>;
    }

    let { active, text } = scene.dialogue[index];

    let speakerStyle = styleMap[language].speaker;
    let textStyle = styleMap[language].text;

    let speaker =
        scene.dialogue[index].positions[active]?.override ||
        characters[scene.dialogue[index].positions[active]?.name]?.name ||
        'none';

    speaker =
        speaker.charAt(0).toUpperCase()
        + speaker.slice(1)

    let textLines = text[language].replace(/ /g, '\u00A0').split("\n");
    let textOutput = [];

    let sep = <></>;
    textLines.forEach((line) => {
        textOutput.push(sep);
        textOutput.push(line);
        sep = <br />
    })

    return (
        <div style={{width: "640px", height: "70px", textAlign: "left", backgroundColor: "#0c0d0d"}}>
            <div style={{...speakerStyle, position: "relative", left: "11px", top: "5px", padding: "0px", margin: "0px"}}>
                {speaker}
            </div>
            <div style={{...textStyle, position: "relative", left: "11px", top: "6px", padding: "0px", margin: "0px"}}>
                {textOutput}
            </div>
            {/* <Stage width={640} height={70}>
                <Container x={0} y={0} width={640} height={70}>
                    <Graphics x={0} y={0} width={640} height={70} draw={draw} />
                    <Text
                        style={speakerStyle}
                        x={11}
                        y={7}
                        text={speaker}
                        anchor={{ x: 0, y: 0 }}
                    />
                    <Text
                        style={textStyle}
                        x={11}
                        y={29}
                        text={text[language]}
                        anchor={{ x: 0, y: 0 }}
                    />
                </Container>
            </Stage> */}
        </div>
    );
};

export default Component;
