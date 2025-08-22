// Digital signature functionality
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hasSignature = false;

// Make.com webhook URL - UPDATE THIS WITH YOUR ACTUAL WEBHOOK URL
const WEBHOOK_URL = 'https://hook.eu2.make.com/em6i6rh7dh7x5htpyn7wqczpefxqz18d';

// Set canvas size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2c3e50';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Initialize canvas
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
    hasSignature = true;
}

function draw(e) {
    if (!isDrawing) return;
    
    const [currentX, currentY] = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    [lastX, lastY] = [currentX, currentY];
}

function stopDrawing() {
    isDrawing = false;
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return [clientX - rect.left, clientY - rect.top];
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
        e.type === 'touchstart' ? 'mousedown' : 
        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function clearSignature() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
}

// Set today's date as default
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    document.getElementById('contractDate').valueAsDate = today;
    document.getElementById('providerDate').textContent = formattedDate;
    
    // Check for URL parameters to populate fields
    checkForURLParameters();
});

// Function to check for URL parameters and populate fields
function checkForURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const contractData = {};
    
    // Get all URL parameters
    for (const [key, value] of urlParams.entries()) {
        contractData[key] = decodeURIComponent(value);
    }
    
    // If we have contract data, populate the form
    if (Object.keys(contractData).length > 0) {
        populateContract(contractData);
    }
}

// Validate form before submission
function validateForm() {
    const clientName = document.getElementById('clientPrintName').value.trim();
    const contractDate = document.getElementById('contractDate').value;
    
    if (!clientName) {
        alert('Please enter your full name.');
        return false;
    }
    
    if (!contractDate) {
        alert('Please select a contract date.');
        return false;
    }
    
    if (!hasSignature) {
        alert('Please provide your digital signature.');
        return false;
    }
    
    return true;
}

// Generate PDF
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // Hide interactive elements for PDF generation
    const elementsToHide = document.querySelectorAll('.signature-buttons, .btn-submit');
    elementsToHide.forEach(el => el.style.display = 'none');
    
    // Generate canvas from the contract
    const contractElement = document.querySelector('.contract-container');
    const canvas = await html2canvas(contractElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    });
    
    // Show hidden elements again
    elementsToHide.forEach(el => el.style.display = '');
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    return pdf;
}

// Submit contract to webhook
async function submitContract() {
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitContract');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const submitText = document.getElementById('submitText');
    
    submitBtn.disabled = true;
    loadingSpinner.style.display = 'inline-block';
    submitText.textContent = 'Submitting...';
    
    try {
        // Generate PDF
        const pdf = await generatePDF();
        const pdfBlob = pdf.output('blob');
        
        // Get form data
        const clientName = document.getElementById('clientPrintName').value.trim();
        const contractDate = document.getElementById('contractDate').value;
        const signatureData = canvas.toDataURL();
        
        // Get client company name from placeholder
        const clientCompanyElement = document.querySelector('[data-field="clientCompanyName"]');
        const clientCompany = clientCompanyElement ? clientCompanyElement.textContent.replace('[CLIENT COMPANY NAME]', 'Not Specified') : 'Not Specified';
        
        // Collect all contract data for webhook
        const contractData = {
            clientName: clientName,
            clientCompany: clientCompany,
            contractDate: contractDate,
            submissionDateTime: new Date().toISOString(),
            signatureData: signatureData
        };
        
        // Add all field placeholder values
        document.querySelectorAll('.field-placeholder').forEach(element => {
            const field = element.getAttribute('data-field');
            if (field) {
                contractData[field] = element.textContent;
            }
        });
        
        // Create form data for webhook
        const formData = new FormData();
        formData.append('pdf', pdfBlob, `Master_Service_Agreement_${clientName.replace(/\s+/g, '_')}_${contractDate}.pdf`);
        
        // Add all contract data as JSON
        formData.append('contractData', JSON.stringify(contractData));
        
        // Send to webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Store PDF for download
            window.contractPDF = pdf;
            window.clientName = clientName;
            window.contractDate = contractDate;
            
            // Show success modal
            showSuccessModal();
        } else {
            throw new Error('Failed to submit contract');
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('There was an error submitting your contract. Please try again or contact support.');
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        loadingSpinner.style.display = 'none';
        submitText.textContent = 'Submit Signed Contract';
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Download PDF
function downloadPDF() {
    if (window.contractPDF) {
        const filename = `Master_Service_Agreement_${window.clientName.replace(/\s+/g, '_')}_${window.contractDate}.pdf`;
        window.contractPDF.save(filename);
    }
}

// Function to populate contract with form data
function populateContract(formData) {
    document.querySelectorAll('.field-placeholder').forEach(element => {
        const field = element.getAttribute('data-field');
        if (formData && formData[field]) {
            if (field === 'paymentTerms') {
                element.textContent = formData[field];
            } else if (field === 'warrantyPeriod') {
                element.textContent = formData[field];
            } else if (field === 'agreementDuration') {
                element.textContent = formData[field];
            } else if (field === 'liabilityCap') {
                element.textContent = formData[field];
            } else if (field === 'additionalNotes') {
                element.textContent = formData[field] || 'No additional requirements specified.';
            } else {
                element.textContent = formData[field];
            }
        } else if (field === 'clientRegistration') {
            element.textContent = 'Not provided';
        } else if (field === 'additionalNotes') {
            element.textContent = 'No additional requirements specified.';
        }
    });
    
    // Populate services if provided
    if (formData && formData.services && formData.services.length > 0) {
        const servicesContainer = document.getElementById('selectedServices');
        servicesContainer.innerHTML = '';
        
        // Handle both array and comma-separated string
        const services = Array.isArray(formData.services) 
            ? formData.services 
            : formData.services.split(',').map(s => s.trim());
            
        services.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'service-item';
            serviceElement.textContent = service;
            servicesContainer.appendChild(serviceElement);
        });
    }
    
    // Pre-fill client name if provided
    if (formData && formData.clientContact) {
        document.getElementById('clientPrintName').value = formData.clientContact;
    }
}

// Make function available globally for Make.com integration
window.populateContract = populateContract;

// Function to handle Make.com webhook data (if sent via postMessage)
window.addEventListener('message', function(event) {
    // Verify origin for security (update with your domain)
    if (event.origin !== window.location.origin) {
        return;
    }
    
    if (event.data && event.data.type === 'populateContract') {
        populateContract(event.data.contractData);
    }
});
