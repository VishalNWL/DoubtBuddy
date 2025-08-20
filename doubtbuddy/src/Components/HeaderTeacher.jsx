import React, { useEffect, useState } from 'react'
import {FaUserCircle} from "react-icons/fa"
import { Link } from 'react-router-dom';
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';
import { useSelector } from 'react-redux';
import Header from './Header';

function HeaderTeacher() {
  const [doubt,setdoubt]=useState(0);
  const [pendingdoubt,setpendingdoubt]=useState(0);
  const [avatar,setavatar]=useState(null);
  const user = useSelector(state=>state.auth).userData;
  
  useEffect(()=>{
      try {
          (async()=>{
            const totaldoubt= await Axios({
              ...SummaryAPi.teacherTotalDoubts,
              method:'get'
             })

             setpendingdoubt(totaldoubt.data.data.length-user.answeredQuestions.length)
             setdoubt(user.answeredQuestions.length);
          
        })();

      } catch (error) {
        console.log(error.message);
      }
  },[])

   const [imgError, setImgError] = useState(false);

  return (
        
     <Header/>
      //  <header className='w-full bg-blue-600 text-white flex justify-center items-center flex-col'>
      //   <Link to={'/TeacherDashboard'}> {
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
      //     <h2>Total solved: {doubt}</h2>
      //   }
      //   {
      //     <h2>Total Pending: {pendingdoubt}</h2>
      //   }
      //  </header>

  )
}

export default HeaderTeacher