# kahtox
A small JavaScript library based on state machines (but not entirely) for isolating and managing its own UI-state (transient / non-persisted) layer while controlling a Domain-state (non-transient / persisted) layer like Redux, MobX, Radixx.

## Inspiration

This work was inspired by earlier works by [David K. Piano](https://twitter.com/davidkpiano) on [**xstate**](https://github.com/davidkpiano/xstate) and [Krasimir Tsonev](http://krasimirtsonev.com/) on [**stent**](https://github.com/krasimir/stent). Drawing from their work and thinking deeply about the problem, it was now clear that there needed to be a paradigmn shift in the way we approached state management. *Xstate* for me is neat and helpful but is also too verbose and seeks to replace *Redux*. I have all these lingua and terminilogy like (Sequence, History, Orthogonal, Events, States, Effects, Guard) that i have to learn to make sense of it all. *Stent* on the other hand is less verbose but also seeks to replace *Redux* completely and adds composability problems (how do you compose one or more state machines together).

Now, *Kahtox* still makes use of finite state machine graphs and transitions too but doesn't try to replace libraires like *MobX* and *Redux* but seeks to work along side these libraires. The reason for this is that UI state is NEVER meant to be stored in any state container because it is TRANSIENT and is totally irreleveant after a record of its occurence. UI state doesn't also need to be tracked for changes. Only Domain state needs to be stored in a state container and tracked for changes.

By seperating both state types into their respective layers and having one (UI state) control the other (Domain state), it becomes easier to manage outcomes and enforce guards for user interface interactions.

## Motivation

The need to separate today's monolith state management layer architecure into a more managable set of layers (2 of them actually)

1. UI State Layer (Transient / Non-Persisted)
2. Domain State Layer (Non-Transient / Persisted)

This need is long ovedue. state management libraries like Redux were under too much pressure to manage both UI State (which actually doesn't need to be persisted) and Domain state (which is actually meant to be put into a state container and persisted across web sessions)

However, this hasn't happened because everything is still built around verbosity and replacement. The idea is not to seek to replace Redux (even though [Redux could be better redesigned](https://hackernoon.com/redesigning-redux-b2baee8b8a38)) but to reduce the amount of "useless work" that libraries like MobX or Redux are doing - which is tracking UI State in the store state container.

## Concepts

>Reusability of State Graphs & Sub State Graphs

When state graphs are created, it should be created with reusability in mind. For instance, a state graph can be reduced into 2 or more sub state graphs.

>Isolating State Containers From Most UI Updates

UI state is never meant to be tracked or persisted in a state container. UI state is only useful immediately beofre it causes a view re-render or view layer update. After that, it is no longer useful.

>UI State Changes Should Trigger View Layer Changes

UI state changes (driven by state graphs) will mostly trigger view updates except when the state is going back to the `$initial` state. In other words, state graphs are supposed to always be unidirectional graphs which circle back to the `$initial` state.

## Getting Started

> filename:FormBox.js
```js

import ahtox from 'ahtox';

let stateGraph = {
	$initial: 'empty',
	states: {
		'empty': {
			keys: {
				nextState: 'filling'
			}
		},
		'filling': {
			'mouse-over-button': {
				nextState: 'filled'
			},
			'tab-into-button': {
				nextState: 'filled'
			}
		},
		'filled': {
			'click-button': {
				nextState: 'empty'
			}
		}
	}
};

class FormBox extends React.Component {
   constructor(prop){
	super(props);
	this.modeGrapher = kahtox.makeModeGrapher(stateGraph)
	this.state = {
		mode: this.modeGrapher.initial,
		parentMode: this.props.mode
	}
	
	this.formInputs = {};
	
	this.modeGrapher.afterTransition((mode) => this.setState({ mode }))
   }
   
   componentDidMount(){
   	;
   }
   
   onInputChange(e){
   	this.formInputs[e.traget.name] = e.target.value;
   }
   
   render(){
   	const mode = this.state.mode;
	const parentMode = this.props.mode;
	const children = this.props.children;
	
	let addListeners = false;
	
	if(parentMode == 'idle')
		addListeners = true;
	
	{/* https://mxstbr.blog/2017/02/react-children-deepdive/ */}
	{(mode === 'empty') && React.Children.map(children, (child, i) => {
		this.formInputs[child.name] = child.value
		return React.cloneElement(child, {
		      onChange: this.onInputChange
	    	})
	})}
   }
}

```

> filename: Todos.js
```js
import ahtox from 'ahtox';
import { createStore, applyMiddleware } from 'redux';

let stateGraph = {
   $initial: 'idle',
   states:{
	   'idle': {
		send:{ // HTTP POST, PUT, PATCH, DELETE
			nextState: 'before-send'
		},
		fetch:{ // HTTP GET, HEAD
			nextState: 'before-fetch'
		}
	   },

	   'before-fetch': {
		httpreq: { 
			nextState:'fetching'
		}
	   },

	   'before-send': {
		httpreq: {
			nextState:'sending'
		}
	   },

	   'fetching':{
		success:{
			nextState: 'idle'
		},
		failure:{
			nextState: 'idle'
		}
	   },

	   'sending': {
	       success:{
			nextState: 'idle'
		},
		failure:{
			nextState: 'idle'
		}
	   }
   }
};


let store = createStore(function todos(state = [], action) {
  switch (action.type) {
    case 'LOAD_TODO':
      return state.concat(action.todos);
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}, []);

class Todos extends React.Component {
   constructor(prop){
	super(props);
	this.modeGrapher = kahtox.makeModeGrapher(stateGraph, (actionType, payload) => store.dispatch({ type:actionType, payload }))
	this.state = {
 		mode: modeGrapher.initial,
		parentMode: null
	};
	
	this.todos = props.todos;
	
	this.modeGrapher.afterTransition(mode => this.setState({ mode }))
   }

   componentDidMount(){
   	const actionType = 'loadTodos';
	this.modeGrapher.dispatch(actionType, { all:true });
   }
   
   submitDataToServer(formData){
   	const actionType = 'addTodos'
   	this.modeGrapher.dispatch(actionType, { url: '', method: 'POST', data:formData });
   }

   render(){
	const mode = this.state.mode;

	return (
		{(mode === 'idle') && <FormBox method="POST" mode={mode} handleSubmit={this.submitDataToServer.bind(this)}>
		   <Input readonly=false name="todoTitle" value="" />
		   <Input readonly=false name="todoDesc" value="" />
		   <Input readonly=false type="checkbox" name="todoComplete" value="" />
		   <Button disabled=false text="ADD" />
		</FormBox> }
		{(mode === 'before-send') && <FormBox method="POST" mode={mode} handleSubmit={this.submitDataToServer.bind(this)}>
		   <Input readonly=false name="todoTitle" value="" />
		   <Input readonly=false name="todoDesc" value="" />
		   <Input readonly=false type="checkbox" name="todoComplete" value="" />
		   <Button disabled=true text="ADD" /> {/* Disable the button so submit event can't be triggere again */}
		</FormBox> }
		{(mode === 'sending') && <FormBox method="POST" mode={mode}>
		   <Input readonly=true /> 
		   <Input readonly=true /> 
		   <Input readonly=true /> 
		   <Button disabled=true text="ADD" /> {/* Disable the entire form */}
		</FormBox> }
	)
   }
}
```

## License

MIT

## Contributing
