function Pagination({ productsPerPage, totalProducts, paginate, currentPage }) {
    const pageNumbers = Array.from(
      { length: Math.ceil(totalProducts / productsPerPage) },
      (_, index) => index + 1
    );
  
    return (
      <div className="container">
        <nav>
          <ul className="pagination justify-content-center">
            {pageNumbers.map((number) => (
              <li
                key={number}
                className={`page-item ${number === currentPage ? 'active' : ''}`}
              >
                <button
                  onClick={() => paginate(number)}
                  className="page-link"
                >
                  {number}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }
  
  export default Pagination;
  