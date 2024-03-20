import axios from 'axios';
import { useAtom } from 'jotai';
import userAtom from '../atoms/User.atom';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const Component = () => {
    const [user, setUser] = useAtom(userAtom);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    const login = async () => {
        let jwtToken;
        try {
            let res = await axios.post(
                `${process.env.REACT_APP_API_DOMAIN}/auth`,
                {
                    username,
                    password,
                }
            );

            jwtToken = res.data.jwtToken;
            localStorage.setItem('jwtToken', res.data.jwtToken);
            navigate(`${process.env.PUBLIC_URL}/scripts`);
        } catch (e) {
            toast.error('Incorrect credentials');
            return;
        }

        try {
            let res = await axios.get(
                `${process.env.REACT_APP_API_DOMAIN}/profiles/self`,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );

            setUser(res.data);
        } catch (e) {
            toast.error('Unable to fetch profile');
            return;
        }
    };

    const createUser = async () => {
        let jwtToken;
        try {
            await axios.post(`${process.env.REACT_APP_API_DOMAIN}/users`, {
                username,
                password,
                code,
            });

            let res = await axios.post(
                `${process.env.REACT_APP_API_DOMAIN}/auth`,
                {
                    username,
                    password,
                }
            );

            jwtToken = res.data.jwtToken;
            localStorage.setItem('jwtToken', res.data.jwtToken);
            navigate(`${process.env.PUBLIC_URL}/scripts`);
        } catch (e) {
            toast.error('Unable to create user');
        }

        try {
            let res = await axios.get(
                `${process.env.REACT_APP_API_DOMAIN}/profiles/self`,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );

            setUser(res.data);
        } catch (e) {
            console.error(e);
            return;
        }
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>Login</h2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50%',
                    margin: 'auto',
                }}
            >
                <label>Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={({ target: { value } }) => {
                        setUsername(value);
                    }}
                />
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={({ target: { value } }) => {
                        setPassword(value);
                    }}
                />
                <label>Creation Code</label>
                <input
                    type="text"
                    value={code}
                    onChange={({ target: { value } }) => {
                        setCode(value);
                    }}
                />
                <button onClick={login}>Login</button>
                <button onClick={createUser}>Create User</button>
            </div>
        </div>
    );
};

export default Component;
