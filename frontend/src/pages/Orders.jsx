import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiTruck, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedOrder]);


  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <FiClock size={24} color="#667eea" />;
      case 'shipped':
        return <FiTruck size={24} color="#0984e3" />;
      case 'delivered':
        return <FiCheck size={24} color="#00b894" />;
      case 'cancelled':
        return <FiX size={24} color="#d63031" />;
      default:
        return <FiPackage size={24} color="#636e72" />;
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return '#667eea';
      case 'shipped':
        return '#0984e3';
      case 'delivered':
        return '#00b894';
      case 'cancelled':
        return '#d63031';
      default:
        return '#636e72';
    }
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const getStatusSteps = (currentStatus) => {
    if (currentStatus === 'cancelled') {
      return [
        { label: 'Order Placed', status: 'processing', icon: FiPackage, completed: true },
        { label: 'Cancelled', status: 'cancelled', icon: FiX, completed: true, cancelled: true }
      ];
    }

    const steps = [
      { label: 'Order Placed', status: 'processing', icon: FiPackage },
      { label: 'Shipped', status: 'shipped', icon: FiTruck },
      { label: 'Delivered', status: 'delivered', icon: FiCheck }
    ];

    const statusOrder = ['processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };


  if (loading) return <Loader />;


  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div className="container">
          <h1 style={styles.title}>My Orders</h1>
          <p style={styles.subtitle}>Track and manage your orders</p>
        </div>
      </motion.div>


      <div className="container" style={styles.content}>
        {orders.length === 0 ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            style={styles.emptyCard}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={styles.emptyIcon}
            >
              📦
            </motion.div>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              style={styles.shopButton}
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div style={styles.ordersGrid}>
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                style={styles.orderCard}
                onClick={() => setSelectedOrder(order)}
              >
                {/* Order Header */}
                <div style={styles.orderHeader}>
                  <div style={styles.orderInfo}>
                    <h3 style={styles.orderId}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p style={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    style={styles.statusIcon}
                  >
                    {getStatusIcon(order.orderStatus)}
                  </motion.div>
                </div>


                {/* Status Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                  style={{
                    ...styles.statusBadge,
                    background: getStatusColor(order.orderStatus)
                  }}
                >
                  {order.orderStatus.toUpperCase()}
                </motion.div>


                {/* Order Items */}
                <div style={styles.orderItems}>
                  {order.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                      style={styles.orderItem}
                    >
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={item.image}
                        alt={item.name}
                        style={styles.itemImage}
                      />
                      <div style={styles.itemInfo}>
                        <h4 style={styles.itemName}>{item.name}</h4>
                        <p style={styles.itemMeta}>
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p style={styles.itemQuantity}>Qty: {item.quantity}</p>
                      </div>
                      <p style={styles.itemPrice}>₹{item.price}</p>
                    </motion.div>
                  ))}
                </div>


                {/* Order Footer */}
                <div style={styles.orderFooter}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.6, type: 'spring' }}
                    style={styles.totalAmount}
                  >
                    Total: ₹{order.totalAmount}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    style={styles.trackButton}
                  >
                    Track Order
                  </motion.button>
                </div>


                {/* Progress Bar */}
                <motion.div
                  style={{
                    ...styles.progressBar,
                    background: order.orderStatus === 'cancelled' 
                      ? '#d63031' 
                      : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      order.orderStatus === 'cancelled'
                        ? '100%'
                        : order.orderStatus === 'processing'
                        ? '33%'
                        : order.orderStatus === 'shipped'
                        ? '66%'
                        : order.orderStatus === 'delivered'
                        ? '100%'
                        : '0%'
                  }}
                  transition={{ delay: index * 0.1 + 0.7, duration: 1 }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>


      {/* Order Details Modal - CENTERED */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              style={styles.modalOverlay}
            />

            <motion.div
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
              exit={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={styles.modal}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedOrder(null)}
                  style={styles.closeButton}
                >
                  <FiX size={24} />
                </motion.button>
              </div>


              <p style={styles.modalDate}>{formatDate(selectedOrder.createdAt)}</p>


              {/* Delivery Status Tracker */}
              <div style={styles.statusTracker}>
                {getStatusSteps(selectedOrder.orderStatus).map((step, index) => (
                  <div key={step.status} style={styles.statusStep}>
                    <div style={styles.stepContent}>
                      {/* Dot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        style={{
                          ...styles.statusDot,
                          background: step.cancelled ? '#d63031' : (step.completed ? '#00b894' : '#dfe6e9'),
                          border: step.active ? `4px solid ${step.cancelled ? '#d63031' : '#00b894'}` : 'none',
                          boxShadow: step.active 
                            ? step.cancelled 
                              ? '0 0 20px rgba(214, 48, 49, 0.5)' 
                              : '0 0 20px rgba(0, 184, 148, 0.5)' 
                            : 'none'
                        }}
                      >
                        <step.icon size={20} color={step.completed ? 'white' : '#636e72'} />
                      </motion.div>


                      {/* Line connecting dots */}
                      {index < getStatusSteps(selectedOrder.orderStatus).length - 1 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '100%' }}
                          transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                          style={{
                            ...styles.statusLine,
                            background: step.cancelled 
                              ? '#d63031' 
                              : (step.completed && index < getStatusSteps(selectedOrder.orderStatus).findIndex(s => s.active)
                                ? '#00b894'
                                : '#dfe6e9')
                          }}
                        />
                      )}
                    </div>


                    {/* Label */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.1 }}
                      style={styles.stepLabel}
                    >
                      <h4 style={{
                        ...styles.stepTitle,
                        color: step.cancelled ? '#d63031' : (step.completed ? '#00b894' : '#636e72')
                      }}>
                        {step.label}
                      </h4>
                      {step.cancelled && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{...styles.stepSubtext, color: '#d63031'}}
                        >
                          ✗ Order Cancelled
                        </motion.p>
                      )}
                      {step.active && !step.cancelled && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={styles.stepSubtext}
                        >
                          In Progress
                        </motion.p>
                      )}
                      {step.completed && !step.active && !step.cancelled && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={styles.stepSubtext}
                        >
                          ✓ Completed
                        </motion.p>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>


              {/* Order Items in Modal */}
              <div style={styles.modalItems}>
                <h3 style={styles.itemsTitle}>Order Items</h3>
                {selectedOrder.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={styles.modalItem}
                  >
                    <img src={item.image} alt={item.name} style={styles.modalItemImage} />
                    <div style={styles.modalItemInfo}>
                      <h4>{item.name}</h4>
                      <p>Size: {item.size} | Color: {item.color}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <p style={styles.modalItemPrice}>₹{item.price}</p>
                  </motion.div>
                ))}
              </div>


              <div style={styles.modalTotal}>
                <span>Total Amount:</span>
                <span style={styles.modalTotalAmount}>₹{selectedOrder.totalAmount}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    paddingBottom: '4rem'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '3rem 0',
    marginBottom: '3rem'
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    textAlign: 'center',
    opacity: 0.9
  },
  content: {
    maxWidth: '1200px'
  },
  emptyCard: {
    background: 'white',
    padding: '4rem 3rem',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '0 auto'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem'
  },
  shopButton: {
    marginTop: '2rem',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  ordersGrid: {
    display: 'grid',
    gap: '2rem'
  },
  orderCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  orderInfo: {},
  orderId: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.3rem'
  },
  orderDate: {
    color: '#636e72',
    fontSize: '0.9rem'
  },
  statusIcon: {
    padding: '0.8rem',
    background: '#f8f9fa',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem'
  },
  orderItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  orderItem: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr auto',
    gap: '1rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '10px',
    alignItems: 'center'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem'
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3436'
  },
  itemMeta: {
    fontSize: '0.85rem',
    color: '#636e72'
  },
  itemQuantity: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  itemPrice: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #dfe6e9'
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  trackButton: {
    padding: '0.6rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '4px',
    borderRadius: '0 0 0 15px'
  },
  // Modal Styles - CENTERED
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10000,
    backdropFilter: 'blur(8px)'
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: 'white',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    zIndex: 10001,
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  modalTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#636e72',
    padding: '0.5rem'
  },
  modalDate: {
    color: '#636e72',
    fontSize: '0.95rem',
    marginBottom: '2rem'
  },
  // Status Tracker
  statusTracker: {
    padding: '2rem',
    background: '#f8f9fa',
    borderRadius: '15px',
    marginBottom: '2rem'
  },
  statusStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
    position: 'relative'
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative'
  },
  statusDot: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 2
  },
  statusLine: {
    width: '4px',
    minHeight: '60px',
    position: 'absolute',
    top: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1
  },
  stepLabel: {
    paddingTop: '0.8rem',
    paddingBottom: '1.5rem'
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '0.3rem'
  },
  stepSubtext: {
    fontSize: '0.85rem',
    color: '#636e72'
  },
  // Modal Items
  modalItems: {
    marginBottom: '1.5rem'
  },
  itemsTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  modalItem: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr auto',
    gap: '1rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '0.8rem',
    alignItems: 'center'
  },
  modalItemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  modalItemInfo: {
    fontSize: '0.9rem'
  },
  modalItemPrice: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  modalTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '10px',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  modalTotalAmount: {
    fontSize: '1.8rem',
    color: '#667eea'
  }
};


// Responsive
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
  styles.orderItem.gridTemplateColumns = '60px 1fr';
  styles.itemPrice.gridColumn = '1 / -1';
  styles.itemPrice.textAlign = 'right';
  styles.orderFooter.flexDirection = 'column';
  styles.orderFooter.alignItems = 'flex-start';
  styles.orderFooter.gap = '1rem';
  styles.modal.width = '95%';
  styles.modal.padding = '1.5rem';
  styles.modalTitle.fontSize = '1.5rem';
}


export default Orders;
