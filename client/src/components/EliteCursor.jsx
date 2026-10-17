'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function EliteCursor() {
    const [isHovering, setIsHovering] = useState(false)
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 150 }
    const x = useSpring(cursorX, springConfig)
    const y = useSpring(cursorY, springConfig)

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
        }

        const handleMouseOver = (e) => {
            if (e.target.closest('button, a, [role="button"], .group')) {
                setIsHovering(true)
            } else {
                setIsHovering(false)
            }
        }

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mouseover', handleMouseOver)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mouseover', handleMouseOver)
        }
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-[100000] hidden md:block">
            <motion.div
                style={{
                    x,
                    y,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.3)',
                    border: isHovering ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
                className="w-4 h-4 rounded-full backdrop-blur-[2px]"
            />
        </div>
    )
}
