import { createContext, useContext, useState,useEffect } from "react";
import { supabase } from "../supabse-client";

const AuthContext = createContext()

export const AuthProvider = ({children})=>{
    const [user,setUser] = useState()
    
    const signOut = ()=>{}
    useEffect(() => {
        supabase.auth.getSession().then(({data:{session}})=>{
            setUser(session?.user ?? null)
        })
    }, [])
    
    const signInUserGithub = () => {
        supabase.auth.signInWithOAuth({ provider: 'github' });
    };
    return(
        <AuthContext.Provider value={{signOut,user,signInUserGithub}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = ()=>{
    const context = useContext(AuthContext)
    if(context === undefined) {throw new Error("useAuth must be use under the authProvider")}
    return context
}