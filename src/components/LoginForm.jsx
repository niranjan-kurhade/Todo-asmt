import { useState } from "react";
import { authApi } from "../api/authApi.js";

export default function LoginForm({setUser}) {

    const [form,setForm]=useState({username:"",password:""})
    const [status,setStatus]=useState("idle")
    const [error,setError]=useState(null)

    function onChange(e){
        const {name,value}=e.target
        setForm(prev=>({...prev,[name]:value}))
    }

    async function onSubmit(e){
        e.preventDefault()
        try{
            setStatus("loading")
            setError(null)
            const user= await authApi.login(form)
            localStorage.setItem("sessionUser",JSON.stringify(user))
            setStatus("idle")
            setUser(user)
        }catch(err){
            setStatus("idle")
            setError(err.message)
        }
    }

    return(
        <>
            <form onSubmit={onSubmit} className="form">
                <h2>Login</h2>
                <input type="text" placeholder="username" name="username" value={form.user} onChange={onChange}/>
                <input type="password" placeholder="password" name="password" value={form.password} onChange={onChange}/>
                <div className="form-actions">
                   <button disabled={status==="loading"}>Login</button>
                   {status==="loading" && <span className="status">Loading...</span>}
                </div>
                {error && <p className="error">Error : {error}</p>}
            </form>
        </>
    );
}
