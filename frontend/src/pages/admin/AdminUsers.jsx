import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (search) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Users Management</h1>
          <div style={styles.searchBox}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.usersGrid}>
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              onClick={() => navigate(`/admin/users/${user._id}`)}
              style={styles.userCard}
            >
              <div style={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.name}</h3>
                <div style={styles.userDetail}>
                  <FiMail size={14} color="#636e72" />
                  <span>{user.email}</span>
                </div>
                <div style={styles.userDetail}>
                  <FiPhone size={14} color="#636e72" />
                  <span>{user.phone}</span>
                </div>
                {user.address && (
                  <div style={styles.userDetail}>
                    <FiMapPin size={14} color="#636e72" />
                    <span>{user.address.city}, {user.address.state}</span>
                  </div>
                )}
                <div style={styles.joinedDate}>
                  Joined: {formatDate(user.createdAt)}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={styles.viewDetailsButton}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/users/${user._id}`);
                }}
              >
                View Details
              </motion.button>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div style={styles.noResults}>
            <h3>No users found</h3>
            <p>Try adjusting your search</p>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '50px',
    padding: '0.8rem 1.5rem',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    minWidth: '300px'
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
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  userCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  userAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 auto'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.8rem',
    textAlign: 'center'
  },
  userDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#636e72',
    marginBottom: '0.5rem'
  },
  joinedDate: {
    fontSize: '0.85rem',
    color: '#b2bec3',
    marginTop: '0.5rem',
    textAlign: 'center'
  },
  viewDetailsButton: {
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

export default AdminUsers;
