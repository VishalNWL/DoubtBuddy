import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout as authLogout } from '../store/authSlice';


const navLinks = [
    { href: '/profile', label: 'Profile' },
    { href: '/statistics', label: 'Statistics' },
    { href: '/discussion', label: 'Discussion' }
];


const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const user = useSelector(state=>state.auth).userData;

   
useEffect(()=>{
         if(user && user.role==='admin' && !navLinks.find(e=>e.href==='/signup')){
        navLinks.push({
            href:'/signup',
            label:'Register user'
        })
    }

},[])

    const handleLogout = async () => {
        try {

            const response = await Axios({
                ...SummaryAPi.logout
            })

            console.log(response);
            if (response.data.success) {
                dispatch(authLogout());
                localStorage.setItem("accesstoken", "");
                localStorage.setItem("refreshtoken", "");
                navigate('/login')
            }


        } catch (error) {
            console.log(error)
        }
    }


    return (
       user && <header className="bg-blue-600 text-white px-8 py-4 flex items-center justify-between">
            <Link to={''} className="m-0 text-2xl font-bold tracking-wider">DoubtBuddy</Link>
            {/* Desktop Nav */}
            <nav className="hidden md:block">
                <ul className="flex gap-6 m-0 p-0 list-none">
                    {navLinks.map(link => (
                        <li key={link.href}>
                            <Link
                                to={link.href}
                                className="text-white no-underline text-base font-medium transition-colors duration-200 hover:text-blue-200"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}

                    <button
                        type="button"
                        className="bg-transparent text-white no-underline text-base font-medium transition-colors duration-200 hover:text-blue-200 cursor-pointer"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </ul>
            </nav>
            {/* Mobile User Icon */}
            <button
                className="md:hidden text-3xl"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(true)}
            >
                <FaUserCircle />
            </button>


            {/* Mobile Fullscreen Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
                    <button
                        className="absolute top-6 right-8 text-3xl text-white"
                        aria-label="Close menu"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        &times;
                    </button>
                    <ul className="flex flex-col gap-8 text-xl font-semibold">
                        {navLinks.map(link => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="text-white no-underline hover:text-blue-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <button
                                type="button"
                                className="bg-transparent text-white no-underline text-xl font-semibold transition-colors duration-200 hover:text-blue-200 cursor-pointer"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
};

export default Header;