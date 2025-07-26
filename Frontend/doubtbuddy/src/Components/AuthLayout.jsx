import React,{useState,useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'

function AuthLayout({children,authentication=true}) {
    const navigate=useNavigate();
    const authstatus=useSelector(state=>state.auth.status);
    const [loader,setloader]=useState(false);

    useEffect(()=>{

        if(authentication && authstatus!==authentication){
            navigate('/login');
        }
        else if(!authentication && authstatus!==authentication){
            navigate('/');
        }

        setloader(false)

    },[navigate,authstatus,authentication])

    
  return loader?<h1>Loading...</h1>: <>{children}</>
}

export default AuthLayout