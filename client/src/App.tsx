import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreatePaste from './pages/CreatePaste';
import ViewPaste from './pages/ViewPaste';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CreatePaste />} />
                {/* Helper route to view via API (not the main requirement link) */}
                <Route path="/view/:id" element={<ViewPaste />} />
            </Routes>
        </Router>
    );
}

export default App;
