import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiPackage, FiTruck, FiCheck, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';


const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [dialog, setDialog] = useState({
    show: false,
    type: 'confirm', // 'confirm', 'success', or 'error'
    title: '',
    message: '',
    newStatus: ''
  });


  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchOrderDetails();
  }, [id]);


  useEffect(() => {
    if (dialog.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [dialog.show]);


  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };


  const showDialog = (type, title, message, newStatus = '') => {
    setDialog({
      show: true,
      type,
      title,
      message,
      newStatus
    });
  };


  const closeDialog = () => {
    setDialog({ ...dialog, show: false });
  };


  const updateOrderStatus = async (newStatus) => {
    // Show confirmation dialog
    showDialog('confirm', 'Confirm Status Change', `Are you sure you want to change order status to ${newStatus}?`, newStatus);
  };


  const handleConfirmUpdate = async () => {
    const newStatus = dialog.newStatus;
    closeDialog();
    setUpdating(true);

    try {
      const token = localStorage.getItem('adminToken');
      await api.patch(`/admin/orders/${id}/status`, {
        orderStatus: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchOrderDetails();
      
      // Show success dialog
      setTimeout(() => {
        showDialog('success', 'Status Updated', 'Order status updated successfully!');
      }, 300);
      
    } catch (error) {
      console.error('Error updating order:', error);
      // Show error dialog
      setTimeout(() => {
        showDialog('error', 'Update Failed', error.response?.data?.message || 'Failed to update order status');
      }, 300);
    } finally {
      setUpdating(false);
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


  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return <FiPackage size={20} />;
      case 'shipped': return <FiTruck size={20} />;
      case 'delivered': return <FiCheck size={20} />;
      case 'cancelled': return <FiX size={20} />;
      default: return <FiPackage size={20} />;
    }
  };


  const getTimelineSteps = (currentStatus) => {
    // Define all possible timeline steps
    const allSteps = [
      { id: 'placed', label: 'Order Placed', status: 'placed' },
      { id: 'processing', label: 'Processing', status: 'processing' },
      { id: 'shipped', label: 'Shipped', status: 'shipped' },
      { id: 'delivered', label: 'Delivered', status: 'delivered' }
    ];

    if (currentStatus === 'cancelled') {
      // If cancelled, show only: Order Placed -> Processing -> Cancelled
      return [
        { id: 'placed', label: 'Order Placed', status: 'placed', color: '#d63031', showLine: true },
        { id: 'processing', label: 'Processing', status: 'processing', color: '#d63031', showLine: true },
        { id: 'cancelled', label: 'Order Cancelled', status: 'cancelled', color: '#d63031', showLine: false }
      ];
    }

    // For non-cancelled orders, show steps up to current status
    const statusOrder = ['placed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    return allSteps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.status);
      const isCompleted = stepIndex <= currentIndex;
      const showLine = index < allSteps.length - 1; // Show line for all except last
      
      return {
        ...step,
        color: isCompleted ? '#00b894' : '#dfe6e9',
        showLine,
        lineColor: stepIndex < currentIndex ? '#00b894' : '#dfe6e9'
      };
    });
  };


  const getDialogIcon = () => {
    const iconSize = 60;
    if (dialog.type === 'success') {
      return <FiCheckCircle size={iconSize} color="#00b894" />;
    } else if (dialog.type === 'error') {
      return <FiXCircle size={iconSize} color="#d63031" />;
    }
    return null;
  };


  const getDialogColors = () => {
    if (dialog.type === 'success') {
      return { bg: '#e8f5e9', border: '#00b894', btnBg: '#00b894' };
    } else if (dialog.type === 'error') {
      return { bg: '#fff5f5', border: '#d63031', btnBg: '#d63031' };
    } else {
      return { bg: '#fff9e6', border: '#fdcb6e', btnBg: '#d63031' };
    }
  };


  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loader}>Loading...</div>
      </AdminLayout>
    );
  }


  if (!order) {
    return (
      <AdminLayout>
        <div style={styles.error}>Order not found</div>
      </AdminLayout>
    );
  }


  const customer = order.user || order.guestInfo;
  const timelineSteps = getTimelineSteps(order.orderStatus);


  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/admin/orders')}
          style={styles.backButton}
        >
          <FiArrowLeft size={20} />
          Back to Orders
        </motion.button>


        <div style={styles.container}>
          {/* Order Info */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.mainSection}
          >
            {/* Order Header */}
            <div style={styles.orderHeader}>
              <div>
                <h1 style={styles.orderId}>
                  Order #{order._id.slice(-8).toUpperCase()}
                </h1>
                <p style={styles.orderDate}>{formatDate(order.createdAt)}</p>
              </div>
              <div style={{
                ...styles.statusBadge,
                background: getStatusColor(order.orderStatus)
              }}>
                {getStatusIcon(order.orderStatus)}
                {order.orderStatus.toUpperCase()}
              </div>
            </div>


            {/* Customer Details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={styles.customerSection}
            >
              <h3 style={styles.sectionTitle}>Customer Details</h3>
              <div style={styles.customerGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <FiMail size={18} color="#d63031" />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Name</p>
                    <p style={styles.detailValue}>{customer.name}</p>
                  </div>
                </div>


                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <FiMail size={18} color="#d63031" />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Email</p>
                    <p style={styles.detailValue}>{customer.email}</p>
                  </div>
                </div>


                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <FiPhone size={18} color="#d63031" />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Phone</p>
                    <p style={styles.detailValue}>{customer.phone}</p>
                  </div>
                </div>


                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>
                    <FiMapPin size={18} color="#d63031" />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Delivery Address</p>
                    <p style={styles.detailValue}>
                      {customer.address?.street}, {customer.address?.city}<br />
                      {customer.address?.state} - {customer.address?.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>


            {/* Order Items */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={styles.itemsSection}
            >
              <h3 style={styles.sectionTitle}>Order Items</h3>
              <div style={styles.itemsList}>
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    style={styles.itemCard}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.itemImage}
                    />
                    <div style={styles.itemInfo}>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <p style={styles.itemMeta}>
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p style={styles.itemQuantity}>Quantity: {item.quantity}</p>
                    </div>
                    <div style={styles.itemPricing}>
                      <p style={styles.itemPrice}>₹{item.price}</p>
                      <p style={styles.itemTotal}>
                        Total: ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>


              {/* Order Summary */}
              <div style={styles.orderSummary}>
                <div style={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Tax (included):</span>
                  <span>₹{Math.round(order.totalAmount * 0.18)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Delivery:</span>
                  <span style={{ color: '#00b894' }}>FREE</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total Amount:</span>
                  <span style={styles.totalAmount}>₹{order.totalAmount}</span>
                </div>
              </div>


              {/* Payment Info */}
              <div style={styles.paymentInfo}>
                <span>Payment Method:</span>
                <span style={styles.paymentMethod}>Cash on Delivery (COD)</span>
              </div>
            </motion.div>
          </motion.div>


          {/* Sidebar - Status Update */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={styles.sidebar}
          >
            <div style={styles.statusCard}>
              <h3 style={styles.sidebarTitle}>Update Order Status</h3>
              <p style={styles.statusDescription}>
                Change order status and notify customer via email
              </p>


              <div style={styles.statusButtons}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateOrderStatus('processing')}
                  disabled={updating || order.orderStatus === 'processing'}
                  style={{
                    ...styles.statusButton,
                    background: '#667eea',
                    opacity: order.orderStatus === 'processing' ? 0.5 : 1,
                    cursor: order.orderStatus === 'processing' || updating ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FiPackage size={18} />
                  Processing
                </motion.button>


                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateOrderStatus('shipped')}
                  disabled={updating || order.orderStatus === 'shipped'}
                  style={{
                    ...styles.statusButton,
                    background: '#0984e3',
                    opacity: order.orderStatus === 'shipped' ? 0.5 : 1,
                    cursor: order.orderStatus === 'shipped' || updating ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FiTruck size={18} />
                  Shipped
                </motion.button>


                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateOrderStatus('delivered')}
                  disabled={updating || order.orderStatus === 'delivered'}
                  style={{
                    ...styles.statusButton,
                    background: '#00b894',
                    opacity: order.orderStatus === 'delivered' ? 0.5 : 1,
                    cursor: order.orderStatus === 'delivered' || updating ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FiCheck size={18} />
                  Delivered
                </motion.button>


                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateOrderStatus('cancelled')}
                  disabled={updating || order.orderStatus === 'cancelled'}
                  style={{
                    ...styles.statusButton,
                    background: '#d63031',
                    opacity: order.orderStatus === 'cancelled' ? 0.5 : 1,
                    cursor: order.orderStatus === 'cancelled' || updating ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FiX size={18} />
                  Cancelled
                </motion.button>
              </div>


              {updating && (
                <div style={styles.updatingText}>Updating...</div>
              )}


              {/* Order Timeline */}
              <div style={styles.timeline}>
                <h4 style={styles.timelineTitle}>Order Timeline</h4>
                
                {timelineSteps.map((step, index) => (
                  <div key={step.id} style={styles.timelineItem}>
                    <div style={styles.timelineDotContainer}>
                      <div style={{ 
                        ...styles.timelineDot, 
                        background: step.color,
                        border: `3px solid white`,
                        boxShadow: `0 2px 8px ${step.color}40`
                      }} />
                      {step.showLine && (
                        <div style={{
                          ...styles.timelineLine,
                          background: step.lineColor || step.color
                        }} />
                      )}
                    </div>
                    <div>
                      <p style={styles.timelineLabel}>{step.label}</p>
                      <p style={styles.timelineDate}>
                        {step.id === 'placed' ? formatDate(order.createdAt) :
                         step.id === order.orderStatus ? 'Current' :
                         step.color === '#00b894' ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>


      {/* Confirmation/Success/Error Dialog */}
      <AnimatePresence>
        {dialog.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dialog.type !== 'confirm' ? closeDialog : null}
              style={styles.dialogOverlay}
            />

            <motion.div
              initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              animate={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
              exit={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={{
                ...styles.dialogBox,
                background: getDialogColors().bg,
                borderColor: getDialogColors().border
              }}
            >
              {dialog.type !== 'confirm' && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeDialog}
                  style={styles.dialogCloseButton}
                >
                  <FiX size={20} />
                </motion.button>
              )}

              {dialog.type !== 'confirm' && (
                <motion.div
                  animate={{ 
                    scale: dialog.type === 'success' ? [1, 1.2, 1] : [1, 0.8, 1],
                    rotate: dialog.type === 'success' ? [0, 10, -10, 0] : [0, -10, 10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                  style={styles.dialogIcon}
                >
                  {getDialogIcon()}
                </motion.div>
              )}

              <h2 style={styles.dialogTitle}>{dialog.title}</h2>
              <p style={styles.dialogMessage}>{dialog.message}</p>

              {dialog.type === 'confirm' ? (
                <div style={styles.dialogButtons}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeDialog}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmUpdate}
                    style={{
                      ...styles.confirmButton,
                      background: getDialogColors().btnBg
                    }}
                  >
                    Confirm
                  </motion.button>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeDialog}
                    style={{
                      ...styles.dialogButton,
                      background: getDialogColors().btnBg
                    }}
                  >
                    OK
                  </motion.button>

                  {dialog.type === 'success' && (
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                      style={{
                        ...styles.progressBar,
                        background: getDialogColors().btnBg
                      }}
                      onAnimationComplete={closeDialog}
                    />
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    alignItems: 'start'
  },
  mainSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  orderHeader: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  orderId: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  orderDate: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.8rem 1.5rem',
    borderRadius: '25px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  customerSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1.5rem'
  },
  customerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  detailItem: {
    display: 'flex',
    gap: '1rem'
  },
  detailIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#fff5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: '#636e72',
    marginBottom: '0.3rem'
  },
  detailValue: {
    fontSize: '0.95rem',
    color: '#2d3436',
    fontWeight: '500'
  },
  itemsSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem'
  },
  itemCard: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr auto',
    gap: '1.5rem',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '12px'
  },
  itemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3436'
  },
  itemMeta: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  itemQuantity: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  itemPricing: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  itemPrice: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#667eea'
  },
  itemTotal: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  orderSummary: {
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '1rem'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.8rem',
    fontSize: '1rem',
    color: '#636e72'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    marginTop: '1rem',
    borderTop: '2px solid #dfe6e9',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  totalAmount: {
    fontSize: '1.5rem',
    color: '#d63031'
  },
  paymentInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    background: '#fff9e6',
    borderRadius: '10px',
    border: '2px dashed #fdcb6e'
  },
  paymentMethod: {
    fontWeight: 'bold',
    color: '#2d3436'
  },
  sidebar: {
    position: 'sticky',
    top: '2rem'
  },
  statusCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
  },
  sidebarTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  statusDescription: {
    fontSize: '0.9rem',
    color: '#636e72',
    marginBottom: '2rem'
  },
  statusButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statusButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    padding: '1rem',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  updatingText: {
    textAlign: 'center',
    color: '#636e72',
    fontSize: '0.9rem',
    marginBottom: '1rem'
  },
  timeline: {
    paddingTop: '2rem',
    borderTop: '1px solid #dfe6e9'
  },
  timelineTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1.5rem'
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    position: 'relative'
  },
  timelineDotContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative'
  },
  timelineDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    flexShrink: 0,
    zIndex: 1
  },
  timelineLine: {
    width: '3px',
    height: '40px',
    marginTop: '4px',
    flexShrink: 0
  },
  timelineLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: '0.2rem'
  },
  timelineDate: {
    fontSize: '0.85rem',
    color: '#636e72'
  },
  // Dialog Styles
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9998,
    backdropFilter: 'blur(8px)'
  },
  dialogBox: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '25px',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    border: '4px solid'
  },
  dialogCloseButton: {
    position: 'absolute',
    top: '0.8rem',
    right: '0.8rem',
    background: 'transparent',
    border: 'none',
    color: '#636e72',
    cursor: 'pointer',
    padding: '0.5rem'
  },
  dialogIcon: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center'
  },
  dialogTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  dialogMessage: {
    fontSize: '1.1rem',
    color: '#636e72',
    marginBottom: '1.5rem',
    lineHeight: 1.6
  },
  dialogButtons: {
    display: 'flex',
    gap: '1rem'
  },
  cancelButton: {
    flex: 1,
    padding: '1rem',
    background: 'white',
    color: '#636e72',
    border: '2px solid #dfe6e9',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  confirmButton: {
    flex: 1,
    padding: '1rem',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  dialogButton: {
    width: '100%',
    padding: '1rem',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  progressBar: {
    height: '5px',
    borderRadius: '3px',
    marginTop: '1rem'
  }
};


const mediaQuery = window.matchMedia('(max-width: 968px)');
if (mediaQuery.matches) {
  styles.container.gridTemplateColumns = '1fr';
  styles.sidebar.position = 'relative';
  styles.sidebar.top = 'auto';
  styles.itemCard.gridTemplateColumns = '80px 1fr';
  styles.itemPricing.flexDirection = 'row';
  styles.itemPricing.justifyContent = 'space-between';
  styles.itemPricing.gridColumn = '1 / -1';
}


export default AdminOrderDetail;
