import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
    Link,
    useLocation,
} from 'react-router-dom';

import ScriptEditor from './routes/ScriptEditor';
import Login from './routes/Login';
import User from './routes/User';
import Admin from './routes/Admin';
import DatabaseEditor from './routes/DatabaseEditor';

import userAtom from './atoms/User.atom';

import './App.css';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function App() {
    const [user, setUser] = useAtom(userAtom);
    const jwtToken = localStorage.getItem('jwtToken');
    const navigate = useNavigate();
    const location = useLocation();

    const pattern =
        /^.*\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/*.*$/;

    const match = location.pathname.match(pattern);
    let id = match ? match[1] : null;

    const getUser = async () => {
        if (!jwtToken) {
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
            toast.error('Unable  to fetch user profile');
            console.error(e);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    if (!user) {
        return <></>;
    }

    return (
        <>
            <div>
                <>
                    <button
                        onClick={() => {
                            navigate(
                                `/editor/script`
                            );
                        }}
                    >
                        Dialogue Editor
                    </button>
                    <button
                        onClick={() => {
                            navigate(
                                `/editor/script`
                            );
                        }}
                    >
                        Character Editor
                    </button>
                    <button
                        onClick={() => {
                            navigate(
                                `/editor/database`
                            );
                        }}
                    >
                        Database Editor
                    </button>
                </>
            </div>
            <Routes>
                <Route
                    path={`/editor/script`}
                    exact
                    element={<ScriptEditor />}
                />
                <Route
                    path={`/editor/database`}
                    exact
                    element={<DatabaseEditor />}
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={`/editor/script`}
                            replace={true}
                        />
                    }
                />
            </Routes>
        </>
    );
}

export default App;
