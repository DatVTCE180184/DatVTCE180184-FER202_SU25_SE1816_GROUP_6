import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

function SearchBar({ setSearchTerm }) {
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);
    navigate('/products');
  };

  return (
    <Form className="d-flex">
      <InputGroup>
        <FormControl
          type="search"
          placeholder="Search products..."
          onChange={handleSearchChange}
        />
        <Button variant="outline-secondary">
          <FaSearch />
        </Button>
      </InputGroup>
    </Form>
  );
}

export default SearchBar;
