import React ,{ useId } from 'react'


function Select({options,className,label,placeholder,multiple=false,...props},ref) {
    const id=useId();
  return (
    <div className='w-full'>
        {label && <label className={`${className} font-poppins`} htmlFor={id}>{label}</label>}

        <select
         className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
         id={id}
         {...props}
         ref={ref}
         multiple={multiple}
        >
          {
            <option value='' disabled selected>{placeholder}</option>
          }
         {
            options?.map((option)=>{
              return <option key={option} value={option}>{option}</option>
            })
         }

        </select>
    </div>
  )
}

export default React.forwardRef(Select)