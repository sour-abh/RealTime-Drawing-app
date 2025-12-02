import { useEffect, useState } from "react"
import {Canvas} from "./Canvas"

export function RoomCanvas({roomId}:{roomId:string}){
    const [socket,setSocket]=useState<WebSocket|null>(null)

useEffect(()=>{
 
},[])

if(!socket){
    return <div>
        Connecting to the server
    </div>
}
return <div>
    <Canvas roomId={roomId} socket ={socket}/>
</div>
}