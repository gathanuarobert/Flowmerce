import React from 'react'
import Statistics from '../components/Statistics'
import Platform from '../components/Platform'

const Home = () => {
  return (
    <div className='p-5'>
      <div className='grid md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <Statistics />
        <Platform />
        <Statistics />
        <Platform />
      </div>

      <div>
        <div>
          <h1>Recent Activity</h1>
          <p>See all</p>
        </div>
      </div>
    </div>
  )
}

export default Home
