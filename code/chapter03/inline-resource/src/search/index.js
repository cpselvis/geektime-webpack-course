'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import logo from './images/logo.png';
import './index.less';

class Search extends React.Component {

    constructor() {
        super(...arguments);
    }

    render() {
        return <div className="search-text">
            <img src={ logo } /> 搜索文字的内容
        </div>;
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
);