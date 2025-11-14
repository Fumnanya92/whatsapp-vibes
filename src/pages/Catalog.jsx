import React, { useEffect, useState } from "react";
import "./CatalogPage.css";
import ProductCard from "../components/Catalog/ProductCard";
import { graceApiFetch } from "../utils/constants";

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // State for the search query
  const [error, setError] = useState(null);

  /** Fetch products based on the query */
  const fetchCatalog = async (searchQuery = "") => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching catalog with query:", searchQuery);
      console.log("API URL:", import.meta.env.VITE_API_URL || "http://localhost:8000/grace");
      
      const res = await graceApiFetch("/shopify/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        throw new Error(`Error: ${res.status} - ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Response data:", data);
      let products = data.products || [];

      // With sanitized API, availability is already calculated
      // Filter only available products
      products = products.filter(product => product.available === true);

      // Sort by newest first (by updated_at or created_at)
      products.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0);
        const dateB = new Date(b.updated_at || b.created_at || 0);
        return dateB - dateA;
      });

      setProducts(products);
    } catch (error) {
      console.error("Error fetching catalog:", error);
      setError(`Failed to fetch products: ${error.message}. Please check if the server is running.`);
    } finally {
      setLoading(false);
    }
  };

  /** Handle form submission for search */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a valid search query.");
      return;
    }
    fetchCatalog(query);
  };

  /** Fetch all products on initial load */
  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <div className="catalog-page-container">
      <h2 className="catalog-title">Grace Product Catalog</h2>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="catalog-search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products (e.g., 'red dresses')"
          className="catalog-search-input"
          aria-label="Search for products"
        />
        <button
          type="submit"
          className="catalog-search-button"
          disabled={!query.trim()}
          aria-label="Search"
        >
          Search
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="catalog-error-message">{error}</p>}

      {/* Product Grid */}
      {loading ? (
        <p className="catalog-loading">Loading catalog...</p>
      ) : products.length === 0 ? (
        <p className="catalog-no-results">No products found.</p>
      ) : (
        <div className="catalog-product-grid">
          {products.map((item, index) => (
            <ProductCard key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
