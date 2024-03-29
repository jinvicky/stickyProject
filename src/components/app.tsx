import { FunctionalComponent, h } from 'preact';
import { Route, Router } from 'preact-router';

import Home from '../routes/home/flipSticker2/flipSticker';

const App: FunctionalComponent = () => {
    return (
        <div id="preact_root">
            <Router>
                <Route path="/" component={Home} />
            </Router>
        </div>
    );
};

export default App;
