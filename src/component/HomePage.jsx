// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import  ProductList from '../component/ProductList'; // Adjust the import path as necessary
// import { Container } from 'react-bootstrap';
// function HomePage (){
//     return (
//         <div className="home-page">
//         <h1>Welcome to the Home Page</h1>
//         <p>This is the main page of the application.</p>
//         {/* You can add more content or components here */}
//         <ProductList />
//         {/* Render the ProductList component */}

//         </div>
//     );
// }
// export default HomePage;


import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <Container className="text-center mt-5">
      <div className="home-page">
        <h1>Chào mừng đến với LAPTECH Store!</h1>
        <p>Chuyên cung cấp laptop hiện đại, chính hãng với giá cả cạnh tranh.</p>
        <img 
          src="/images/banner-laptop.png"
          alt="Laptop Banner"
          style={{ height: '270px', width: '100%', objectFit: 'contain' }}
          className="my-4"
        />
        <Button variant="primary" as={Link} to="/products">
          Khám phá sản phẩm
        </Button>
      </div>
    </Container>
  );
}

export default HomePage;
