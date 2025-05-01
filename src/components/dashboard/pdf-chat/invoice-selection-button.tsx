// Button to choose who to invoice
// Shows unselected if no one is chosen
// When clicked shows a modal to choose who to invoice
// When a customer is chosen, the button shows the customer's name
// As well as current balance based on the current chat

/*

<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 2,
    border: '1px solid var(--mui-palette-divider)',
    borderRadius: '4px',
    mb: 2,
    cursor: 'pointer',
  }}
  onClick={() => setInvoiceModalOpen(true)}
>
  <Typography variant="h6">Invoicing: {currentCustomer.name}</Typography>
  <Typography variant="body2">Time Billed: {currentCustomer.timeBilled} hrs</Typography>
</Box>

<Modal
  open={invoiceModalOpen}
  onClose={() => setInvoiceModalOpen(false)}
  aria-labelledby="invoice-modal-title"
  aria-describedby="invoice-modal-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
    }}
  >
    <Typography id="invoice-modal-title" variant="h6" component="h2">
      Select Customer to Invoice
    </Typography>
    <List>
      {customers.map((customer) => (
        <ListItem button key={customer.id} onClick={() => handleCustomerSelect(customer)}>
          <ListItemText primary={customer.name} />
        </ListItem>
      ))}
    </List>
  </Box>
</Modal>

*/
