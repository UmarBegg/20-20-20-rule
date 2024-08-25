import React, { useEffect, useState } from 'react'
import WorkDisplay from './WorkDisplay'
import BreakDisplay from './BreakDisplay'

const CountdownTimer = ({ workDuration, breakDuration }) => {
  const getInitialTime = () => {
    const savedTime = parseInt(localStorage.getItem('remainingTime'), 10)
    return isNaN(savedTime) ? workDuration * 60 : savedTime
  }

  const getInitialBreakStatus = () => {
    const savedStatus = localStorage.getItem('isBreakTime')
    return savedStatus === 'true' ? true : false
  }

  const [remainingTime, setRemainingTime] = useState(getInitialTime())
  const [isBreakTime, setIsBreakTime] = useState(getInitialBreakStatus())

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const intervalID = setInterval(() => {
      setRemainingTime((prevTime) => {
        const newTime = prevTime - 60
        return newTime >= 0 ? newTime : 0 // Ensure time doesn't go negative
      })
    }, 1000)

    if (remainingTime === 0 && !isBreakTime) {
      sendNotification(
        'Time to take a break!',
        'Look at something 20 feet away for your break duration.'
      )
      setIsBreakTime(true)
      setRemainingTime(breakDuration) // Use custom break duration
    } else if (remainingTime === 0 && isBreakTime) {
      sendNotification('Break over!', 'Time to get back to work.')
      setIsBreakTime(false)
      setRemainingTime(workDuration * 60) // Reset to custom work duration
    }

    localStorage.setItem('remainingTime', remainingTime)
    localStorage.setItem('isBreakTime', isBreakTime)

    return () => clearInterval(intervalID)
  }, [remainingTime, isBreakTime, workDuration, breakDuration])

  const sendNotification = (title, message) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        silent: true, // Ensure the notification is soundless
        icon: '/path/to/icon.png', // Optional: add your own icon
      })
    }
  }

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0')
    const seconds = String(time % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {isBreakTime ? <BreakDisplay /> : <WorkDisplay />}
      <div style={{ fontSize: '48px', marginTop: '20px' }}>
        {formatTime(remainingTime)}
      </div>
    </div>
  )
}

export default CountdownTimer
