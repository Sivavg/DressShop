// const emailjs = require('@emailjs/nodejs');

// // Initialize EmailJS
// emailjs.init({
//   publicKey: process.env.EMAILJS_PUBLIC_KEY,
//   privateKey: process.env.EMAILJS_PRIVATE_KEY
// });

// // Send order confirmation email
// const sendOrderConfirmation = async (orderData) => {
//   const { email, name, orderId, items, totalAmount } = orderData;

//   // Create items list for email
//   const itemsList = items.map(item => 
//     `${item.name} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity} - ₹${item.price}`
//   ).join('\n');

//   const templateParams = {
//     to_email: email,
//     to_name: name,
//     order_id: orderId,
//     items_list: itemsList,
//     total_amount: totalAmount,
//     from_name: 'DressShop'
//   };

//   try {
//     const response = await emailjs.send(
//       process.env.EMAILJS_SERVICE_ID,
//       process.env.EMAILJS_ORDER_TEMPLATE,
//       templateParams
//     );
//     console.log('Order confirmation email sent:', response.status);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// // Send order status update email
// const sendOrderStatusUpdate = async (orderData) => {
//   const { email, name, orderId, status } = orderData;

//   const statusMessages = {
//     processing: 'Your order is being processed',
//     shipped: 'Your order has been shipped! 📦',
//     delivered: 'Your order has been delivered! 🎉',
//     cancelled: 'Your order has been cancelled'
//   };

//   const templateParams = {
//     to_email: email,
//     to_name: name,
//     order_id: orderId,
//     order_status: status.toUpperCase(),
//     status_message: statusMessages[status],
//     from_name: 'DressShop'
//   };

//   try {
//     const response = await emailjs.send(
//       process.env.EMAILJS_SERVICE_ID,
//       process.env.EMAILJS_STATUS_TEMPLATE,
//       templateParams
//     );
//     console.log('Order status update email sent:', response.status);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// module.exports = {
//   sendOrderConfirmation,
//   sendOrderStatusUpdate
// };
