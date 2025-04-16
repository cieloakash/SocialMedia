import React from 'react'
import { useParams } from 'react-router-dom'
import SingleCommunityDisplay from '../components/SingleCommunityDisplay'

const SingleCommunity = () => {
    const {id} = useParams()
  return (
    <div className="pt-20">
    <SingleCommunityDisplay communityId={Number(id)} />
  </div>
  )
}

export default SingleCommunity