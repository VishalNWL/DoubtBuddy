import React, { useEffect, useState } from 'react'
import {FaUserCircle} from "react-icons/fa"
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './Header';

function HeaderStudent() {
    const [avatar,setavatar]=useState(null);
    const [imgError, setImgError] = useState(false);
    const [answereddoubt,setanswereddoubt] = useState(0)
    const [pendingdoubt,setpendingdoubt] = useState(0)
  const user=useSelector((state)=>state.auth).userData
  

useEffect(()=>{
try {
    setavatar(user.avatar)
    setImgError(false);
    
    let totaldoubt = user.AskedQuestions.length;
    let solveddoubt = user.AskedQuestions.filter(doubt=>doubt.status==='answered').length
    setanswereddoubt(solveddoubt);
    setpendingdoubt(totaldoubt-solveddoubt);

} catch (error) {
    setImgError(true);
}
},[])

  return (

    <Header/>

      //  <header className='w-full bg-blue-800 text-white flex justify-center items-center flex-col'>
      //   <Link to={'/StudentDashboard'}> {
      //     avatar && !imgError ? (
      //       <img src={avatar}
      //          alt='Profile'
      //          width={50}
      //          height={50}
      //          onError={()=> setImgError(true)}
      //          style={{borderRadius:"50%"}}
      //       />

      //     ):(<FaUserCircle size={65} color='#ffff'/>)
      //    }
      //    </Link>
      //   {
      //       <>
      //     <h2>Total Question: {pendingdoubt+answereddoubt}</h2>
      //     <h2>Total Soloution: {answereddoubt}</h2>
      //     <h2>Total Pending: {pendingdoubt}</h2>
      //     </>
      //   }
      //  </header>

  )
}

export default HeaderStudent