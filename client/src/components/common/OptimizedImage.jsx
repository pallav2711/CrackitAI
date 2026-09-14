import { useState, useRef, useEffect } from 'react';
import { createLazyObserver } from '../../utils/performance';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  placeholder = 'blur',
  priority = false,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (priority) return;

    const observer = createLazyObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      });
    });

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setError(true);
    onError?.(e);
  };

  const getPlaceholderStyle = () => {
    if (placeholder === 'blur') {
      return {
        backgroundColor: '#f3f4f6',
        backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23f3f4f6'/%3e%3c/svg%3e")`,
        filter: 'blur(5px)',
        transition: 'filter 0.3s ease'
      };
    }
    return { backgroundColor: '#f3f4f6' };
  };

  if (error) {
    return (
      <div 
        ref={imgRef}
        className={`flex items-center justify-center bg-gray-200 text-nb-black/45 ${className}`}
        style={{ width, height }}
        {...props}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            ...getPlaceholderStyle(),
            width: width || '100%',
            height: height || '100%'
          }}
        />
      )}
      
      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            width: width || '100%',
            height: height || '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;