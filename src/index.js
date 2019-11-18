/**!
@version: 0.1.1
@created: 18th Nov, 2019
*/


class Grapher {
  constructor(garph, wrapperFn){
    this.states = graph.states;
    this.initial = this.currentState = graph.$initial;
    this.domainStateLayerWrapperFn = wrapperFn;
    this.transitionHandler = null;
  }
  
  dispatch(transitionEventName = '', domainLayerPayload = null, notifyView = true){
    const grapherEvents = this.states[this.currentState]; // grab all possible actions under this 'current state'
    const transitionMeta = grapherEvents[transitionEventName]; // grab the data state layer action we are interested in for this current 'dispatch'

    let nextState = (state) => { 
        this.currentState = state; 
        if(typeof this.transitionHandler === 'function') {
            this.transitionHandler.call(state); 
        }
    }

    if (transitionMeta.action) { 
      if(typeof transitionMeta.guard !== 'function' || transitionMeta.guard(domainLayerPayload)){
          nextState(transitionMeta.nextState); // change the state - new current state
      }
      this.domainStateLayerWrapperFn(action, payload, { grapher: this, meta: transitionMeta });
    }
  }
  
  afterTransition(callback){
      this.transitionHandler = callback
  }
}

const khatox = {
      makeGrapher(graph, wrapperFn){
          if(typeof wrapperFn !== 'function'){
            wrapperFn = () => true
          }
          
          return new Grapher(grapper, wrapperFn);
      }
};

export default kahtox;
