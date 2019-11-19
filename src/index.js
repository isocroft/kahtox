/**!
@version: 0.1.1
@created: 18th Nov, 2019
*/

const isLiteralFalsey = (variable) => {
    return (variable === "" || variable === false || variable === 0)
}

const checkTypeName = (target, type) => {
    let typeName = ""
    if(isLiteralFalsey(target)){
        typeName = (typeof target)
    }else{
        typeName = ("" + (target && target.constructor.name))
    }
    return !!(typeName.toLowerCase().indexOf(type) + 1)
}

const strictTypeOf = (value, type) => {
    let result = false

    type = type || []

    if(typeof type === 'object'){

        if(typeof type.length !== 'number'){
            return result
        }

        let bitPiece = 0
        type = [].slice.call(type)

        type.forEach( _type => {
            if(typeof _type === 'function'){
                _type = (_type.name || _type.displayName).toLowerCase()
            }
            bitPiece |= (1 * (checkTypeName(value, _type)))
        })

        result = !!(bitPiece)
    }else{
        if(typeof type === 'function'){
            type = (type.name || type.displayName).toLowerCase()
        }

        result = checkTypeName(value, type)
    }

    return result
};

const isFunction = (value) => {
    return strictTypeOf(value, 'function')
}

const isError = (value) => {
    return strictTypeOf(value, 'error')
}

const isString = (value) => {
    return strictTypeOf(value, 'string')
}

const isPlainObject = (value) => {
    return strictTypeOf(value, 'object')
}

const isNull = (value) => {
    return strictTypeOf(value, 'null')
}

const isUndefined = (value) => {
    return strictTypeOf(value, 'undefined')
}

class Grapher {
  constructor(graph, wrapperFn){
    this.states = graph.states;
    this.initial = this.currentState = graph.$initial;
    this.domainStateLayerWrapperFn = wrapperFn;
    this.transitionHandler = null;
  }
  
  dispatch(transitionEventName = '', domainLayerData = null){
    const grapherEvents = this.states[this.currentState] || {}; // grab all possible actions under this 'current state'
    const transitionMeta = grapherEvents[transitionEventName]; // grab the data state layer action we are interested in for this current 'dispatch'
    const hasAction = isString(transitionMeta.action);
      
    let nextState = (state) => { 
        this.currentState = state; 
        let canNotify = (this.currentState !== this.initial);
        canNotify |= Boolean(transitionMeta.notifyView);
        if(isFunction(this.transitionHandler)) {
            if(Boolean(canNotify)){
                this.transitionHandler(state, (hasAction ? null : domainLayerData)); 
            }
        }
    };

    if ((!isNull(transitionMeta) || !isUndefined(transitionMeta)) 
          && isPlainObject(transitionMeta)) { 
      if(!isFunction(transitionMeta.guard) || (transitionMeta.guard({ payload: domainLayerData }) === true)){
           nextState(transitionMeta.nextState); // change the state - new current state
      }
      if(hasAction) {
        this.domainStateLayerWrapperFn(transitionMeta.action, { payload: domainLayerData, grapher: this, meta: transitionMeta });
      }
    }
  }
  
  afterTransition(callback){
      this.transitionHandler = callback
  }
}

const kahtox = {
      makeGrapher(graph, wrapperFn){
          if(!isFunction(wrapperFn)){
            wrapperFn = () => true
          }
          return new Grapher(graph, wrapperFn);
      }
};

export default kahtox;
