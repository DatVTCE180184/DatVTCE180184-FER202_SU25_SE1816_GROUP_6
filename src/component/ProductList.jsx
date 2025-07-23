
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

function ProductList({ searchTerm = '' }) {
    const [productList, setProductList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    const [priceInput, setPriceInput] = useState('all');
    const [sortInput, setSortInput] = useState('none');
    const [priceRange, setPriceRange] = useState('all');
    const [sortOrder, setSortOrder] = useState('none');

    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        return parseInt(priceStr.replace(/\./g, ''), 10);
    };

    // Fetch products only once and parse prices
    useEffect(() => {
        fetch('http://localhost:5000/products')
            .then((res) => res.json())
            .then((data) => {
                const productsWithParsedPrices = data.map((product) => ({
                    ...product,
                    currentPrice: parsePrice(product.currentPrice),
                    originalPrice: parsePrice(product.price),
                }));
                setProductList(productsWithParsedPrices);
            })
            .catch((error) => console.error('Error fetching products:', error));
    }, []);

    // Apply search, filter, and sort
    const getFilteredSortedProducts = () => {
        let filtered = [...productList];
        // Search
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Filter by price
        filtered = filtered.filter(product => {
            const price = product.currentPrice;
            switch (priceRange) {
                case '10-15':
                    return price >= 10000000 && price <= 15000000;
                case '15-20':
                    return price > 15000000 && price <= 20000000;
                case '20-25':
                    return price > 20000000 && price <= 25000000;
                case '25+':
                    return price > 25000000;
                default:
                    return true;
            }
        });
        // Sort
        if (sortOrder === 'asc') {
            filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        } else if (sortOrder === 'desc') {
            filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        }
        return filtered;
    };

    const filteredProducts = getFilteredSortedProducts();
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleFilter = () => {
        setPriceRange(priceInput);
        setSortOrder(sortInput);
        setCurrentPage(1); // Reset to first page on filter
    };

    const handleDelete = (id) => {
        setProductList(productList.filter(product => product.id !== id));
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center text-primary fw-bold">PRODUCTS</h2>
            {/* Bộ lọc giá và sắp xếp */}
            <div className="row mb-4">
                <div className="col-md-4 mb-2">
                    <select
                        className="form-select"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                    >
                        <option value="all">Tất cả mức giá</option>
                        <option value="10-15">10.000.000 - 15.000.000 ₫</option>
                        <option value="15-20">15.000.000 - 20.000.000 ₫</option>
                        <option value="20-25">20.000.000 - 25.000.000 ₫</option>
                        <option value="25+">Trên 25.000.000 ₫</option>
                    </select>
                </div>
                <div className="col-md-4 mb-2">
                    <select
                        className="form-select"
                        value={sortInput}
                        onChange={(e) => setSortInput(e.target.value)}
                    >
                        <option value="none">Không sắp xếp</option>
                        <option value="asc">Giá tăng dần</option>
                        <option value="desc">Giá giảm dần</option>
                    </select>
                </div>
                <div className="col-md-4 mb-2 d-grid">
                    <button className="btn btn-primary" onClick={handleFilter}>
                        Lọc sản phẩm
                    </button>
                </div>
            </div>

            <div className="row">
                {currentProducts && currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                        <div key={product.id} className="col-md-3 mb-4">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src={`/images/${product.image}`}
                                    className="card-img-top"
                                    alt={product.name}
                                    style={{ height: '180px', objectFit: 'contain' }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text text-danger fw-bold">
                                        {product.currentPrice.toLocaleString('vi-VN')} ₫ {' '}
                                        <span className="text-muted text-decoration-line-through">
                                            {product.price.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </p>
                                    <p className="card-text" style={{ fontSize: '14px' }}>
                                        {product.description}
                                    </p>
                                    <div className="mt-auto d-flex gap-2">
                                        <Link
                                            to={{ pathname: `/product/${product.id}` }}
                                            className="btn btn-success">
                                            <FaArrowRight /> View Detail
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No product found</p>
                )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination justify-content-center">
                        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default ProductList;