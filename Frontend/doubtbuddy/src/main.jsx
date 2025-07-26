import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
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
            path: "/subject-register",
            element: <SubjectRegister />,
        },
    ],
},
        {
            path: "/signup",
            element: (
                // <AuthLayout authentication={false}>
                    <Signup />
                // </AuthLayout>
            ),
        },
])

createRoot(document.getElementById('root')).render(
  
    <Provider store={store}>
    <RouterProvider router={router} />
    </Provider>

)
