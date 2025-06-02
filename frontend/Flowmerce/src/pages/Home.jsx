import React from 'react'
import Statistics from '../components/Statistics'
import Platform from '../components/Platform'
import Card from '../components/Card'
import Products from './Products'
import Orders from './Orders'

const Home = () => {
  // const orders = [
  //   { id: 1, name: 'Order 1', amount: '$100' },
  //   { id: 2, name: 'Order 2', amount: '$200' },
  //   { id: 3, name: 'Order 3', amount: '$300' },
  //   { id: 4, name: 'Order 4', amount: '$400' },
  //   // Add more orders as needed
  // ]
  return (
    <div className='p-5'>
      <div>
        <Platform />
      </div>
      <div className='md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <Statistics />
      </div>
      <div className='mt-8'>
        <Orders />
      </div>

      {/* <div>
        <div className='flex justify-between items-center'>
          <h1 className='text-lg font-semibold'>Recent Activity</h1>
          <p className='text-sm underline text-[#ff5c00]'>See all</p>
        </div>

        <div className='grid xl;grid-cols-4 gap-8'>
          {
            orders && orders.map((order) => <Card order={order} />)
          }
        </div>

      </div> */}
    </div>
  )
}

export default Home
