import z from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string(),
  lastname: z.string(),
  firstname: z.string(),
});
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),

});
export const CreateRoomSchema =z.object({
    name:z.string().min(3).max(50)
})

