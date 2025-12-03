import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }
  | {
      type: "pencil";
      x: number;
      y: number;
      endX: number;
      endY: number;
      color: string;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color: string;
    }
  | BrushShape;

type StrokePoint = {
  x: number;
  y: number;
  oldAngle: number | null;
  newAngle: number;
};

type BrushBristle = {
  distance: number;
  thickness: number;
  colour: string;
};

type BrushShape = {
  type: "brush";
  baseColor: string;
  strokeWidth: number;
  brush: BrushBristle[];
  points: StrokePoint[];
  id: string;
  createdAt: number;
};
export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX: number = 0;
  private startY: number = 0;
  private selectedTool: Tool = "circle";
  private selectColor: string = "#ffffff";
  private currentAngle: number | undefined;
  private latestPoint: [number, number] | null = null;

  // points captured for the current stroke (with angles)
  private currentStrokePoints: StrokePoint[] ;

  // current brush config for stroke
  private currentBrush: BrushBristle[];
  private strokeWidth: number = 20;
  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.clicked = false;
    this.socket = socket;
    this.currentBrush=[];
    this.strokeWidth=20;
    this.currentStrokePoints=[]
    this.init();
    this.initHandlers();
    this.initMousehandlers();
  }
  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }
  setTool(tool: "circle" | "pencil" | "rect" | "brush") {
    this.selectedTool = tool;
  }
  setSelectedColor(x: string) {
    this.selectColor = x;
  }
  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    console.log(this.existingShapes);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  getBearing = (origin: [number, number], destination: [number, number]) =>
    (Math.atan2(destination[1] - origin[1], destination[0] - origin[0]) -
      Math.PI / 2) %
    (Math.PI * 2);

  angleDiff = (angleA: number, angleB: number) => {
    const twoPi = Math.PI * 2;
    const diff =
      ((angleA - (angleB > 0 ? angleB : angleB + twoPi) + Math.PI) % twoPi) -
      Math.PI;
    return diff < -Math.PI ? diff + twoPi : diff;
  };

  getNewAngle = (
    origin: [number, number],
    destination: [number, number],
    oldAngle?: number
  ) => {
    const bearing = this.getBearing(origin, destination);
    if (typeof oldAngle === "undefined") {
      return bearing;
    }
    return oldAngle - this.angleDiff(oldAngle, bearing);
  };
    makeBrush = (size: number, baseColor: string) => {
    const brush: BrushBristle[] = [];
    let bristleCount = Math.round(size / 3);
    const gap = size / bristleCount;
    for (let i = 0; i < bristleCount; i++) {
      const distance =
        i === 0 ? 0 : gap * i + (Math.random() * gap) / 2 - gap / 2;
      brush.push({
        distance,
        thickness: Math.random() * 2 + 2,
        colour: baseColor,
      });
    }
    return brush;
  };
  rotatePoint = (distance:number, angle:number, origin:number[]) => [
    origin[0] + distance * Math.cos(angle),
    origin[1] + distance * Math.sin(angle)
];
  strokeBristle = (ctx:CanvasRenderingContext2D,origin:number[], destination:number[], bristle:BrushBristle, controlPoint:number[]) => {
    ctx.beginPath();
    ctx.moveTo(origin[0], origin[1]);
    ctx.strokeStyle = bristle.colour;
    ctx.lineWidth = bristle.thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = bristle.colour;
    ctx.shadowBlur = bristle.thickness / 2;
    ctx.quadraticCurveTo(
        controlPoint[0],
        controlPoint[1],
        destination[0],
        destination[1]
    );
    ctx.lineTo(destination[0], destination[1]);
    ctx.stroke();
};
drawStroke = (bristles:BrushBristle[], origin:number[], destination:number[], oldAngle:number, newAngle:number) => {
    
    bristles.forEach(bristle => {
        this.ctx.beginPath();
        let bristleOrigin = this.rotatePoint(
            bristle.distance - this.strokeWidth / 2,
            oldAngle,
            origin
        );

        let bristleDestination = this.rotatePoint(
            bristle.distance - this.strokeWidth / 2,
            newAngle,
            destination
        );
        const controlPoint = this.rotatePoint(
            bristle.distance - this.strokeWidth / 2,
            newAngle,
            origin
        );
        bristleDestination = this.rotatePoint(
            bristle.distance - this.strokeWidth / 2,
            newAngle,
            destination
        );
        this.strokeBristle(this.ctx,bristleOrigin, bristleDestination, bristle, controlPoint);
    });
};
continueStroke = (newPoint:[x:number,y:number]) => {
    
    if (!this.latestPoint) return;
    const newAngle =this. getNewAngle(this.latestPoint, newPoint, this.currentAngle);
    if(!this.currentAngle){return}
    this.drawStroke(this.currentBrush, this.latestPoint, newPoint, this.currentAngle, newAngle);
    this.currentAngle = newAngle % (Math.PI * 2);
    this.latestPoint = newPoint;
};
redrawStroke(shape:BrushShape){
    const {brush,points}=shape;
    
    if(points.length<2){
        return
    }
    for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i]
    this.drawStroke(
    
      brush,
      [prev.x, prev.y],
      [curr.x, curr.y],
      prev.newAngle,
      curr.newAngle,
    
    );
}}
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(51,50,50)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShapes.map((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeStyle = shape.color;
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        console.log(shape);
        this.ctx.beginPath();
        this.ctx.strokeStyle = shape.color;
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "brush") {
        
            this.redrawStroke(shape)
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.currentAngle=undefined;
    this.latestPoint=[e.clientX,e.clientY]
    this.currentStrokePoints=[];
    const baseColor=this.selectColor;
    this.currentBrush=this.makeBrush(this.strokeWidth,baseColor)
    const initNewAngle=this.getNewAngle(this.latestPoint,this.latestPoint,undefined)
    this.currentStrokePoints.push({
        x:this.latestPoint[0],
        y:this.latestPoint[1],
        oldAngle:null,
        newAngle:initNewAngle
    })
    this.currentAngle=initNewAngle
  };
  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;
    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
        color: this.selectColor,
      };
    } else if (selectedTool == "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        color: this.selectColor,
      };
    }else if (selectedTool==='brush'){
        const baseColor=this.selectColor

     shape = {
      type: "brush",
      baseColor,
      strokeWidth:this.strokeWidth,
      brush: this.currentBrush,
      points: this.currentStrokePoints,
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
      createdAt: Date.now(),
    };
  }

  // reset stroke memory
  this.currentStrokePoints = [];
  this.currentBrush = [];
    if (!shape) {
      return;
    }
    this.existingShapes.push(shape);
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  };
  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255,255,255)";
      const selectedTool = this.selectedTool;
      console.log(selectedTool);
      if (selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.selectColor;
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }
      else if(this.selectedTool==='brush'){
        const newPoint:[number,number]=[e.clientX,e.clientY];
        const newAngle=this.getNewAngle(this.latestPoint as [number,number],newPoint,this.currentAngle)
        this.currentStrokePoints.push({
            x:newPoint[0],
            y:newPoint[1],
            oldAngle:this.currentAngle?? null,
            newAngle:newAngle
        })
        this.currentAngle = newAngle % (Math.PI * 2);
        this.latestPoint = newPoint;

        this.continueStroke([e.offsetX, e.offsetY]);

      }

    }
  };

  initMousehandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
