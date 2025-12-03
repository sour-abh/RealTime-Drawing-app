import { BACKEND_HTTP_URL } from "@/config";
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

const getBearing = (origin: [number, number], destination: [number, number]) =>
  (Math.atan2(destination[1] - origin[1], destination[0] - origin[0]) -
    Math.PI / 2) %
  (Math.PI * 2);

const angleDiff = (angleA: number, angleB: number) => {
  const twoPi = Math.PI * 2;
  const diff =
    ((angleA - (angleB > 0 ? angleB : angleB + twoPi) + Math.PI) % twoPi) -
    Math.PI;
  return diff < -Math.PI ? diff + twoPi : diff;
};

const getNewAngle = (
  origin: [number, number],
  destination: [number, number],
  oldAngle?: number
) => {
  const bearing = getBearing(origin, destination);
  if (typeof oldAngle === "undefined") {
    return bearing;
  }
  return oldAngle - angleDiff(oldAngle, bearing);
};
export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  let existingShapes: Shape[] = await getExistingShapes(roomId);

  if (!ctx) {
    return;
  }
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);
  let clicked = false;
  let startX = 0;
  let startY = 0;
  let currentAngle: number | undefined;
  let latestPoint: [number, number] | null = null;

  // points captured for the current stroke (with angles)
  let currentStrokePoints: StrokePoint[] = [];

  // current brush config for stroke
  let currentBrush: BrushBristle[] = [];
  const strokeWidth = 20;
  //@ts-ignorex
  const selectedColor = String(window.selectedColor);
  const makeBrush = (size: number, baseColor: string) => {
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
  const rotatePoint = (distance:number, angle:number, origin:number[]) => [
    origin[0] + distance * Math.cos(angle),
    origin[1] + distance * Math.sin(angle)
];
  const strokeBristle = (ctx:CanvasRenderingContext2D,origin:number[], destination:number[], bristle:BrushBristle, controlPoint:number[]) => {
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
const drawStroke = (bristles:BrushBristle[], origin:number[], destination:number[], oldAngle:number, newAngle:number) => {
    bristles.forEach(bristle => {
        ctx.beginPath();
        let bristleOrigin = rotatePoint(
            bristle.distance - strokeWidth / 2,
            oldAngle,
            origin
        );

        let bristleDestination = rotatePoint(
            bristle.distance - strokeWidth / 2,
            newAngle,
            destination
        );
        const controlPoint = rotatePoint(
            bristle.distance - strokeWidth / 2,
            newAngle,
            origin
        );
        bristleDestination = rotatePoint(
            bristle.distance - strokeWidth / 2,
            newAngle,
            destination
        );
        strokeBristle(ctx,bristleOrigin, bristleDestination, bristle, controlPoint);
    });
};
const continueStroke = (newPoint:[x:number,y:number]) => {
    if (!latestPoint) return;
    const newAngle = getNewAngle(latestPoint, newPoint, currentAngle);
    if(!currentAngle){return}
    drawStroke(currentBrush, latestPoint, newPoint, currentAngle, newAngle);
    currentAngle = newAngle % (Math.PI * 2);
    latestPoint = newPoint;
};

canvas.addEventListener("mousedown", (e) => {
    ((clicked = true),
      (startX = e.clientX),
      (startY = e.clientY),
      (currentAngle = undefined));
    latestPoint = [e.clientX, e.clientY];
    currentStrokePoints = [];
    // @ts-ignore
    const baseColor: string = window.selectedColor ?? "#000000";
    currentBrush = makeBrush(strokeWidth, baseColor);
    const initNewAngle = getNewAngle( latestPoint,latestPoint, undefined);
    currentStrokePoints.push({
      x: latestPoint[0],
      y: latestPoint[1],
      oldAngle: null,
      newAngle: initNewAngle,
    });

    // set currentAngle for next moves
    currentAngle = initNewAngle;
  });
  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    //@ts-ignore
    const selectedTool = window.selectedTool;
    //@ts-ignore
    
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        height,
        width,
        color: selectedColor,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        centerX: startX + radius,
        centerY: startY + radius,
        radius,
        color: selectedColor,
      };
    } else if (selectedTool === "brush") {
      const baseColor = selectedColor;

      //rebuilding brushes

       shape = {
      type: "brush",
      baseColor,
      strokeWidth,
      brush: currentBrush,
      points: currentStrokePoints,
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
      createdAt: Date.now(),
    };
  }

  // reset stroke memory
  currentStrokePoints = [];
  currentBrush = [];
    if (!shape) {
      return;
    }
    existingShapes.push(shape);
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId,
      })
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) {
      return;
    }
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255,255,255)";
      //@ts-ignore
      const selectedTool = window.selectedTool;
      if (selectedTool === "rect") {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = startX + radius;
        const centerY = startY + radius;
        ctx.beginPath();

        ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      } else if (selectedTool === "brush") {
        const newPoint: [number, number] = [e.clientX, e.clientY];
        const newAngle = getNewAngle(
          latestPoint as [number, number],
          newPoint,
          currentAngle
        );
        currentStrokePoints.push({
          x: newPoint[0],
          y: newPoint[1],
          oldAngle: currentAngle ?? null,
          newAngle: newAngle,
        });
        currentAngle = newAngle % (Math.PI * 2);
        latestPoint = newPoint;

        continueStroke([e.offsetX, e.offsetY]);


      }
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(51,50,50)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.map((shape) => {
    if (shape.type === "rect") {
      ctx.strokeStyle = "rgba(67,145,107)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(67,145,107)";
      ctx.arc(
        shape.centerX,
        shape.centerY,
        Math.abs(shape.radius),
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.closePath();
    }
  });
}
