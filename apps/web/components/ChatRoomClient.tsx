"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket"

export function ChatRoomClient({messages,id}:{messages:{message:string}[],id:string}){
    const [/*chats*/,setChats]=useState(messages)
    const[currentMessage,setCurrentMessage]=useState<string>('')

const {socket,loading}=useSocket();
useEffect(()=>{
    if(socket && !loading){
        socket.send(JSON.stringify({
            type:'join_room',
            roomId:id
        }))

        socket.onmessage=(event)=>{
            
            try{
              console.log(event.data);
                          const parsedData = JSON.parse(event.data);

                          if (parsedData.type === "chat") {
                            setChats((c) => [...c, parsedData.message]);
                          }

            }catch{
              console.log("Non json message ignored",event.data)

            }

        }
    }
},[socket,loading,id])
const handleSend=()=>{

  if(socket)
    {
    socket?.send(JSON.stringify({
    type: "chat",
    message: currentMessage,
    roomId: id,
  }))
    }
    else{console.log("connect to server");}
  
}

return (
  <div className=" py-6 px-6 w-full h-screen bg-zinc-900 text-white font-mono flex flex-col justify-between items-center gap-6 overflow-x-hidden ">
    <div
      className="   max-w-7xl  sm:text-lg outline-none focus:ring-3 focus:ring-emerald-700 focus:border-none rounded-sm  w-full border border-zinc-700 text-white font-semibold  bg-zinc-800 h-full py-15 px-10 grid grid-cols-2 gap-8 justify-between overflow-y-auto    [&::-webkit-scrollbar]:w-2

[&::-webkit-scrollbar-track]:bg-zinc-800
[&::-webkit-scrollbar-thumb]:bg-neutral-500 
[&::-webkit-scrollbar-thumb]:rounded-xl    "
    >
      {messages.map((item, index) => (
        <div
          key={index}
          className="bg-lime-50  text-zinc-800 font-semibold  text-base sm:text-lg flex wrap-break-word items-center  rounded-sm p-4 text-start hover:bg-emerald-600 hover:text-lime-50 "
        >
          <span>{item.message}</span>
        </div>
      ))}
    </div>
    <div className=" max-w-7xl mx-auto  flex flex-col gap-4 justify-between items-center w-full sm:flex-row  ">
      <input
        className="  text-base sm:text-lg outline-none focus:ring-3 focus:ring-emerald-700 focus:border-none rounded-sm py-2  w-full border border-white text-white font-semibold indent-4  sm:max-h-full  bg-zinc-800 "
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder={"chat here ... "}
      />
      <button
        className="text-white font-semibold focus:ring-3 focus:ring-white bg-emerald-700 hover:bg-emerald-800 outline-none focus:border-none border border-zinc-900 px-4 py-2 text-xl rounded-sm  w-full sm:w-1/4  "
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  </div>
);
}