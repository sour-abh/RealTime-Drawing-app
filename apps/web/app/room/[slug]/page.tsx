import axios from 'axios'
import { BACKEND_HTTP_URL } from '../../../config'
import { ChatRoom } from '../../../components/ChatRoom'



async function getRoomId(slug:string){
    try{ const response=await axios.get(`${BACKEND_HTTP_URL}/room/${slug}`)
    return response.data.room.id
}
    catch(err){
        console.log(err, "error in fetching room Id")
    }
    
}

export default async function Home({params}:{params:{slug:string}}){

    const slug= (await params).slug

    const roomId= await getRoomId(slug)

    return (
      <div>

     <ChatRoom id={String(roomId)} />

      </div>
    );

}