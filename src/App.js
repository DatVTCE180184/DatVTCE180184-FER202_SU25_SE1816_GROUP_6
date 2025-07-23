
import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavLink } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './component/HomePage';
import ProductDetails from './component/ProductDetails';
import AdminPage from './component/AdminPage';
import ProductList from './component/ProductList';
import Footer from "./component/Footer";
import SearchBar from './component/SearchBar';

function App() {
  const [searchTerm, setSearchTerm] = useState(''); //  Thêm state tìm kiếm
  return (
    <>
      <Router>
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <Navbar.Brand as={NavLink} to="/">
              <img
                src="/images/LAPTECH Neon Logo Design.png"
                alt="LAPTECH Store"
                height="30"
                className="d-inline-block align-top"
              />
            </Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/products">Products</Nav.Link>
              <Nav.Link as={Link} to="/admin">Product_Manager</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            </Nav>
            {/*  Search bar nằm bên phải thanh menu */}
            <SearchBar setSearchTerm={setSearchTerm} />
          </Container>
        </Navbar>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/products" element={<ProductList searchTerm={searchTerm} />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
}

export default App;
