-- ============================================================
--  SupplySphere – Non-managed tables
--  (Managed tables are created by Django migrations)
-- ============================================================

-- ============================================================
-- VENDOR MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS vendor_categories (
    id          SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS vendors (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT UNSIGNED,
    category_id      SMALLINT UNSIGNED,
    company_name     VARCHAR(200)  NOT NULL,
    contact_person   VARCHAR(150),
    email            VARCHAR(255)  NOT NULL UNIQUE,
    phone            VARCHAR(20),
    address          TEXT,
    city             VARCHAR(100),
    state            VARCHAR(100),
    country          VARCHAR(100)  NOT NULL DEFAULT 'India',
    pincode          VARCHAR(20),
    gst_number       VARCHAR(20),
    pan_number       VARCHAR(20),
    bank_name        VARCHAR(150),
    bank_account_no  VARCHAR(50),
    bank_ifsc        VARCHAR(20),
    status           ENUM('active','inactive','blacklisted') NOT NULL DEFAULT 'active',
    rating           DECIMAL(3,2)  DEFAULT NULL,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vendor_user     FOREIGN KEY (user_id)     REFERENCES users(id)             ON DELETE SET NULL,
    CONSTRAINT fk_vendor_category FOREIGN KEY (category_id) REFERENCES vendor_categories(id) ON DELETE SET NULL
);

-- ============================================================
-- RFQ (Request For Quotation)
-- ============================================================

CREATE TABLE IF NOT EXISTS rfqs (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rfq_number          VARCHAR(30)   NOT NULL UNIQUE,
    title               VARCHAR(255)  NOT NULL,
    description         TEXT,
    created_by          BIGINT UNSIGNED NOT NULL,
    status              ENUM('draft','published','closed','cancelled') NOT NULL DEFAULT 'draft',
    submission_deadline DATETIME      NOT NULL,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rfq_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rfq_items (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rfq_id          INT UNSIGNED   NOT NULL,
    item_name       VARCHAR(255)   NOT NULL,
    description     TEXT,
    quantity        DECIMAL(12,3)  NOT NULL,
    unit            VARCHAR(50),
    estimated_price DECIMAL(14,2)  DEFAULT NULL,
    CONSTRAINT fk_rfqitem_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rfq_attachments (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rfq_id      INT UNSIGNED  NOT NULL,
    file_name   VARCHAR(255)  NOT NULL,
    file_path   VARCHAR(500)  NOT NULL,
    uploaded_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rfqatt_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rfq_vendors (
    rfq_id      INT UNSIGNED NOT NULL,
    vendor_id   INT UNSIGNED NOT NULL,
    invited_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    viewed_at   DATETIME     DEFAULT NULL,
    PRIMARY KEY (rfq_id, vendor_id),
    CONSTRAINT fk_rfqvendor_rfq    FOREIGN KEY (rfq_id)    REFERENCES rfqs(id)     ON DELETE CASCADE,
    CONSTRAINT fk_rfqvendor_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id)  ON DELETE CASCADE
);

-- ============================================================
-- QUOTATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS quotations (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rfq_id          INT UNSIGNED   NOT NULL,
    vendor_id       INT UNSIGNED   NOT NULL,
    quote_number    VARCHAR(30)    NOT NULL UNIQUE,
    status          ENUM('draft','submitted','accepted','rejected','revised') NOT NULL DEFAULT 'draft',
    delivery_days   SMALLINT UNSIGNED,
    validity_date   DATE,
    notes           TEXT,
    total_amount    DECIMAL(16,2)  NOT NULL DEFAULT 0,
    submitted_at    DATETIME       DEFAULT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quot_rfq    FOREIGN KEY (rfq_id)    REFERENCES rfqs(id)     ON DELETE CASCADE,
    CONSTRAINT fk_quot_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id)  ON DELETE CASCADE,
    UNIQUE KEY uq_rfq_vendor (rfq_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT UNSIGNED  NOT NULL,
    rfq_item_id  INT UNSIGNED  NOT NULL,
    unit_price   DECIMAL(14,2) NOT NULL,
    quantity     DECIMAL(12,3) NOT NULL,
    discount_pct DECIMAL(5,2)  NOT NULL DEFAULT 0,
    tax_pct      DECIMAL(5,2)  NOT NULL DEFAULT 0,
    line_total   DECIMAL(16,2) NOT NULL,
    CONSTRAINT fk_qitem_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    CONSTRAINT fk_qitem_rfqitem   FOREIGN KEY (rfq_item_id)  REFERENCES rfq_items(id)  ON DELETE CASCADE
);

-- ============================================================
-- APPROVAL WORKFLOW
-- ============================================================

CREATE TABLE IF NOT EXISTS approval_workflows (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quotation_id  INT UNSIGNED NOT NULL UNIQUE,
    initiated_by  BIGINT UNSIGNED NOT NULL,
    status        ENUM('pending','approved','rejected','escalated') NOT NULL DEFAULT 'pending',
    initiated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at   DATETIME     DEFAULT NULL,
    CONSTRAINT fk_apwf_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    CONSTRAINT fk_apwf_initiator FOREIGN KEY (initiated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS approval_steps (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workflow_id  INT UNSIGNED NOT NULL,
    approver_id  BIGINT UNSIGNED NOT NULL,
    step_order   TINYINT UNSIGNED NOT NULL DEFAULT 1,
    status       ENUM('pending','approved','rejected','skipped') NOT NULL DEFAULT 'pending',
    remarks      TEXT,
    acted_at     DATETIME     DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_apstep_workflow FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE,
    CONSTRAINT fk_apstep_approver FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    po_number        VARCHAR(30)   NOT NULL UNIQUE,
    quotation_id     INT UNSIGNED  NOT NULL UNIQUE,
    vendor_id        INT UNSIGNED  NOT NULL,
    created_by       BIGINT UNSIGNED NOT NULL,
    status           ENUM('draft','issued','acknowledged','completed','cancelled') NOT NULL DEFAULT 'draft',
    delivery_date    DATE          DEFAULT NULL,
    billing_address  TEXT,
    shipping_address TEXT,
    terms_conditions TEXT,
    subtotal         DECIMAL(16,2) NOT NULL DEFAULT 0,
    tax_amount       DECIMAL(16,2) NOT NULL DEFAULT 0,
    discount_amount  DECIMAL(16,2) NOT NULL DEFAULT 0,
    total_amount     DECIMAL(16,2) NOT NULL DEFAULT 0,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    CONSTRAINT fk_po_vendor    FOREIGN KEY (vendor_id)    REFERENCES vendors(id),
    CONSTRAINT fk_po_creator   FOREIGN KEY (created_by)   REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS po_items (
    id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    po_id       INT UNSIGNED  NOT NULL,
    item_name   VARCHAR(255)  NOT NULL,
    description TEXT,
    quantity    DECIMAL(12,3) NOT NULL,
    unit        VARCHAR(50),
    unit_price  DECIMAL(14,2) NOT NULL,
    tax_pct     DECIMAL(5,2)  NOT NULL DEFAULT 0,
    line_total  DECIMAL(16,2) NOT NULL,
    CONSTRAINT fk_poitem_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- ============================================================
-- INVOICES
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number  VARCHAR(30)   NOT NULL UNIQUE,
    po_id           INT UNSIGNED  NOT NULL,
    vendor_id       INT UNSIGNED  NOT NULL,
    created_by      BIGINT UNSIGNED NOT NULL,
    status          ENUM('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
    issue_date      DATE          NOT NULL,
    due_date        DATE          NOT NULL,
    subtotal        DECIMAL(16,2) NOT NULL DEFAULT 0,
    cgst_amount     DECIMAL(16,2) NOT NULL DEFAULT 0,
    sgst_amount     DECIMAL(16,2) NOT NULL DEFAULT 0,
    igst_amount     DECIMAL(16,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(16,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(16,2) NOT NULL DEFAULT 0,
    amount_paid     DECIMAL(16,2) NOT NULL DEFAULT 0,
    amount_due      DECIMAL(16,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    notes           TEXT,
    email_sent_at   DATETIME      DEFAULT NULL,
    pdf_path        VARCHAR(500)  DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_po      FOREIGN KEY (po_id)       REFERENCES purchase_orders(id),
    CONSTRAINT fk_inv_vendor  FOREIGN KEY (vendor_id)   REFERENCES vendors(id),
    CONSTRAINT fk_inv_creator FOREIGN KEY (created_by)  REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT UNSIGNED  NOT NULL,
    item_name  VARCHAR(255)  NOT NULL,
    description TEXT,
    quantity   DECIMAL(12,3) NOT NULL,
    unit       VARCHAR(50),
    unit_price DECIMAL(14,2) NOT NULL,
    cgst_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    sgst_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    igst_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    line_total DECIMAL(16,2) NOT NULL,
    CONSTRAINT fk_invitem_inv FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoice_payments (
    id            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    invoice_id    INT UNSIGNED  NOT NULL,
    amount        DECIMAL(16,2) NOT NULL,
    payment_date  DATE          NOT NULL,
    payment_mode  ENUM('bank_transfer','cheque','upi','cash','other') NOT NULL DEFAULT 'bank_transfer',
    reference_no  VARCHAR(100),
    recorded_by   BIGINT UNSIGNED NOT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_invoice  FOREIGN KEY (invoice_id)  REFERENCES invoices(id)  ON DELETE CASCADE,
    CONSTRAINT fk_pay_recorder FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- ============================================================
-- REPORTS / ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS monthly_procurement_summary (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year             SMALLINT     NOT NULL,
    month            TINYINT      NOT NULL,
    total_rfqs       INT          NOT NULL DEFAULT 0,
    total_quotations INT          NOT NULL DEFAULT 0,
    total_pos        INT          NOT NULL DEFAULT 0,
    total_invoices   INT          NOT NULL DEFAULT 0,
    total_spend      DECIMAL(20,2) NOT NULL DEFAULT 0,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_year_month (year, month)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_vendors_email      ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_status     ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_status        ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_deadline      ON rfqs(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_quot_status        ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_po_status          ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_inv_status         ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_inv_due_date       ON invoices(due_date)
