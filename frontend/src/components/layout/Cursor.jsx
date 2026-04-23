// frontend/src/components/layout/Cursor.jsx
import React, { useEffect, useRef } from 'react';

const Cursor = () => {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current && ringRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
        
        // Ring follow with delay
        setTimeout(() => {
          if (ringRef.current) {
            ringRef.current.style.left = e.clientX + 'px';
            ringRef.current.style.top = e.clientY + 'px';
          }
        }, 80);
      }
    };

    const handleMouseEnter = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = 'translate(-50%,-50%) scale(1.6)';
        ringRef.current.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
        ringRef.current.style.opacity = '0.6';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Add hover effects to links and buttons
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>
    </>
  );
};

export default Cursor;
