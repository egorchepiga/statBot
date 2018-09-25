import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import './styles/css/common.css';
import './styles/css/menu.css';
import './styles/css/switch.css';
import './styles/css/stickers.css';
import './styles/css/buttons.css';
import './styles/css/userlist.css';
import './styles/css/timegraphic.css';
import './styles/css/chatprofile.css';
import App from './App';
import combineReducers from './store/index'



import registerServiceWorker from './registerServiceWorker';

let store = createStore(combineReducers,composeWithDevTools(applyMiddleware(thunk)));
ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);


registerServiceWorker();