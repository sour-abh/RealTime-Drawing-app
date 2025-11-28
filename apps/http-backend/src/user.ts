import express, { NextFunction, Request, Response, Router } from 'express'

import {SignupSchema,loginSchema} from '@repo/common/types'
import {JWT_SECRET} from "@repo/backend-common/config"
import {prisma} from '@repo/db/client'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'


const userRouter:Router=express.Router()



function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


const authmiddleware=async(req:Request ,res:Response,next:NextFunction)=>{
    const header=req.headers.authorization ?? ''
    if ( !header){
       return  res.status(400).json({message:'no header found'})
    }
    const token=header?.split(' ')[1]
    if(!token){
        return res.status(400).json({message:'token not found'}) 
    }
    try{    
      const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      res.status(400).json({ message: "json error" });
      return;
    }

    if (!decoded || !(decoded as JwtPayload).userId) {
      res
        .status(400)
        .json({ message: "decode not found authentication error" });
      return;
    }
    req.userId = decoded.userId;
    console.log( "user authenticated successfull" );
    next();
  }
    catch(err){
        res.json({message:err})

    }

}

userRouter.post('/signup', async function (req:Request,res:Response){
    const email=req.body.email;
    const password=req.body.password;
    const name=req.body.name;
    
    const parsedbody=SignupSchema.safeParse({email,password,name})

    if(!parsedbody.success){
        res.status(403).json({ message: "input validation error" ,parsedbody});
        return 
    }
    const hash= await bcrypt.hash(password,10)
    try{
    const user = await prisma.user.findFirst({ where: { email: email } });
    
    if (user) {
      res.status(400).json({ message: "user already exist" });
      return;
    }
    const createdUser = await  prisma.user.create({ data:{email,password:hash, name,},omit:{
        password:true
    }})
    if(createdUser){
        
        const token=jwt.sign({userId:createdUser.id},JWT_SECRET)
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // set to true in production
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.status(201).json({ message: "user created successfully",token:token,user:createdUser,success:true });
    }}

    catch(error){
        res.status(400).json( {message:'error while creating user'})
    }
})
userRouter.post('/login', async function (req:Request,res:Response){
    const email=req.body.email;
    const passwordlogin=req.body.password;
    const loginParsed=loginSchema.safeParse({email,password:passwordlogin})
    if(!loginParsed.success){
        res.status(401).json({ message: "input validation error" });
        return
    }
    try {
        const user= await prisma.user.findUnique({where:{
            email:email
        }})
        if(!user){
            res.status(400).json({message:'no username found with this '})
            return
        }
        const result=bcrypt.compare(passwordlogin,user.password)
        if(!result){
            res.status(400).json({ message:"wrong credentials"})
        }
        const token = jwt.sign({userId:user.id}, JWT_SECRET);
        const {password,...safeUser}=user
                res.cookie("token", token, {
                  httpOnly: true,
                  secure: false, // set to true in production
                  sameSite: "lax",
                  maxAge: 1000 * 60 * 60 * 24 * 7,
                });
        res
          .status(200)
          .json({ message: "user logged successfully", token: token,user:safeUser  });

        
    } catch (error) {
        
    }

})
userRouter.post('/create-room',authmiddleware,async function (req:Request,res:Response){
    // if logged in
    const userId=req.userId

    if(!userId){
        res.status(401).json({message:"unauthenticated"})
        return
    }

    const createdRoom= await prisma.room.create({data:{
        adminId:userId,
        slug:generateRandomString(10)

    }})
    if(createdRoom!=undefined && createdRoom !=null){
        res.status(200).json({message:"room created successfully",roomId:createdRoom.id ,room:createdRoom})

    }
    // can create a room with specific id 
})
userRouter.get(
  "/chats/:roomId",
  authmiddleware,
  async function (req: Request, res: Response) {
    const room = Number(req.params.roomId);
    console.log(room)
    try {
      const chats = await prisma.chat.findMany({
        where: {
          roomId: room,
        }
        ,orderBy:{id:'desc'},
        take:50

      });
      if (!chats) {
        res.status(411).json({ message: "chats fetching unsuccessfull" });
        return;
      }
      res
        .status(200)
        .json({ 
          message: "chats fetched successfully",
          chats: chats,
        });
    } catch (error) {
      res.status(403).json({ message: "error while getting chats" ,chats:[]});
    }
  }
);

userRouter.get("/room/:slug", async (req:Request, res:Response) => {
  const slug = req.params.slug;
  const room = await prisma.room.findFirst({
    where: {
      slug,
    },
  });
  
  res.json({
    room,
  });
});

export {userRouter}