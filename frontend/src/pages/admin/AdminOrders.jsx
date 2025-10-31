import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    filterOrders();
  }, [search, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await api.get('/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (search) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(search.toLowerCase()) ||
        (order.user && order.user.name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return '#667eea';
      case 'shipped': return '#0984e3';
      case 'delivered': return '#00b894';
      case 'cancelled': return '#d63031';
      default: return '#636e72';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loader}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 style={styles.pageTitle}>Orders Management</h1>

        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterBox}>
            <FiFilter style={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={styles.ordersGrid}>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              onClick={() => navigate(`/admin/orders/${order._id}`)}
              style={styles.orderCard}
            >
              <div style={styles.orderHeader}>
                <div>
                  <h3 style={styles.orderId}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p style={styles.orderDate}>{formatDate(order.createdAt)}</p>
                </div>
                <div style={{
                  ...styles.statusBadge,
                  background: getStatusColor(order.orderStatus)
                }}>
                  {order.orderStatus.toUpperCase()}
                </div>
              </div>

              <div style={styles.customerInfo}>
                <p style={styles.customerLabel}>Customer:</p>
                <p style={styles.customerName}>
                  {order.user ? order.user.name : 'Guest'}
                </p>
                <p style={styles.customerContact}>
                  {order.user ? order.user.phone : 'N/A'}
                </p>
              </div>

              <div style={styles.orderItems}>
                <p style={styles.itemsLabel}>{order.items.length} items</p>
                <div style={styles.itemsList}>
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={styles.itemPreview}>
                      <img src={item.image} alt={item.name} style={styles.itemImage} />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={styles.moreItems}>+{order.items.length - 3}</div>
                  )}
                </div>
              </div>

              <div style={styles.orderFooter}>
                <div>
                  <p style={styles.paymentLabel}>Payment:</p>
                  <p style={{
                    ...styles.paymentStatus,
                    color: order.paymentStatus === 'completed' ? '#00b894' : '#ff6b6b'
                  }}>
                    {order.paymentStatus === 'completed' ? 'Paid' : 'COD'}
                  </p>
                </div>
                <div style={styles.totalAmount}>₹{order.totalAmount}</div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/orders/${order._id}`);
                }}
                style={styles.viewButton}
              >
                View Details
              </motion.button>
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div style={styles.noResults}>
            <h3>No orders found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

const styles = {
  loader: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#636e72'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '2rem'
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: 1,
    minWidth: '250px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '10px',
    padding: '0.8rem 1.5rem',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  searchIcon: {
    color: '#d63031',
    fontSize: '1.2rem',
    marginRight: '0.8rem'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    background: 'transparent'
  },
  filterBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    background: 'white',
    borderRadius: '10px',
    padding: '0.8rem 1.5rem',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  filterIcon: {
    color: '#d63031',
    fontSize: '1.2rem'
  },
  filterSelect: {
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    background: 'transparent',
    cursor: 'pointer',
    color: '#2d3436',
    fontWeight: '500'
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  orderCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f8f9fa'
  },
  orderId: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.3rem'
  },
  orderDate: {
    fontSize: '0.85rem',
    color: '#636e72'
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  customerInfo: {
    marginBottom: '1rem'
  },
  customerLabel: {
    fontSize: '0.8rem',
    color: '#636e72',
    marginBottom: '0.3rem'
  },
  customerName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: '0.2rem'
  },
  customerContact: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  orderItems: {
    marginBottom: '1rem'
  },
  itemsLabel: {
    fontSize: '0.9rem',
    color: '#636e72',
    marginBottom: '0.5rem'
  },
  itemsList: {
    display: 'flex',
    gap: '0.5rem'
  },
  itemPreview: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  moreItems: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    background: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#636e72'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #f8f9fa',
    marginBottom: '1rem'
  },
  paymentLabel: {
    fontSize: '0.8rem',
    color: '#636e72',
    marginBottom: '0.3rem'
  },
  paymentStatus: {
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#d63031'
  },
  viewButton: {
    width: '100%',
    padding: '0.8rem',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  noResults: {
    textAlign: 'center',
    padding: '3rem',
    color: '#636e72'
  }
};

export default AdminOrders;
