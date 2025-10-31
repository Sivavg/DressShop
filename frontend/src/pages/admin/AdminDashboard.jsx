import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    previousRevenue: 0,
    previousOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [navigate]);


  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }


      const response = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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


  // Calculate growth percentage
  const calculateGrowth = () => {
    if (!stats.previousRevenue || stats.previousRevenue === 0) {
      return { value: '0%', isPositive: true };
    }
    
    const growth = ((stats.totalRevenue - stats.previousRevenue) / stats.previousRevenue) * 100;
    const isPositive = growth >= 0;
    const displayValue = `${isPositive ? '+' : ''}${growth.toFixed(1)}%`;
    
    return { value: displayValue, isPositive };
  };


  const growth = calculateGrowth();


  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FiUsers size={30} />,
      color: '#667eea',
      bgColor: '#f0f3ff'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <FiPackage size={30} />,
      color: '#0984e3',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <FiDollarSign size={30} />,
      color: '#00b894',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Revenue Growth',
      value: growth.value,
      icon: growth.isPositive ? <FiTrendingUp size={30} /> : <FiTrendingDown size={30} />,
      color: growth.isPositive ? '#00b894' : '#d63031',
      bgColor: growth.isPositive ? '#e8f5e9' : '#fff5f5'
    }
  ];


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


  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="admin-dashboard-container"
        style={styles.container}
      >
        <h1 style={styles.pageTitle}>Dashboard</h1>


        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              style={styles.statCard}
            >
              <div style={{ ...styles.statIcon, background: stat.bgColor, color: stat.color }}>
                {stat.icon}
              </div>
              <div style={styles.statInfo}>
                <h3 style={styles.statTitle}>{stat.title}</h3>
                <p style={styles.statValue}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>


        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.recentOrders}
        >
          <h2 style={styles.sectionTitle}>Recent Orders</h2>
          
          {/* Desktop Table View */}
          <div className="desktop-table" style={styles.desktopTable}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Order ID</th>
                    <th style={styles.tableHeaderCell}>Customer</th>
                    <th style={styles.tableHeaderCell}>Items</th>
                    <th style={styles.tableHeaderCell}>Total</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        style={styles.tableRow}
                      >
                        <td style={styles.tableCell}>
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td style={styles.tableCell}>
                          {order.user ? order.user.name : 'Guest'}
                        </td>
                        <td style={styles.tableCell}>
                          {order.items.length} items
                        </td>
                        <td style={styles.tableCell}>
                          ₹{order.totalAmount}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.statusBadge,
                            background: getStatusColor(order.orderStatus)
                          }}>
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            style={styles.viewButton}
                          >
                            View
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={styles.noOrders}>
                        <p>No recent orders</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-cards" style={styles.mobileCards}>
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  style={styles.orderCard}
                >
                  <div style={styles.orderCardHeader}>
                    <span style={styles.orderId}>
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      background: getStatusColor(order.orderStatus)
                    }}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.orderCardBody}>
                    <div style={styles.orderCardRow}>
                      <span style={styles.orderCardLabel}>Customer:</span>
                      <span style={styles.orderCardValue}>
                        {order.user ? order.user.name : 'Guest'}
                      </span>
                    </div>
                    <div style={styles.orderCardRow}>
                      <span style={styles.orderCardLabel}>Items:</span>
                      <span style={styles.orderCardValue}>{order.items.length} items</span>
                    </div>
                    <div style={styles.orderCardRow}>
                      <span style={styles.orderCardLabel}>Total:</span>
                      <span style={styles.orderCardValue}>₹{order.totalAmount}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    style={styles.viewButtonMobile}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div style={styles.noOrders}>
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};


const styles = {
  container: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden'
  },
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    transition: 'all 0.3s ease'
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statInfo: {
    flex: 1
  },
  statTitle: {
    fontSize: '0.9rem',
    color: '#636e72',
    marginBottom: '0.3rem'
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: 0
  },
  recentOrders: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1.5rem'
  },
  desktopTable: {
    display: 'block'
  },
  mobileCards: {
    display: 'none'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px'
  },
  tableHeader: {
    background: '#f8f9fa',
    borderRadius: '10px'
  },
  tableHeaderCell: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#2d3436',
    fontSize: '0.95rem'
  },
  tableRow: {
    borderBottom: '1px solid #dfe6e9'
  },
  tableCell: {
    padding: '1rem',
    fontSize: '0.95rem',
    color: '#2d3436'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  viewButton: {
    padding: '0.5rem 1rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  noOrders: {
    textAlign: 'center',
    padding: '3rem',
    color: '#636e72'
  },
  // Mobile Card Styles
  orderCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '1.2rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.8rem',
    borderBottom: '1px solid #dfe6e9'
  },
  orderId: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  orderCardBody: {
    marginBottom: '1rem'
  },
  orderCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.9rem'
  },
  orderCardLabel: {
    color: '#636e72',
    fontWeight: '500'
  },
  orderCardValue: {
    color: '#2d3436',
    fontWeight: '600'
  },
  viewButtonMobile: {
    width: '100%',
    padding: '0.8rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600'
  }
};


// Add CSS media queries using style tag
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Tablet View */
  @media screen and (max-width: 968px) {
    .admin-dashboard-container {
      padding: 1rem;
    }
  }

  /* Mobile View */
  @media screen and (max-width: 768px) {
    .desktop-table {
      display: none !important;
    }
    .mobile-cards {
      display: block !important;
    }
  }
`;
document.head.appendChild(styleSheet);


export default AdminDashboard;
