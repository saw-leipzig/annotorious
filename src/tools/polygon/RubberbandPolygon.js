import { Selection } from '@recogito/recogito-client-core';
import { toSVGTarget } from '../../annotations/selectors/EmbeddedSVG';
import { SVG_NAMESPACE } from '../../SVGConst';

export default class RubberbandPolygon {

  constructor(anchor, g) {
    this.g = document.createElementNS(SVG_NAMESPACE, 'g');
    this.g.setAttribute('class', 'a9s-selection');

    this.outer = document.createElementNS(SVG_NAMESPACE, 'path');
    this.outer.setAttribute('class', 'outer');
    //this.outer.setAttribute('stroke', '#f00');
//    this.outer.setAttribute('fill', '#017D41');
//    this.outer.setAttribute('fill-opacity','0.4');
//    this.outer.setAttribute('stroke','3');

    this.inner = document.createElementNS(SVG_NAMESPACE, 'path');
//    this.outer.setAttribute('fill', '#017D41');
//    this.outer.setAttribute('fill-opacity','0.4');
//    this.outer.setAttribute('stroke','3');
    //this.inner.setAttribute('stroke-linejoin','arcs');
    this.inner.setAttribute('class', 'inner');
    //this.outer.setAttribute('stroke', '#f00');
    //this.outer.setAttribute('stroke-width', '3');

    this.points = [];
    this.points.push([ anchor, anchor ])
    console.log("points initiated:", this.points);
    this.setPoints(this.points);

    this.g.appendChild(this.outer);
    this.g.appendChild(this.inner);

    this.isCollapsed = true;

    g.appendChild(this.g);
  }

  setPoints = points => {

    var attr ="";
    for (var ps of points){
      var attr2=""
      if (ps.length>0){
        for (var p of ps) {
          console.log("p",p);
          if (p){
            if (attr2===""){
              attr2  +=`M${p[0]},${p[1]}`;
            }
            else{
              attr2  +=` L${p[0]},${p[1]}`;
            }
          }

         };
         attr+=attr2
      }
    }
    attr+=" Z"

    this.outer.setAttribute('d', attr);
    this.inner.setAttribute('d', attr);
  }

  dragTo = xy => {
    this.isCollapsed = false;
    const head = this.points[this.points.length - 1].slice(0, this.points[this.points.length - 1].length - 1);
    var headRest=this.points.slice(0,-1)
    const rubberband = [ ...head, xy, head[0] ];
    headRest.push(rubberband)
    this.setPoints(headRest);
  }

  addPoint = xy => {
    console.log("Entering addpoint", this.points[this.points.length - 1].length);
    if (this.points[this.points.length - 1].length>0){
      const head = this.points[this.points.length - 1].slice(0, this.points[this.points.length - 1].length - 1);
      const lastCorner = head[head.length - 1];
      const dist = Math.pow(xy[0] - lastCorner[0], 2) + Math.pow(xy[1] - lastCorner[1], 2);
      if (dist > 4) {
        this.points[this.points.length - 1] = [ ...head, xy, head[0] ];
        this.setPoints(this.points);
      }
    }
    else{
      this.points[this.points.length - 1] = [xy,xy];
      console.log(this.points[this.points.length - 1]);
      this.setPoints(this.points);
    }
    // Don't add a new point if distance < 2 pixels
  }

  undo = () => {
    if (this.points[this.points.length - 1].length>2){
      this.points[this.points.length - 1].pop();
    }
  }
  newPart = () => {
    console.log("NewPart triggered");
    this.points.push([]);
    console.log("points after newPart: ", this.points);
  }


  destroy = () => {
    this.g.parentNode.removeChild(this.g);
    this.g = null;
  }

  toSelection = () => {
    return new Selection(toSVGTarget(this.g));
  }

}
