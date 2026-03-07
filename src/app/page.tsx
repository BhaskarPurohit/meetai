<<<<<<< HEAD
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
=======
"use server"

import { auth } from "@/lib/auth"
import { HomeView } from "@/modules/home/ui/views/home-view"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const Page  = async ()=>{
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if(!session){
    redirect("/auth/sign-in")
>>>>>>> 516ddf6f557500b4e3fbc721d1adec0868bf2aa4
  }
  return <HomeView/>
  
}

<<<<<<< HEAD
  // Once dashboard is built, redirect to /dashboard
  redirect("/dashboard");
};

export default Page;
=======
export default Page
>>>>>>> 516ddf6f557500b4e3fbc721d1adec0868bf2aa4
