import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import userAtom from '../atoms/User.atom';
import { toast } from 'react-toastify';

const Component = () => {
    const navigate = useNavigate();
    const [scripts, setScripts] = useState([]);
    const [user] = useAtom(userAtom);
    const jwtToken = localStorage.getItem('jwtToken');

    const loadScripts = async () => {
        try {
            let res = await axios.get(
                `${process.env.REACT_APP_API_DOMAIN}/scripts?headersOnly`,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );

            setScripts(res.data || []);
        } catch (e) {
            console.error(e);
            toast.error('Unable to load scripts');
        }
    };

    useEffect(() => {
        loadScripts();
    }, []);

    return (
        <div style={{ width: '60%', margin: 'auto' }}>
            <h1 style={{ textAlign: 'center' }}>Scripts</h1>
            {scripts.map((script) => {
                if (script.editor === 'root') {
                    return (
                        <>
                            <div
                                key={`${script.id}-root`}
                                style={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    let url = `${process.env.PUBLIC_URL}/scripts/${script.id}?as=root`;
                                    navigate(url);
                                }}
                            >
                                {user.username === script.editor ? '>' : null}
                                {script.name}({script.id})[{script.editor}]
                            </div>
                            <div
                                key={`${script.id}-me`}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: 'green',
                                    fontWeight: 'bolder',
                                }}
                                onClick={() => {
                                    let url = `${process.env.PUBLIC_URL}/scripts/${script.id}`;
                                    navigate(url);
                                }}
                            >
                                {script.name}({script.id})[{user.username}]
                            </div>
                        </>
                    );
                } else if (script.editor === user.username) {
                    return null;
                }

                return (
                    <div
                        key={`${script.name}-${script.editor}`}
                        style={{
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            let url = `${process.env.PUBLIC_URL}/scripts/${script.id}`;
                            if (user.username !== script.editor) {
                                url += `?as=${script.editor}`;
                            }
                            navigate(url);
                        }}
                    >
                        {script.name}({script.id})[{script.editor}]
                    </div>
                );
            })}
        </div>
    );
};

export default Component;
