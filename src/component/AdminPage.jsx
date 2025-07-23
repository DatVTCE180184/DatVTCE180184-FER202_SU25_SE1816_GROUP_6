import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

/* ====== Helpers ====== */
const formatVND = (value) => {
  if (value === null || value === undefined || value === "") return "";

  const numeric = Number(String(value).replace(/\D/g, "")); // Bỏ ký tự không phải số
  if (isNaN(numeric)) return value + " ₫";

  return numeric.toLocaleString("vi-VN") + " ₫"; // Hiển thị với dấu chấm
};


function AdminPage() {
    const [productList, setProductList] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        originalPrice: '',
        discountedPrice: '',
        image: ''
    });

        const [editProduct, setEditProduct] = useState(null); // Sản phẩm đang chỉnh sửa
    const [showEditModal, setShowEditModal] = useState(false); // Hiện popup edit
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Hiện popup xác nhận
    const [editedProduct, setEditedProduct] = useState(null); // Lưu sản phẩm vừa chỉnh sửa

    
  /* ---------- Load dữ liệu (server + localStorage) ---------- */
  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("products")) || [];

    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((serverData) => {
        // Normalize server data to use originalPrice/discountedPrice
        const normalized = serverData.map((p) => ({
          ...p,
          originalPrice: Number(String(p.originalPrice ?? p.price ?? '').replace(/\D/g, "")),
          discountedPrice: Number(String(p.discountedPrice ?? p.currentPrice ?? '').replace(/\D/g, "")),
        }));
        // Merge local and server, prioritize local
        const merged = [
          ...localData,
          ...normalized.filter((s) => !localData.some((l) => l.id === s.id)),
        ];
        setProductList(merged);
      })
      .catch(() => {
        setProductList(localData);
      });
  }, []);

  /* ---------- Form handlers ---------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      image: "",
    });
  };

  /* ---------- Thêm sản phẩm ---------- */
  const handleAddProduct = (e) => {
    e.preventDefault();
    const { name, description, originalPrice, discountedPrice, image } = form;

    if (!name.trim() || !description.trim() || originalPrice === "" || discountedPrice === "") {
      return;
    }

    const newProduct = {
      name: name.trim(),
      description: description.trim(),
      originalPrice: Number(String(originalPrice).replace(/\D/g, "")),
      discountedPrice: Number(String(discountedPrice).replace(/\D/g, "")),
      image: image?.trim() || "https://via.placeholder.com/180x120?text=No+Image",
    };

    fetch("http://localhost:5000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedList = [data, ...productList];
        setProductList(updatedList);
        localStorage.setItem("products", JSON.stringify(updatedList));
        resetForm();
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        const fallbackProduct = { ...newProduct, id: Date.now() };
        const updatedList = [fallbackProduct, ...productList];
        setProductList(updatedList);
        localStorage.setItem("products", JSON.stringify(updatedList));
        resetForm();
      });
  };

    const [showModal, setShowModal] = useState(false);

    // Bộ lọc tạm (để người dùng nhập)
    const [searchInput, setSearchInput] = useState('');
    const [priceInput, setPriceInput] = useState('all');
    const [sortInput, setSortInput] = useState('none');

    // State dùng để thực sự lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState('all');
    const [sortOrder, setSortOrder] = useState('none');

    // Filtering, searching, sorting
    const getFilteredSortedProducts = () => {
        let filtered = [...productList];
        // Search
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        // Filter by price
        filtered = filtered.filter(product => {
            const price = Number(product.discountedPrice);
            if (priceRange === '10-15') return price >= 10000000 && price <= 15000000;
            if (priceRange === '15-20') return price > 15000000 && price <= 20000000;
            if (priceRange === '20-25') return price > 20000000 && price <= 25000000;
            if (priceRange === '25+') return price > 25000000;
            return true;
        });
        // Sort
        if (sortOrder === 'asc') {
            filtered.sort((a, b) => Number(a.discountedPrice) - Number(b.discountedPrice));
        } else if (sortOrder === 'desc') {
            filtered.sort((a, b) => Number(b.discountedPrice) - Number(a.discountedPrice));
        }
        return filtered;
    };

    const filteredProducts = getFilteredSortedProducts();

    const handleFilter = () => {
        setSearchTerm(searchInput);
        setPriceRange(priceInput);
        setSortOrder(sortInput);
    };

  /* ---------- Xoá sản phẩm ---------- */
  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

    const updatedList = productList.filter((p) => p.id !== id);
    setProductList(updatedList);
    localStorage.setItem("products", JSON.stringify(updatedList));

    fetch(`http://localhost:5000/products/${id}`, {
      method: "DELETE",
    }).catch((err) => {
      console.error("Delete failed on server:", err);
    });
  };

    const handleEdit = (id) => {
        const product = productList.find(p => p.id === id);
        setEditProduct(product);
        setShowEditModal(true);
    };

    
    const handleEditChange = (e) => {
        setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
    };

    
    // Edit product handler: update localStorage after editing
    const handleEditProduct = async (e) => {
        e.preventDefault();
        if (!editProduct.name || !editProduct.description || !editProduct.originalPrice || !editProduct.discountedPrice) return;
        try {
            const res = await fetch(`http://localhost:5000/products/${editProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editProduct)
            });
            if (res.ok) {
                const updated = await res.json();
                const updatedList = productList.map(p => p.id === updated.id ? updated : p);
                setProductList(updatedList);
                localStorage.setItem("products", JSON.stringify(updatedList));
                setEditedProduct(updated); // Lưu sản phẩm vừa chỉnh sửa
                setShowEditModal(false); // Đóng modal edit
                setShowSuccessModal(true); // Hiện modal xác nhận
            } else {
                alert('Update failed!');
            }
        } catch (error) {
            alert('Error updating product!');
        }
    };

    
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        setEditedProduct(null);
    };

    const handleBackToEdit = () => {
        setShowSuccessModal(false);
        setShowEditModal(true);
    };




    const handleAdd = () => {
        setShowModal(true);
    };

    // Ensure resetForm and handleCloseEditModal reset state
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };
    
    
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditProduct(null);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center text-primary fw-bold">Product Manager</h2>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-success" onClick={handleAdd}>Add Product</button>
            </div>
            {/* Bộ lọc sản phẩm */}
            <div className="row mb-3">
                <div className="col-md-3 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm theo tên sản phẩm..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <div className="col-md-3 mb-2">
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
                <div className="col-md-3 mb-2">
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
                <div className="col-md-3 mb-2 d-grid">
                    <button className="btn btn-primary" onClick={handleFilter}>
                        Lọc sản phẩm
                    </button>
                </div>
            </div>

            {/* ===== Add Product Modal ===== */}
            {showModal && !showEditModal && (
              <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Add New Product</h5>
                      <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
                    </div>
                    <form onSubmit={(e) => { handleAddProduct(e); handleCloseModal(); }}>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Name:</label>
                          <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Description:</label>
                          <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={2} required />
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Original Price:</label>
                            <input type="number" className="form-control" name="originalPrice" value={form.originalPrice} onChange={handleChange} required min="0" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Discounted Price:</label>
                            <input type="number" className="form-control" name="discountedPrice" value={form.discountedPrice} onChange={handleChange} required min="0" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="form-label fw-semibold">Image URL (optional):</label>
                          <input type="text" className="form-control" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className="btn btn-success">Add Product</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            
            {/* Modal for Edit Product */}
            {showEditModal && editProduct && (
                <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl" role="document" style={{ maxWidth: '95vw', width: '95vw' }}>
                        <div className="modal-content" style={{ backgroundColor: '#fff' }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Product</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseEditModal}></button>
                            </div>
                            <form onSubmit={handleEditProduct}>
                                <div className="modal-body">
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '25%', fontWeight: 'bold', fontSize: 18 }}>Name:</td>
                                                <td>
                                                    <input type="text" className="form-control" name="name" value={editProduct.name} onChange={handleEditChange} required />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ fontWeight: 'bold', fontSize: 18 }}>Description:</td>
                                                <td>
                                                    <textarea className="form-control" name="description" value={editProduct.description} onChange={handleEditChange} required rows={2} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ fontWeight: 'bold', fontSize: 18 }}>Price:</td>
                                                <td>
                                                    <input type="number" className="form-control" name="originalPrice" value={editProduct.originalPrice} onChange={handleEditChange} required min="0" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ fontWeight: 'bold', fontSize: 18 }}>Current Price:</td>
                                                <td>
                                                    <input type="number" className="form-control" name="discountedPrice" value={editProduct.discountedPrice} onChange={handleEditChange} required min="0" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận sau khi lưu thành công */}
            {showSuccessModal && editedProduct && (
                <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl" role="document" style={{ maxWidth: '95vw', width: '95vw' }}>
                        <div className="modal-content" style={{ backgroundColor: '#fff', color: '#222', textAlign: 'center' }}>
                            <div className="modal-body">
                                <h2 style={{ fontWeight: 'bold', marginTop: 20 }}>{editedProduct.name}</h2>
                                {editedProduct.image && (
                                    <img src={`/images/${editedProduct.image}`} alt={editedProduct.name} style={{ width: 250, height: 180, objectFit: 'contain', margin: '20px auto', display: 'block', background: '#fff', borderRadius: 10 }} />
                                )}
                                <div style={{ fontSize: 20, margin: '20px 0' }}>{editedProduct.description}</div>
                                <div style={{ fontSize: 22, margin: '10px 0' }}>Price: {Number(editedProduct.originalPrice).toLocaleString('vi-VN')} đ</div>
                                <div style={{ fontSize: 22, margin: '10px 0' }}>Current Price: {Number(editedProduct.discountedPrice).toLocaleString('vi-VN')} đ</div>
                                <div style={{ fontSize: 22, margin: '10px 0' }}>
                                    Discount: {editedProduct.originalPrice && editedProduct.discountedPrice ?
                                        (Math.round((1 - Number(editedProduct.discountedPrice.toString().replace(/\D/g, '')) / Number(editedProduct.originalPrice.toString().replace(/\D/g, ''))) * 100)) : 0} %
                                </div>
                            </div>
                            <div className="modal-footer" style={{ justifyContent: 'center' }}>
                                <button type="button" className="btn btn-primary me-2" onClick={handleCloseSuccessModal}>Back Home</button>
                                <button type="button" className="btn btn-danger" onClick={handleBackToEdit}>Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Current Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts && filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>{Number(product.originalPrice).toLocaleString('vi-VN')} ₫</td>
                                    <td className="CurrentPrice">{Number(product.discountedPrice).toLocaleString('vi-VN')} ₫</td>
                                    <td>
                                        <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(product.id)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center">No products found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPage;

