import axios from "axios";
import { BACKEND_HTTP_URL } from "../config";
import { ChatRoomClient } from "./ChatRoomClient";
import { cookies } from "next/headers";


async function getChats({roomId}:{roomId:string}){
    const token=(await cookies()).get("token")?.value || ''
    console.log(token)
    try{
       
        const response = await axios.get(
          `${BACKEND_HTTP_URL}/chats/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        return response.data.chats ;

        
        
}
    catch(err){
        console.log(err,"error fetching chats")
        return []

    }}
    


export  async function ChatRoom({id}:{id:string}) {

    const messages=await getChats({roomId:id})

    return(    
    <div>
      
      <ChatRoomClient messages={messages} id={id} />
    </div>

     )

}