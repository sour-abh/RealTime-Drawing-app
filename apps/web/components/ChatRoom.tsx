import axios from "axios";
import { BACKEND_HTTP_URL } from "../config";
import { ChatRoomClient } from "./ChatRoomClient";
import { cookies } from "next/headers";


async function getChats({roomId}:{roomId:string}){
    const token=(await cookies()).get("token")?.value
    try{
       
        const response = await axios.get(
          `${BACKEND_HTTP_URL}/chats/${roomId}`,
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NDIwMzU4NS04MzE1LTRjMzItYWVjNy1kOTlkNzAzMTY5NTYiLCJpYXQiOjE3NjQyMzAzNzd9.koYm_ZSIuy_1fk-naBJM_Ec_2YP9B3vkBmbTP4xIOFo`,
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