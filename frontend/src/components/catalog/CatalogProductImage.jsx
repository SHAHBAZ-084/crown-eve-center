import React from 'react';
import { CATALOG_PRODUCT_IMAGE } from '../../constants/mediaDimensions';

/**
 * Product card image with fixed width/height to reduce CLS while CSS handles responsive sizing.
 */
const CatalogProductImage = ({ src, alt, className = 'bike-main-img' }) => {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      width={CATALOG_PRODUCT_IMAGE.width}
      height={CATALOG_PRODUCT_IMAGE.height}
      loading="lazy"
      decoding="async"
    />
  );
};

export default CatalogProductImage;
