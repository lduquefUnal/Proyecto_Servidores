import React from 'react';

const HorizontalCarousel = ({ children, duration = '40s', reverse = false }) => {
  const animationName = `infinite-scroll`;
  const animationDirection = reverse ? 'reverse' : 'normal';

  return (
    <div
      className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
    >
      <ul
        className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none"
        style={{ animation: `${animationName} ${duration} linear infinite ${animationDirection}` }}
      >
        {children}
      </ul>
      <ul
        className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none"
        style={{ animation: `${animationName} ${duration} linear infinite ${animationDirection}` }}
        aria-hidden="true"
      >
        {children}
      </ul>
    </div>
  );
};

export default HorizontalCarousel;
