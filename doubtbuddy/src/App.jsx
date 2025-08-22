import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import {login, logout} from "./store/authSlice"
import { Outlet, useNavigate } from 'react-router-dom'
import Axios from './Utils/Axios'
import SummaryAPi from './Common/SummaryApi'
import Header from './Components/Header'
import {Toaster} from 'react-hot-toast'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()

useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const user = await Axios({...SummaryAPi.userDetails});
       
      if (user.data.success) {
        dispatch(login(user.data.data));
      } else {
        dispatch(logout());
        navigate('/login');
      }
    } catch (err) {
      console.error('User check failed:', err);
      dispatch(logout());
    } finally {
      setLoading(false);
    }
  })();
}, []);

  
  return !loading ? (
    <main>
      <Header/>
         <Outlet />
      <Toaster toastOptions={{
        success:{
           iconTheme:{
            primary:'#3B82F6',
            secondary: "#fff",
           }
        }
      }}/>
        </main>
  ) : null
}

export default App
