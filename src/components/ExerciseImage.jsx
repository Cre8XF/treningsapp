import { useState, useEffect } from 'react';
import { findExerciseImages } from '../data/exerciseDB';

export default function ExerciseImage({ exerciseName, emoji, size = 'small' }) {
  const [images, setImages] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImages(null);
    setImgError(false);
    if (!exerciseName) return;
    findExerciseImages(exerciseName).then(imgs => setImages(imgs));
  }, [exerciseName]);

  const showFallback = !images || imgError;

  if (size === 'small') {
    if (showFallback) {
      return (
        <span style={{
          fontSize: '20px', width: '36px', height: '36px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {emoji}
        </span>
      );
    }
    return (
      <div style={{
        width: '36px', height: '36px', flexShrink: 0,
        borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a',
      }}>
        <img
          src={images[0]}
          alt={exerciseName}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  // size === 'large'
  if (showFallback) {
    return <div style={{ fontSize: '72px', lineHeight: 1 }}>{emoji}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%', maxWidth: '300px' }}>
      {images.slice(0, 2).map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${exerciseName} ${i + 1}`}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            flex: 1, height: '130px', objectFit: 'cover',
            borderRadius: '10px', background: '#1a1a1a',
            filter: 'brightness(0.88)',
          }}
        />
      ))}
    </div>
  );
}
