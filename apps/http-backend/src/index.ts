import express from 'express'
import {userRouter} from './user'

const app=express()
app.use(express.json())
app.use('/app/v1/user',userRouter)

app.listen(3001)