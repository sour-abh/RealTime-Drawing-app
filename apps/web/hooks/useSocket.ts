'use client'
import { useState ,useEffect} from "react";
import { BACKEND_WS_URL } from "../config";

export function useSocket(){

    const [loading,setLoading]=useState(true);
    const [socket,setSocket]=useState<WebSocket>();
    useEffect(()=>{
        const ws =new WebSocket(BACKEND_WS_URL);
        ws.onopen=()=>{
            setLoading(false)
            setSocket(ws)
        }

    },[])
    return {socket ,loading}
}


