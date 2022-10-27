//import * as serviceWorker from './serviceWorker';
//// If you want your app to work offline and load faster, you can change
//// unregister() to register() below. Note this comes with some pitfalls.
//// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.unregister();

//import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './index.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <App />
);

//root.render(
//    <StrictMode>
//        <App />
//    </StrictMode>,
//);


