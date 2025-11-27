import { WebSocketServer ,WebSocket} from "ws";
import jwt, { JwtPayload }  from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db/client";
const wss=new WebSocketServer({port:8080});

interface User{
userId:string;
rooms:string[];
ws:WebSocket;
}

const users:User[]=[]

function checkuser(token:string ):string|null{
    try{const decoded = jwt.verify(token, JWT_SECRET);
            if (!decoded || typeof decoded == "string") {
              return null;
            }
            if (!decoded.userId) {
              return null;
            }
            return decoded.userId;
    }
    catch(error){
         console.log(error)
         return null
    }        
}

wss.on('connection',function connection(ws,request){
    const url=request.url;
    if (!url){
        return;
    }
    const queryParams=new URLSearchParams(url.split('?')[1])
    const token=queryParams.get('token') ?? '' ;
    const userId=checkuser(token)
    if(!userId){
        ws.close()
        return
    }
    users.push({
        userId,
        rooms:[],
        ws
    })




    ws.on('message', async function message(data){
        let parsedData
        if(typeof data !== "string"){
            parsedData=JSON.parse(data.toString())
        }else{
            parsedData=JSON.parse(data)
        }

        if(parsedData.type==="join_room"){
            try{
                const user=users.find(x=>x.ws===ws)
                if(user){
                    user?.rooms.push(parsedData.roomId);
                }
            }catch(error){
                console.log(error)
            }
            console.log(users)
        }
                if (parsedData.type === "leave_room") {
                  try {
                    const user = users.find((x) => x.ws === ws);
                    if (!user) {
                      return
                    }
                    user.rooms = user?.rooms.filter(
                      (x) => x === parsedData.room
                    );
                  } catch (error) {
                    console.log(error);
                  }
                  console.log(users)
                }
                console.log('message received')
                console.log(parsedData)

                if(parsedData.type==='chat'){
                    const roomId=parsedData.roomId;
                    const message=parsedData.message
                
                await prisma.chat.create({
                    data:{
                        roomId:Number(roomId),
                        message,
                        userId
                        
                    }
                
                })
                users.forEach(user=>{
                    if(user.rooms.includes(roomId)){
                        user.ws.send(JSON.stringify({
                            type:'chat',
                            message:message,
                            roomId
                        }))

                    }
                })
            }
        ws.send(userId)
    }) 
})