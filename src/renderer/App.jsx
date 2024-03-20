import AppRouter from './AppRouter';
import { BrowserRouter as Router } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    return (
        <>
            <ToastContainer />
            <Router>
                <AppRouter />
            </Router>
        </>
    );
}

export default App;
