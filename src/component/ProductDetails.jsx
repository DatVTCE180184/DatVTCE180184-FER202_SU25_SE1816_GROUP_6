import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
function ProductDetails () {
    const {id} = useParams(); // Extract the product ID from the URL
    const [product, setProduct] = useState(null); // To store the fetched product details
    const [error, setError] = useState(null); // To handle error state

    // Fetch product details based on the ID parameter
    useEffect(() => {
        fetch(`http://localhost:5000/products/${id}`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch product details');
                return response.json();
            })
            .then((data) => {
                setProduct(data); // Set the fetched product data
            })
            .catch((err) => {
                setError(err.message); // Capture any errors
            });
    }, [id]); // Dependency ensures it refetches when ID changes

    // Render error state if fetch fails
    if (error) {
        return (
            <Container className="pt-4">
                <h2>Error: {error}</h2>
                <Link to="/products" className="btn btn-secondary">
                    <FaArrowLeft/> Back to Product List
                </Link>
            </Container>
        );
    }

    // Render product details if successfully fetched
    return product ? (
        <Container className="pt-4">
            <h2>{product.name}</h2>
            <p>Description: {product.description}</p>
            <p>Original Price: {product.price} ₫</p>
            <p>Current Price: {product.currentPrice} ₫</p>
            <img  src={`/images/${product.image}`} alt={product.name} style={{width: '200px'}}/>
            <br/>
            <Link to="/products" className="btn btn-secondary mt-3">
                <FaArrowLeft/> Back to Product List
            </Link>
        </Container>
    ) : (
        <Container className="pt-4">
            <h2>Product not found!</h2>
            <Link to="/products" className="btn btn-secondary">
                <FaArrowLeft/> Back to Product List
            </Link>
        </Container>
    );
}
export default ProductDetails;