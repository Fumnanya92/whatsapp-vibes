// File: src/components/Catalog/ProductCard.jsx

import React, { useState } from "react";
import "./ProductCard.css";
import Lightbox from "../Shared/Lightbox";

const ProductCard = ({ item, isNew = false }) => {
  // Use multiple possible image field names for backward compatibility
  const imgSrc = item.image || item.image_url || `${import.meta.env.BASE_URL}placeholder.svg`;
  
  // Robust name handling
  const displayName = item.title || "Product";
  const displayPrice = item.price || "N/A";
  
  // Check if this is a new product (within last 30 days)
  const isNewProduct = () => {
    if (isNew) return true;
    const createdDate = new Date(item.created_at || item.updated_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  // Simplified availability check using sanitized API
  const isProductAvailable = item.available === true;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="product-card">
      {isNewProduct() && (
        <div className="new-badge">
          <span>NEW</span>
        </div>
      )}
      <div className="image-wrapper">
        {imgSrc ? (
          <button
            type="button"
            className="image-button"
            onClick={() => setIsOpen(true)}
            aria-label={`Open full image of ${displayName}`}
            title="View full image"
          >
            <img src={imgSrc} alt={displayName} className="product-image" />
          </button>
        ) : (
          <div className="image-placeholder">No Image</div>
        )}
      </div>
      <div className="product-details">
        <h3 className="product-name">{displayName}</h3>
        <p className="product-price">₦{displayPrice}</p>
        <div className="product-status">
          {isProductAvailable ? (
            <span className="availability-badge available">Available</span>
          ) : (
            <span className="availability-badge sold-out">Sold Out</span>
          )}
        </div>
        {item.product_url || item.url || item.shopify_url ? (
          <a
            className="buy-button"
            href={item.product_url || item.url || item.shopify_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy Now
          </a>
        ) : (
          <button className="buy-button" disabled title="No product link available">
            Buy Now
          </button>
        )}
      </div>
      </div>
      {isOpen && <Lightbox src={imgSrc} alt={displayName} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default ProductCard;
