import React, { useEffect, useRef, useState } from 'react'

export default function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxHeight = '90vh',
  showHandle = true 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const sheetRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when bottom sheet is open
      document.body.style.overflow = 'hidden'
      // Use a small timeout to ensure the initial state is rendered before animating
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 10) // Very small delay to ensure proper animation
      
      return () => clearTimeout(timer)
    } else {
      document.body.style.overflow = ''
      setIsVisible(false)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e) => {
    // Only allow dragging from header area, not from scrollable content
    const target = e.target
    const contentArea = target.closest('.bottom-sheet-content')
    if (contentArea) return
    
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    
    const touchY = e.touches[0].clientY
    const deltaY = touchY - startY
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setCurrentY(touchY)
      if (sheetRef.current) {
        // Add resistance effect - the further you drag, the more resistance
        const resistance = Math.min(deltaY * 0.6, deltaY)
        sheetRef.current.style.transform = `translateY(${resistance}px)`
        // Add slight opacity change during drag
        const opacity = Math.max(0.7, 1 - (deltaY / 400))
        sheetRef.current.style.opacity = opacity
      }
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const deltaY = currentY - startY
    const threshold = 100 // Close if dragged down more than 100px
    
    if (deltaY > threshold) {
      onClose()
    } else {
      // Snap back to original position with smooth animation
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease-out'
        sheetRef.current.style.transform = 'translateY(0)'
        sheetRef.current.style.opacity = '1'
        // Remove transition after animation completes
        setTimeout(() => {
          if (sheetRef.current) {
            sheetRef.current.style.transition = ''
          }
        }, 300)
      }
    }
    
    setIsDragging(false)
    setStartY(0)
    setCurrentY(0)
  }

  const handleMouseDown = (e) => {
    // Only allow dragging from header area, not from scrollable content
    const target = e.target
    const contentArea = target.closest('.bottom-sheet-content')
    if (contentArea) return
    
    setStartY(e.clientY)
    setCurrentY(e.clientY)
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const mouseY = e.clientY
    const deltaY = mouseY - startY
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setCurrentY(mouseY)
      if (sheetRef.current) {
        // Add resistance effect - the further you drag, the more resistance
        const resistance = Math.min(deltaY * 0.6, deltaY)
        sheetRef.current.style.transform = `translateY(${resistance}px)`
        // Add slight opacity change during drag
        const opacity = Math.max(0.7, 1 - (deltaY / 400))
        sheetRef.current.style.opacity = opacity
      }
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    const deltaY = currentY - startY
    const threshold = 100
    
    if (deltaY > threshold) {
      onClose()
    } else {
      // Snap back to original position with smooth animation
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease-out'
        sheetRef.current.style.transform = 'translateY(0)'
        sheetRef.current.style.opacity = '1'
        // Remove transition after animation completes
        setTimeout(() => {
          if (sheetRef.current) {
            sheetRef.current.style.transition = ''
          }
        }, 300)
      }
    }
    
    setIsDragging(false)
    setStartY(0)
    setCurrentY(0)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, startY, currentY])

  if (!isOpen) return null

  return (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
        isVisible ? 'bg-black/50' : 'bg-black/0'
      }`}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose()
        }
      }}
    >
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          maxHeight,
          marginLeft: 0,
          marginRight: 0
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-slate-400 hover:w-16" />
          </div>
        )}
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  )
}
