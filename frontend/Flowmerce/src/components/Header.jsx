import React from 'react'
import { GoBell } from 'react-icons/go'
const Header = () => {
  return (
    <div className='flex justify-between items-center p-4 w-full'>
      <div>
        <h1 className='text-xs'>Welcome Back to Flowmerce</h1>
        <p className='text-xl font-semibold'>John Doe</p>
      </div>
      <div className='flex items-center space-x-5'>
        <div>
            <input 
            type="text" 
            placeholder='Search...' 
            className='bg-amber-100/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600'
            />
        </div>
        <div className='flex items-center space-x-5'>
            <button className='relative text-2xl text-gray-600'> 
                <GoBell size={28} />
                <span 
                className='absolute top-0 right-0 -mt-1 -mr-1 flex
                justify-center items-center bg-amber-600 text-white 
                font-semibold text-[10px] w-5 h-4 rounded-full border-2 border-white'>9</span>
            </button>
            <img 
            className='w-8 g-8 rounded-full border-2 bg-[#ff5c00] border-amber-500' 
            src="https://api.dicebear.com/9.x/adventurer/svg?seed=Chase" alt="" />
        </div>
      </div>
    </div>
  )
}

export default Header
