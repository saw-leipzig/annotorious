import EventEmitter from 'tiny-emitter';
import RubberbandRect from './RubberbandRect';
import EditableRect from './EditableRect';

/**
 * A rubberband selector for rectangle fragments.
 */
export default class RubberbandRectTool extends EventEmitter {

  constructor(g) {
    super();

    this.svg = g.closest('svg');
    this.g = g;

    this.rubberband = null;
  }
  undo(){}
  _attachListeners = () => {
    this.svg.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  _detachListeners = () => {
    this.svg.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  _toSVG = (x, y) => {
    const pt = this.svg.createSVGPoint();

    const { left, top } = this.svg.getBoundingClientRect();
    pt.x = x + left;
    pt.y = y + top;

    return pt.matrixTransform(this.g.getScreenCTM().inverse());
  }

  startDrawing = evt => {
    const { x, y } = this._toSVG(evt.layerX, evt.layerY);
    this._attachListeners();
    this.rubberband = new RubberbandRect(x, y, this.g);
  }

  stop = () => {
    if (this.rubberband) {
      this.rubberband.destroy();
      this.rubberband = null;
    }
  }

  onMouseMove = evt => {
    const { x , y } = this._toSVG(evt.layerX, evt.layerY);
    this.rubberband.dragTo(x, y);
  }

  onMouseUp = evt => {
    this._detachListeners();

    const { w } = this.rubberband.bbox;

    if (w > 3) {
      // Emit the SVG shape with selection attached
      const shape = this.rubberband.shape;
      shape.annotation = this.rubberband.toSelection();
      this.emit('complete', shape);
    } else {
      this.emit('cancel', evt);
      this.stop();
    }
  }

  createEditableShape = annotation =>
    new EditableRect(annotation, this.g);

  get isDrawing() {
    return this.rubberband != null;
  }

  get supportsModify() {
    return true;
  }

}
