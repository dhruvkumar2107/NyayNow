'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
    const pathname = usePathname()

    useEffect(() => {
        // Snap scroll to the top-left on page navigation
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        })
    }, [pathname])

    return null
}
