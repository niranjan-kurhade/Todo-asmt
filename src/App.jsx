import { useState,useEffect } from "react"
import "./App.css"
import LoginForm from "./components/LoginForm"
import TodoList from "./components/TodoList"


export default function App() {
  const [user,setUser]=useState(null)

  useEffect(()=>{
    const raw=localStorage.getItem("sessionUser")
    if(raw) {setUser(JSON.parse(raw))}
  },[])

  function logout(){
    localStorage.removeItem("sessionUser")
    setUser(null)
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Todo List</h1>
        {user && (
          <div className="user-info">
            <span>Hi, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>

      {!user ? <LoginForm setUser={setUser}></LoginForm>:<TodoList user={user}></TodoList>}
    </main>
  )
}
