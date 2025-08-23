import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider, useSelector } from 'react-redux'
import store from './store/store.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import Solvedoubt from './Pages/Solvedoubt.jsx'
import Seedoubt from './Pages/Seedoubt.jsx'
import CreateDoubt from './Pages/AskDoubt.jsx'
import SubjectRegister from './Pages/Registersubject.jsx'
import AuthLayout from './Components/AuthLayout.jsx'
import TeacherDashBoard from './Pages/TeacherDashBoard.jsx'
import StudentDashBoard from './Pages/StudentDashBoard.jsx'
import Profile from './Pages/Profile.jsx'
import Statistics from './Pages/Statistics.jsx'
import Discussion from './Pages/Discussion.jsx'
import AllowUser from './Pages/AllowUser.jsx'
import AllowSchool from './Pages/AllowSchool.jsx'
import SchoolDashBoard from './Pages/SchoolDashBoard.jsx'
import EditDoubt from './Pages/EditDoubt.jsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "",
            element: <Login />,
        },
        {
            path: "/login",
            element: (
                <AuthLayout authentication={false}>
                    <Login />
                </AuthLayout>
            ),
        },
        {
            path: "/teacherdashboard",
            element: (
                <AuthLayout authentication={true}>
                    <TeacherDashBoard/>
                </AuthLayout>
            ),
        },
        {
            path: "/studentdashboard",
            element: (
                <AuthLayout authentication={true}>
                    <StudentDashBoard />
                </AuthLayout>
            ),
        },

        {
            path: "/solvedoubt/:id/:idt",
            element: (
                <AuthLayout authentication={true}>
                    {" "}
                    <Solvedoubt />
                </AuthLayout>
            ),
        },
        {
            path: "/seedoubt/:id",
            element: (
                <AuthLayout authentication={true}>
                    {" "}
                    <Seedoubt />
                </AuthLayout>
            ),
        },
        {
            path: "/askdoubt",
            element: (
                <AuthLayout authentication={true}>
                    {" "}
                    <CreateDoubt />
                </AuthLayout>
            ),
        },
        {
            path:'/editdoubt/:doubtId',
            element:(
                <AuthLayout authentication={true}>
                    <EditDoubt/>
                </AuthLayout>
            )
        },
        {
            path: "/subject-register",
            element: <SubjectRegister />,
        },
        {
            path: "/profile",
            element: (
            <AuthLayout authentication={true}>
            <Profile/>
            </AuthLayout>
            ),
        },
        {
            path: "/statistics",
            element: (
            <AuthLayout authentication={true}>
            <Statistics/>
            </AuthLayout>
            ),
        },
        {
            path: "/discussion",
            element: (
            <AuthLayout authentication={true}>
            <Discussion/>
            </AuthLayout>
            ),
        },
        {
            path: "/signup",
            element: (
                
                    <Signup />
              
            ),
        },
        {
            path:'/allowUser',
            element:<AllowUser/>
        },
        {
            path:'/allowSchool',
            element:<AllowSchool/>
        },
        {
            path:'/schooldashboard',
            element:<SchoolDashBoard/>
        }
    ],
},
])

createRoot(document.getElementById('root')).render(
  
    <Provider store={store}>
    <RouterProvider router={router} />
    </Provider>

)
