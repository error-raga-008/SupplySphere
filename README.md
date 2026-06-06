# SupplySphere

## Procurement & Vendor Management ERP

SupplySphere is a modern Procurement and Vendor Management platform developed for the VendorBridge Odoo Hackathon.

The platform streamlines the complete procurement lifecycle, enabling organizations to manage RFQs, vendors, quotations, approvals, purchase orders, invoices, notifications, analytics, and audit logs through a centralized ERP system.

---

# Features

## Authentication & Security

* JWT Authentication
* Access Token & Refresh Token Support
* Role-Based Access Control (RBAC)
* Protected Routes
* Protected APIs
* Password Strength Validation
* Email Validation
* Secure Session Management

---

## User Roles

### Admin

* Full System Access
* User Management
* Vendor Management
* Analytics Access
* Activity Log Access
* Role Management

### Procurement Officer

* Create RFQs
* Publish RFQs
* Manage Vendors
* Compare Quotations
* Generate Purchase Orders
* Generate Invoices

### Manager

* Approve Quotations
* Reject Quotations
* Monitor Procurement Activities

### Vendor

* View Assigned RFQs
* Submit Quotations
* Track Quotation Status
* View Purchase Orders

---

# Procurement Workflow

```text
RFQ Creation
      ↓
RFQ Publication
      ↓
Vendor Assignment
      ↓
Quotation Submission
      ↓
Quotation Comparison
      ↓
Approval Workflow
      ↓
Purchase Order Generation
      ↓
Invoice Generation
      ↓
Invoice Print / Email
      ↓
Reports & Analytics
      ↓
Activity Tracking
```

---

# Core Modules

## RFQ Management

* Create RFQs
* Draft RFQs
* Publish RFQs
* Multiple Line Items
* Attachment Upload
* Submission Deadline
* Delivery Deadline
* RFQ Status Tracking

---

## Vendor Management

* Vendor Registration
* Vendor Categorization
* GST Tracking
* Contact Management
* Vendor Status Management
* Vendor Search & Filtering

---

## Quotation Management

* Vendor Quotation Submission
* Quotation Attachments
* Delivery Timeline Tracking
* Quotation Status Management
* Quotation Comparison

---

## Approval Workflow

* Submit Quotation for Approval
* Approve Quotations
* Reject Quotations
* Approval History
* Approval Notifications

---

## Purchase Orders

* Automatic PO Generation
* PO Status Tracking
* Vendor Association
* Procurement Tracking

---

## Invoice Management

* Invoice Generation
* Invoice Tracking
* Print Support
* Email Support

---

## Notifications

* Real-Time Notifications
* Unread Count
* Read / Unread Status
* Floating Notification Panel

Examples:

* RFQ Published
* Vendor Assigned
* Quotation Submitted
* Approval Completed
* Purchase Order Generated
* Invoice Generated

---

## Activity Logs

Admin-only access.

Tracks:

* Login
* Logout
* RFQ Creation
* Vendor Management
* Quotation Submission
* Approvals
* Purchase Orders
* Invoice Generation
* Email Activities

---

## Dashboard & Analytics

* RFQ Statistics
* Vendor Statistics
* Quotation Statistics
* Purchase Order Statistics
* Invoice Statistics
* Procurement Trends
* Vendor Performance Metrics

---

# Search, Filtering & Pagination

Implemented across all major modules:

* RFQs
* Vendors
* Quotations
* Purchase Orders
* Invoices
* Activity Logs

Features:

* Search
* Advanced Filtering
* Sorting
* Server-Side Pagination
* Export Support

---

# Technology Stack

## Frontend

* React
* Vite
* Axios
* React Router

## Backend

* Django
* Django REST Framework
* JWT Authentication
* Role-Based Permissions

## Database

* MySQL

---

# Project Structure

```bash
SupplySphere/
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── assets/
│
├── backend/
│   ├── core/
│   ├── backend/
│   ├── database/
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd SupplySphere
```

---

## Backend Setup

Create Virtual Environment

```bash
python -m venv venv
```

Activate Environment

Windows:

```bash
venv\Scripts\activate
```

Linux / Mac:

```bash
source venv/bin/activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Database Setup

Create MySQL Database

```sql
CREATE DATABASE supplysphere;
```

Import Schema

```bash
mysql -u root -p supplysphere < database/supplysphere_schema.sql
```

Configure Environment Variables

Create:

```text
.env
```

Example:

```env
MYSQL_DATABASE=supplysphere
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_HOST=localhost
MYSQL_PORT=3306

SECRET_KEY=your-secret-key
```

---

## Run Backend

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

Navigate to Frontend

```bash
cd frontend
```

Install Dependencies

```bash
npm install
```

Run Development Server

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# API Documentation

Swagger Documentation:

```text
/api/docs/
```

OpenAPI Schema:

```text
/api/schema/
```

---

# Security Features

* JWT Authentication
* Refresh Token Rotation
* Protected APIs
* Role-Based Permissions
* Password Validation
* Email Validation
* Input Sanitization
* Server-Side Validation
* Activity Logging

---

# Future Enhancements

* Email Notifications
* PDF Invoice Export
* Vendor Performance Scoring
* Procurement Forecasting
* Advanced Analytics
* Multi-Organization Support
* Real-Time WebSocket Notifications

---

# Team

Developed as part of the VendorBridge Odoo Hackathon.

SupplySphere aims to provide a scalable, secure, and user-friendly procurement management solution inspired by modern ERP platforms.

---

# License

This project is developed for educational and hackathon purposes.
