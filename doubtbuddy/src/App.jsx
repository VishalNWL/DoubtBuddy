import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import {login, logout} from "./store/authSlice"
import { Outlet, useNavigate } from 'react-router-dom'
import Axios from './Utils/Axios'
import SummaryAPi from './Common/SummaryApi'
import Header from './Components/Header'
import {Toaster} from 'react-hot-toast'
import Footer from './Components/Footer'
import { resetSubject, setSubject } from './store/studentSlice'

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
        
        if(user.data.data.role==='student'){
          try {
            
            const Class = user.data.data.class
            const stream = user.data.data.class>10 ? user.data.data.stream : null;
            
            const subinfo= await Axios({
              ...SummaryAPi.getSubject,
              data: {Class , school:user.data.data.school ,stream}
            })
            
            dispatch(setSubject(subinfo));
          } catch (error) {
            console.log(error);
          }
        }
        dispatch(login(user.data.data));
        
      } else {
        dispatch(logout());
        dispatch(resetSubject());
        navigate('/login');
      }
    } catch (err) {
      console.error('User check failed:', err);
      dispatch(logout());
      dispatch(resetSubject());
    } finally {
      setLoading(false);
    }
  })();
}, []);

  
  return !loading ? (
    <main>
      <Header/>
         <section className='min-h-screen'>
          <Outlet/>
         </section>
      <Toaster toastOptions={{
        success:{
           iconTheme:{
            primary:'#3B82F6',
            secondary: "#fff",
           }
        }
      }}/>
     <Footer/>
        </main>
  ) : null
}

export default App
