import React, { useState } from "react";

const ERROR_IMG_SRC =
  "https://placehold.co/600x400?text=No+Image";

interface Props
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  ...rest
}: Props) {

  const [imageError, setImageError] = useState(false);

  return (
    <img
      src={imageError ? ERROR_IMG_SRC : src}
      alt={alt || "image"}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setImageError(true)}
      {...rest}
    />
  );
}