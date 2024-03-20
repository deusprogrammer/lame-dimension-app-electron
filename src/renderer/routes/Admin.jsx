import React, { useEffect, useState } from 'react';
import axios from 'axios';

const component = () => {
    const [users, setUsers] = useState([]);
    const [codes, setCodes] = useState([]);
    const jwtToken = localStorage.getItem('jwtToken');

    const loadUsers = async () => {
        let res = await axios.get(`${process.env.REACT_APP_API_DOMAIN}/users`, {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
        setUsers(res.data);
        res = await axios.get(`${process.env.REACT_APP_API_DOMAIN}/codes`, {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
        setCodes(res.data);
    };

    const createCode = async () => {
        await axios.post(
            `${process.env.REACT_APP_API_DOMAIN}/codes`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            }
        );
        await loadUsers();
    };

    const adjustUserRoles = async (checked, username, role) => {
        const foundUserIndex = users.findIndex(
            ({ username: name }) => username === name
        );
        const usersCopy = [...users];

        console.log('INDEX: ' + foundUserIndex);

        if (foundUserIndex < 0) {
            return;
        }

        console.log(
            'USER: ' + JSON.stringify(usersCopy[foundUserIndex], null, 5)
        );

        const roles = usersCopy[foundUserIndex].roles;
        usersCopy[foundUserIndex].roles = roles.filter(
            (roleName) => roleName !== role
        );
        if (checked) {
            usersCopy[foundUserIndex].roles.push(role);
        }

        await axios.put(
            `${process.env.REACT_APP_API_DOMAIN}/profiles/${username}`,
            usersCopy[foundUserIndex],
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            }
        );

        setUsers(usersCopy);
    };

    const deleteUser = async (username) => {
        await axios.delete(
            `${process.env.REACT_APP_API_DOMAIN}/profiles/${username}`,
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            }
        );
        await loadUsers();
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div>
            <h1>User Admin</h1>
            <h2>Users</h2>
            <table style={{ marginLeft: '10px' }}>
                <tbody>
                    {users.map(({ username, roles }) => {
                        return (
                            <tr>
                                <td style={{ fontWeight: 'bolder' }}>
                                    {username}
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        onChange={({ target: { checked } }) => {
                                            adjustUserRoles(
                                                checked,
                                                username,
                                                'EDITOR'
                                            );
                                        }}
                                        checked={roles.includes('EDITOR')}
                                    />
                                    <label>EDITOR</label>
                                    <input
                                        type="checkbox"
                                        onChange={({ target: { checked } }) => {
                                            adjustUserRoles(
                                                checked,
                                                username,
                                                'ADMIN'
                                            );
                                        }}
                                        checked={roles.includes('ADMIN')}
                                    />
                                    <label>ADMIN</label>
                                </td>
                                <td>
                                    <button
                                        onClick={() => {
                                            deleteUser(username);
                                        }}
                                    >
                                        Delete User
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <h2>Codes</h2>
            <ul>
                {codes.map(({ code }) => {
                    return <li>{code}</li>;
                })}
            </ul>
            <button
                onClick={() => {
                    createCode();
                }}
            >
                Create Code
            </button>
        </div>
    );
};

export default component;
