import express from 'express'
import {userRouter} from './user'
import cookieParser from "cookie-parser";
import cors from 'cors'

const app=express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/app/v1/user',userRouter)

app.listen(3001)