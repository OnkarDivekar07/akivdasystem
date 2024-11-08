const Repayment=require('../models/repayments')



exports.getrepayment= async (req, res) => {
    try {
      const repayments = await Repayment.findAll();  // Get all repayments
      res.status(200).json(repayments);  // Return repayments as JSON
    } catch (err) {
      res.status(500).json({ message: 'Error fetching repayments', error: err.message });
    }
  }

  exports.getsinglerepayment=async (req, res) => {
    try {
      const repaymentId = req.params.id;
      const repayment = await Repayment.findByPk(repaymentId);  // Find repayment by ID
      
      if (!repayment) {
        return res.status(404).json({ message: 'Repayment not found' });  // Return 404 if not found
      }
  
      res.status(200).json(repayment);  // Return the repayment as JSON
    } catch (err) {
      res.status(500).json({ message: 'Error fetching repayment', error: err.message });
    }
  }
  
  exports.postrepayment= async (req, res) => {
    try {
      const { supplierName, contactDetails, amountOwed, dueDate } = req.body;
  
      // Validation: Ensure all fields are provided
      if (!supplierName || !contactDetails || !amountOwed || !dueDate) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Create the repayment record
      const newRepayment = await Repayment.create({
        supplierName,
        contactDetails,
        amountOwed,
        dueDate
      });
  
      res.status(201).json(newRepayment);  // Return the newly created repayment
    } catch (err) {
      res.status(500).json({ message: 'Error creating repayment', error: err.message });
    }
  }


  exports.updaterepayment=async (req, res) => {
    try {
      const repaymentId = req.params.id;
      const { supplierName, contactDetails, amountOwed, dueDate } = req.body;
  
      // Find the repayment record by ID
      const repayment = await Repayment.findByPk(repaymentId);
      
      if (!repayment) {
        return res.status(404).json({ message: 'Repayment not found' });
      }
  
      // Update repayment fields if provided
      repayment.supplierName = supplierName || repayment.supplierName;
      repayment.contactDetails = contactDetails || repayment.contactDetails;
      repayment.amountOwed = amountOwed || repayment.amountOwed;
      repayment.dueDate = dueDate || repayment.dueDate;
  
      await repayment.save();  // Save the updated repayment
  
      res.status(200).json(repayment);  // Return the updated repayment
    } catch (err) {
      res.status(500).json({ message: 'Error updating repayment', error: err.message });
    }
  }


 exports.deleteRepayment =async (req, res) => {
    try {
      const repaymentId = req.params.id;
  
      // Find the repayment record by ID
      const repayment = await Repayment.findByPk(repaymentId);
      
      if (!repayment) {
        return res.status(404).json({ message: 'Repayment not found' });
      }
  
      // Delete the repayment record
      await repayment.destroy();
  
      res.status(200).json({ message: 'Repayment deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting repayment', error: err.message });
    }
  }
  
  
  