import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiArrowLeft, FiPackage } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loader}>Loading...</div>
      </AdminLayout>
    );
  }

  if (!userData) {
    return (
      <AdminLayout>
        <div style={styles.error}>User not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/admin/users')}
          style={styles.backButton}
        >
          <FiArrowLeft size={20} />
          Back to Users
        </motion.button>

        <div style={styles.container}>
          {/* User Info Card */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.userCard}
          >
            <div style={styles.userHeader}>
              <div style={styles.avatar}>
                {userData.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={styles.userName}>{userData.user.name}</h2>
                <p style={styles.userRole}>Customer</p>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <FiMail style={styles.infoIcon} />
                <div>
                  <p style={styles.infoLabel}>Email</p>
                  <p style={styles.infoValue}>{userData.user.email}</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FiPhone style={styles.infoIcon} />
                <div>
                  <p style={styles.infoLabel}>Phone</p>
                  <p style={styles.infoValue}>{userData.user.phone}</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FiMapPin style={styles.infoIcon} />
                <div>
                  <p style={styles.infoLabel}>Address</p>
                  <p style={styles.infoValue}>
                    {userData.user.address?.street}, {userData.user.address?.city}<br />
                    {userData.user.address?.state} - {userData.user.address?.pincode}
                  </p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FiCalendar style={styles.infoIcon} />
                <div>
                  <p style={styles.infoLabel}>Joined Date</p>
                  <p style={styles.infoValue}>{formatDate(userData.user.createdAt)}</p>
                </div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <FiPackage size={24} color="#667eea" />
                <div>
                  <p style={styles.statValue}>{userData.orders.length}</p>
                  <p style={styles.statLabel}>Total Orders</p>
                </div>
              </div>
              <div style={styles.statBox}>
                <p style={styles.statValue}>
                  ₹{userData.orders.reduce((sum, order) => sum + order.totalAmount, 0)}
                </p>
                <p style={styles.statLabel}>Total Spent</p>
              </div>
            </div>
          </motion.div>

          {/* Orders Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={styles.ordersSection}
          >
            <h3 style={styles.sectionTitle}>Order History</h3>
            
            {userData.orders.length === 0 ? (
              <div style={styles.noOrders}>
                <FiPackage size={50} color="#dfe6e9" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div style={styles.ordersList}>
                {userData.orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    style={styles.orderCard}
                  >
                    <div style={styles.orderHeader}>
                      <div>
                        <h4 style={styles.orderId}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h4>
                        <p style={styles.orderDate}>{formatDate(order.createdAt)}</p>
                      </div>
                      <div style={{
                        ...styles.statusBadge,
                        background: getStatusColor(order.orderStatus)
                      }}>
                        {order.orderStatus.toUpperCase()}
                      </div>
                    </div>

                    <div style={styles.orderItems}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={styles.orderItem}>
                          <img src={item.image} alt={item.name} style={styles.itemImage} />
                          <div style={styles.itemDetails}>
                            <p style={styles.itemName}>{item.name}</p>
                            <p style={styles.itemMeta}>
                              Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                            </p>
                          </div>
                          <p style={styles.itemPrice}>₹{item.price}</p>
                        </div>
                      ))}
                    </div>

                    <div style={styles.orderFooter}>
                      <span>Total Amount:</span>
                      <span style={styles.totalAmount}>₹{order.totalAmount}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
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
  error: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#d63031'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.8rem 1.5rem',
    background: 'white',
    border: '2px solid #dfe6e9',
    borderRadius: '10px',
    color: '#2d3436',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '2rem',
    fontWeight: '500'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '2rem',
    alignItems: 'start'
  },
  userCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: '2rem'
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #dfe6e9',
    marginBottom: '2rem'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  userName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.3rem'
  },
  userRole: {
    color: '#636e72',
    fontSize: '0.9rem'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  infoItem: {
    display: 'flex',
    gap: '1rem'
  },
  infoIcon: {
    color: '#d63031',
    fontSize: '1.2rem',
    marginTop: '0.2rem'
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#636e72',
    marginBottom: '0.3rem'
  },
  infoValue: {
    fontSize: '0.95rem',
    color: '#2d3436',
    fontWeight: '500'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    paddingTop: '2rem',
    borderTop: '1px solid #dfe6e9'
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '10px'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#636e72'
  },
  ordersSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1.5rem'
  },
  noOrders: {
    textAlign: 'center',
    padding: '3rem',
    color: '#636e72'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  orderCard: {
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
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
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  orderItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem'
  },
  orderItem: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr auto',
    gap: '1rem',
    alignItems: 'center'
  },
  itemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  itemDetails: {},
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: '0.3rem'
  },
  itemMeta: {
    fontSize: '0.8rem',
    color: '#636e72'
  },
  itemPrice: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #dfe6e9',
    fontSize: '1rem',
    fontWeight: '600'
  },
  totalAmount: {
    fontSize: '1.3rem',
    color: '#d63031'
  }
};

const mediaQuery = window.matchMedia('(max-width: 968px)');
if (mediaQuery.matches) {
  styles.container.gridTemplateColumns = '1fr';
  styles.userCard.position = 'relative';
  styles.userCard.top = 'auto';
}

export default AdminUserDetail;
