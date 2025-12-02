'use client'
import { useEffect,useRef, useState } from "react"
import {initDraw} from '@/draw/index';
import {Game} from '@/draw/game';
import {IconButton} from '@/components/IconButton'
import { Circle, Pencil, RectangleHorizontal } from "lucide-react";

export type Tool='circle'|'rect'|'pencil'


export function Canvas({
roomId,socket
}:{roomId:string,socket:WebSocket}){
const canvasRef=useRef<HTMLCanvasElement>(null)
const [game,setGame]=useState<Game>()
const [selectedTool,setSelectedTool]=useState<Tool>('circle')

useEffect(()=>{
    game?.setTool(selectedTool)
},[selectedTool,game])

useEffect(()=>{
    if(canvasRef.current){
        const g = new Game(canvasRef.current,roomId,socket)   ;
        setGame(g) 
        return ()=>{
            g.destroy()
        }
    }
},[canvasRef])

return <div className="h-full overflow-hidden">
    <canvas ref={canvasRef} width={window.innerWidth } height={window.innerHeight}></canvas>
    <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool}/>
</div>
}
function Topbar( {setSelectedTool,selectedTool}:{setSelectedTool:(s:Tool)=>void,selectedTool:Tool}){
    return(<div className="fixed top-3 left-1/2">
        <div className=" flex gap-4"> 

            <IconButton  onClick={()=>{setSelectedTool("pencil")}} activated={selectedTool==='pencil'} icon={<Pencil/>}/>
            <IconButton  onClick={()=>{setSelectedTool("rect")}} activated={selectedTool==='rect'} icon={<RectangleHorizontal/>}/>
            <IconButton  onClick={()=>{setSelectedTool("circle")}} activated={selectedTool==='circle'} icon={<Circle/>}/>

        </div>

    </div>)
}