
'use client'

export async function getExistingShapes(roomId:string){

    const res = await fetch( `/api/chats/${roomId}`);
    const data= await  res.json();
    if(!data){ return }
    const shapes=data.chats.map((x:{message:string})=>{
        const messageData=JSON.parse(x.message)
        return messageData.shape
    })
    return shapes
}