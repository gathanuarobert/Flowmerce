import React from 'react'
import Statistics from '../components/Statistics'
import Platform from '../components/Platform'

const Home = () => {
  return (
    <div className='p-5'>
      <div className='grid md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <Statistics />
        
      </div>
    </div>
  )
}

export default Home
