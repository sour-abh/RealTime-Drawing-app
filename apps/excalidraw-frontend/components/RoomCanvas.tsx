'use client'
import { useEffect, useState } from "react"
import {Canvas} from "./Canvas"
import { BACKEND_WS_URL } from "@/config"

export function RoomCanvas({roomId}:{roomId:string}){
    const [socket,setSocket]=useState<WebSocket|null>(null)

useEffect(()=>{
    const ws =new WebSocket(`${BACKEND_WS_URL}`)
    ws.onopen=()=>{
        setSocket(ws)
        const data=JSON.stringify({
            type:"join_room",
            roomId
        });
        console.log(data)
        ws.send(data)
    }
},[])

if(!socket){
    return(
     <div>
        Connecting to the server
    </div>)
}
return <div>
    <Canvas roomId={roomId} socket ={socket}/>
</div>
}