import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { ReactEventHandler } from "react";


type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
export class Game{
    private canvas:HTMLCanvasElement
    private ctx:CanvasRenderingContext2D
    private existingShapes:Shape[];
    private roomId:string;
    private clicked:boolean;
    private startX:number=0;
    private startY:number=0;
    private selectedTool:Tool="circle";
    socket:WebSocket


    constructor(canvas:HTMLCanvasElement,roomId:string,socket:WebSocket){
        this.canvas=canvas;
        this.ctx=canvas.getContext('2d')!;
        this.existingShapes=[];
        this.roomId=roomId;
        this.clicked=false;
        this.socket=socket;
        this.init()
        this.initHandlers()
        this.initMousehandlers()

    }
    destroy(){
        this.canvas.removeEventListener("mousedown",this.mouseDownHandler)
        this.canvas.removeEventListener("mouseup",this.mouseUpHandler)
        this.canvas.removeEventListener("mousemove",this.mouseMoveHandler)
    }
    setTool(tool:'circle'|'pencil'|'rect'){
        this.selectedTool=tool
    }
    async init(){
        this.existingShapes=await getExistingShapes(this.roomId)
        console.log(this.existingShapes)
        this.clearCanvas()
    }

    initHandlers(){
        this.socket.onmessage=(event)=>{
            const message=JSON.parse(event.data)
            if(message.type=="chat"){
                const parsedShape=JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas()
            }
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        this.ctx.fillStyle="rgba(67,60,60)"
        this.ctx.fillRect(0,0,this.canvas.width ,this.canvas.height
        )
        this.existingShapes.map((shape)=>{
            if(shape.type==='rect'){
                this.ctx.strokeStyle="rgba(67,145,107)";
                this.ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
            }else if(shape.type==='circle'){
                console.log(shape)
                this.ctx.beginPath()
                 this.ctx.strokeStyle="rgba(67,145,107)";
                this.ctx.arc(shape.centerX,shape.centerY,shape.radius,0,Math.PI*2)
                this.ctx.stroke()
                this.ctx.closePath()
            }
        })
    }

    mouseDownHandler=(e:MouseEvent)=>{
        this.clicked=true
        this.startX=e.clientX
        this.startY=e.clientY
    }
    mouseUpHandler=(e:MouseEvent)=>{
        this.clicked=false
        const width=e.clientX-this.startX
        const height=e.clientY-this.startY

        const selectedTool=this.selectedTool
        let shape:Shape|null=null
        if(selectedTool==='rect'){
            shape={
                type:'rect',
                x:this.startX,
                y:this.startY,
                width,height
            }
        }
        else if(selectedTool=='circle'){
            const radius=Math.max(width,height)/2
            shape={
                type:'circle',
                radius,
                centerX:this.startX+radius,
                centerY:this.startY+radius,


            }
        }
        if(!shape){
            return
        }
        this.existingShapes.push(shape)
        this.socket.send(JSON.stringify({
            type:"chat",
            message:JSON.stringify({shape}),
            roomId:this.roomId
        }))
    }
    mouseMoveHandler=(e:MouseEvent)=>{
        if(this.clicked){
            const width=e.clientX-this.startX;
            const height=e.clientY-this.startY;
            this.clearCanvas()
            this.ctx.strokeStyle="rgba(255,255,255)"
            const selectedTool=this.selectedTool
            console.log(selectedTool)
            if(selectedTool==='rect'){
                this.ctx.strokeRect(this.startX,this.startY,width,height)
            } else if(selectedTool==='circle'){
                const radius=Math.max(width,height)/2
                const centerX=this.startX+radius
                const centerY=this.startY+radius
                this.ctx.beginPath()
                this.ctx.strokeStyle='rgba(67,145,107)'
                this.ctx.arc(centerX,centerY,radius,0,Math.PI*2);
                this.ctx.stroke()
                this.ctx.closePath()
            }
        }
    }

    initMousehandlers(){
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler) 

    }

}