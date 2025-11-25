import express, { NextFunction, Request, Response, Router } from 'express'

import {SignupSchema,loginSchema} from '@repo/common/types'
import {generateRandomString} from '@repo/common/utils'
import {JWT_SECRET} from "@repo/backend-common/config"
import {prisma} from '@repo/db/client'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'

const userRouter:Router=express.Router()


const authmiddleware=async(req:Request ,res:Response,next:NextFunction)=>{
    const header=req.headers.authorization ?? ''
    if ( !header){
        res.status(400).json({message:'no header found'})
    }
    const token=header?.split(' ')[1]
    if(!token){
        res.status(400).json({message:'token not found'})
        return
    }
    try{    const decoded = jwt.verify(token, JWT_SECRET);
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
    res.status(200).json({ message: "user authenticated successfull" });
    next();}
    catch(err){
        res.json({message:err})

    }

}

userRouter.post('/signup', async function (req:Request,res:Response){
    const username=req.body.username;
    const password=req.body.password;
    const firstname=req.body.firstname;
    const lastname=req.body.lastname;
    const parsedbody=SignupSchema.safeParse({username,password,firstname,lastname})
    if(!parsedbody.success){
        res.status(403).json({ message: "input validation error" });
        return 
    }
    const hash= await bcrypt.hash(password,10)
    try{
    const user = await prisma.user.findFirst({ where: { username: username } });
    if (user !== null || user !== undefined) {
      res.status(400).json({ message: "user already exist" });
      return;
    }
    const createdUser = await  prisma.user.create({ data:{username:username,password:hash, firstname:firstname,lastname:lastname},omit:{
        password:true
    }})
    if(createdUser){
        
        const token=jwt.sign({userId:createdUser.id},JWT_SECRET)
  
        res.status(201).json({ message: "user created successfully",token:token,user:createdUser });
    }}

    catch(error){
        res.status(400).json( {message:'error while creating user'})
    }
})
userRouter.post('/login', async function (req:Request,res:Response){
    const username=req.body.username;
    const passwordlogin=req.body.password;
    const loginParsed=loginSchema.safeParse({username,password:passwordlogin})
    if(!loginParsed.success){
        res.status(401).json({ message: "input validation error" });
        return
    }
    try {
        const user= await prisma.user.findUnique({where:{
            username:username
        }})
        const result=bcrypt.compare(passwordlogin,user.password)
        if(!result){
            res.status(400).json({ message:"wrong credentials"})
        }
        const token = jwt.sign({userId:user.id}, JWT_SECRET);
        const {password,...safeUser}=user
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
        createdBy:userId,
        slug:generateRandomString(10)

    }})
    if(createdRoom!=undefined && createdRoom !=null){
        res.status(200).json({message:"room created successfully",roomId:createdRoom.id ,room:createdRoom})

    }
    // can create a room with specific id 
})

export {userRouter}