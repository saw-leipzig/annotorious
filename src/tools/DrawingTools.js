import EventEmitter from 'tiny-emitter';
import RubberbandRectTool from './rectangle/RubberbandRectTool';
import RubberbandPolygonTool from './polygon/RubberbandPolygonTool';

/** The drawing tool 'registry' **/
class DrawingToolRegistry extends EventEmitter {

  constructor(g) {
    super();

    // SVG annotation layer group
    this._g = g;

    // Registered tool implementations
    this._registered = {};

    // Current drawing tool
    this._current = null;

    this.setDefaults();
  }
  getToolName(){
    if (this._current===null){
      return ""
    }
    else if (this._current instanceof RubberbandPolygonTool) {
      return "polygon"
    }
    else if (this._current instanceof RubberbandRectTool) {
      return "rect"
    }
    else{return "error"}
  }
  setDefaults() {
    this.registerTool('rect', RubberbandRectTool);
    this.registerTool('polygon', RubberbandPolygonTool);
    this.setCurrent('rect');
  }
  undo = () =>{
    if (this._current.rubberband){
      this._current.rubberband.undo();

    }
    //console.log(this);
  }
  registerTool = (id, impl) => {
    this._registered[id] = impl;
  }

  /**
   * Sets a drawing tool by providing an implementation, or the ID
   * of a built-in toll.
   */
  setCurrent = toolOrId => {
    if (typeof toolOrId === 'string' || toolOrId instanceof String) {
      const Tool = this._registered[toolOrId];
      if (Tool) {
        this._current = new Tool(this._g);
        this._current.on('complete', evt => this.emit('complete', evt));
        this._current.on('cancel', evt => this.emit('cancel', evt));
      }
    } else {
      this._current = toolOrId;
    }
  }

  /** TODO inefficient - maybe organize this in a different way **/
  forShape = svgShape => {
    const inner = svgShape.querySelector('.inner');
    const Tool = this._registered[inner.nodeName];
    return Tool ? new Tool(this._g) : null;
  }

  get current() {
    return this._current;
  }

}

export default DrawingToolRegistry;
