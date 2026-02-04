"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"



export default function Home(){
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const { data:session } = authClient.useSession()

  const onSubmit =()=>{
    authClient.signUp.email({
      email,
      name,
      password
    },{
      onError: ()=>{
        window.alert("something went wrong")
      },
      onSuccess:()=>{
        window.alert("Success")
      }
    })
  }

  const onLogin = ()=>{
    authClient.signIn.email({
      email,
      password
    },{
      onError: ()=>{
        window.alert("Incorrect Email or Password")
      },
      onSuccess:()=>{
        window.alert("Login Successful")
      }
    })
  }

  if(session){
    return(
      <div className="flex flex-col p-4 gap-y-4">
        <p>Logged ins as {session.user.name}</p>
        <Button onClick={() => authClient.signOut()}>Sign Out</Button>
      </div>
    )
  }
  return(
    <div className="flex flex-col gap-y-10">
      <div className="p-4 flex flex-col gap-y-4">
      <Input placeholder="name" value={name} onChange={(e) => setName(e.target.value)}></Input>
      <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
      <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Input>
      <Button onClick={onSubmit}>
        Create User
      </Button>
    </div>

    <div className="p-4 flex flex-col gap-y-4">
      <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
      <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Input>
      <Button onClick={onLogin}>
        Already a User? Login
      </Button>
    </div>
    </div>
  )
}