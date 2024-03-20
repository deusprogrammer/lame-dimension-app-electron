import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';

const component = () => {
    const [user, setUser] = useState({ password: '' });
    const navigate = useNavigate();
    let jwtToken = localStorage.getItem('jwtToken');

    const updateUser = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_DOMAIN}/profiles/${user.username}`,
                {
                    ...user,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );
            navigate(`${process.env.PUBLIC_URL}/`);
        } catch (e) {
            console.error(e);
            toast.error('Unable to update user');
            return;
        }
    };

    const getUser = async () => {
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
            toast.error('Unable to get user');
            return;
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <div>
            <input
                type="password"
                value={user.password}
                onChange={({ target: { value } }) => {
                    setUser({ ...user, password: value });
                }}
            />
            <button onClick={updateUser}>Change Password</button>
        </div>
    );
};

export default component;
