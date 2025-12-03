'use client'
import { useEffect,useRef, useState } from "react"
import {Game} from '@/draw/game';
import {IconButton} from '@/components/IconButton'
import { Circle, Pencil, RectangleHorizontal } from "lucide-react";

export type Tool='circle'|'rect'|'pencil'|'brush'



export function Canvas({
roomId,socket
}:{roomId:string,socket:WebSocket}){
const canvasRef=useRef<HTMLCanvasElement>(null)
const [game,setGame]=useState<Game>()
const [selectedTool,setSelectedTool]=useState<Tool>('circle')
const [selectcolor,setSelectedColor]=useState<string>('#ffffff')

useEffect(()=>{
    game?.setTool(selectedTool)
    game?.setSelectedColor(selectcolor)
},[selectedTool,game,selectcolor])

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
    <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} setSelectedColor={setSelectedColor}selectcolor={selectcolor}/>
</div>
}
function Topbar( {setSelectedTool,selectedTool,setSelectedColor,selectcolor}:{setSelectedTool:(s:Tool)=>void,selectedTool:Tool,selectcolor:string,setSelectedColor:(s:string)=>void}){
    return(<div className="fixed top-3 left-1/2">
        <div className=" flex gap-4"> 

            <IconButton  onClick={()=>{setSelectedTool("brush")}} activated={selectedTool==='brush'} icon={<Pencil/>}/>
            <IconButton  onClick={()=>{setSelectedTool("rect")}} activated={selectedTool==='rect'} icon={<RectangleHorizontal/>}/>
            <IconButton  onClick={()=>{setSelectedTool("circle")}} activated={selectedTool==='circle'} icon={<Circle/>}/>
            <div className="rounded-full w-15 h-15 flex justify-center items-center bg-zinc-900 overflow-hidden p-2">
                <input type="color"  value={selectcolor} className={`  rounded-full w-full h-full bg-[#ffffff]  outline-none `}onChange={(e)=>setSelectedColor(e.target.value)}/>
            </div>
            

        </div>

    </div>)
}