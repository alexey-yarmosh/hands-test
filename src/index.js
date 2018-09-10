import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import '../node_modules/handsontable/dist/handsontable.full.min.css';

// Action reducer for afterChange callbacks triggered by Handsontable
const changes = (state = [], action) => {
  switch (action.type) {
    case 'change':
      return [...state, {
          id: action.id,
          row: action.row,
          column: action.column,
          oldValue: action.oldValue,
          newValue: action.newValue,
          type: action.type
        }
      ]
    default:
      return state;
  }
}
const actionReducers = combineReducers({ changes });
const reduxStore = createStore(actionReducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

// Component for printing the items stored in the redux store
class ActionList extends React.Component {
  render() {
    let result = null;

    if (this.props.actionList.length === 0) {
      result = (
        <div className="empty">
          Empty. Make some edits to the table on the left!
        </div>
      );

    } else {
      result = this.props.actionList.map(function(action) {
        return (
          <li key={action.id} className={action.type}>
            Value changed at <i>({action.row}, {action.column}) </i> from <strong>"{action.oldValue}"</strong> to <strong>"{action.newValue}"</strong>
          </li>
        );
      })
    }
    return (
      <div id="action-list">
        <h4>Change log:</h4>
        <ul>
          {result}
        </ul>
      </div>
    );
  }
}

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.settings = {
      colHeaders: ['', 'Tesla', 'Mazda', 'Mercedes', 'Mini', 'Mitsubishi'],
      data: [
        ['2017', 0, 2941, 4303, 354, 5814],
        ['2018', 3, 2905, 2867, 412, 5284],
        ['2019', 4, 2517, 4822, 552, 6127],
        ['2020', 2, 2422, 5399, 776, 4151]
      ],
      onAfterChange: (changes, source, a, b) => {
        if (source === 'loadData') {
          return;
        }
        console.log(changes);
        console.log(source);
        console.log(a);
        console.log(b);
        changes.forEach(([row, column, oldValue, newValue]) => {
          reduxStore.dispatch({
            id: reduxStore.getState().changes.length,
            type: 'change',
            row,
            column,
            oldValue,
            newValue,
          });
        });
      }
    }
  }

  render() {
    return (
      <div className="redux-example-container">
        <HotTable id="my-hot" root="hot" settings={this.settings}/>
        <ActionList actionList={reduxStore.getState().changes}/>
      </div>
    );
  }
}

const render = () => {
  ReactDOM.render(<MyComponent />, document.getElementById('root'));
}
reduxStore.subscribe(render);
render();
