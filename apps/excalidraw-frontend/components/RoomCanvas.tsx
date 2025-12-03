'use client'
import { useEffect, useState } from "react"
import {Canvas} from "./Canvas"
import { BACKEND_WS_URL } from "@/config"

export function RoomCanvas({roomId,token}:{token:string,roomId:string}){
    const [socket,setSocket]=useState<WebSocket|null>(null)
    

useEffect(()=>{
    const ws =new WebSocket(`${BACKEND_WS_URL}?token=${token}`)

    ws.onopen=()=>{
        setSocket(ws)
        const data=JSON.stringify({
            type:"join_room",
            roomId
        });
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
    <Canvas roomId={roomId} socket ={socket} />
</div>
}