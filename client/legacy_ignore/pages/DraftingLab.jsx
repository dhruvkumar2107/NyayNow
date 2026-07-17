'use client'
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import PaywallModal from '../../src/components/PaywallModal';
import { useAuth } from '../../src/context/AuthContext';
import {
  FileText, Search, Zap, Download, Copy, Edit3, Check,
  ChevronRight, ArrowLeft, Mic, MicOff, Globe, MapPin,
  UploadCloud, AlertTriangle, CheckCircle, Sparkles,
  Home, Briefcase, Users, Scale, CreditCard, Cpu, Building2,
  X, RefreshCw, Eye, Languages
} from 'lucide-react';

// ─── Document Categories & Types ─────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'property',
    label: 'Property & Real Estate',
    icon: Home,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    types: [
      {
        id: 'Rental / Lease Agreement (Residential)',
        label: 'Rental Agreement',
        sub: 'Residential',
        desc: 'Home/flat rental with tenant rights, deposit, notice period',
        fields: [
          { key: 'landlord_name', label: 'Landlord Full Name', placeholder: 'e.g., Rajesh Kumar Sharma' },
          { key: 'landlord_address', label: 'Landlord Address', placeholder: 'Full permanent address' },
          { key: 'tenant_name', label: 'Tenant Full Name', placeholder: 'e.g., Priya Mehta' },
          { key: 'tenant_address', label: 'Tenant Permanent Address', placeholder: 'Tenant\'s permanent address' },
          { key: 'property_address', label: 'Property Address (to be rented)', placeholder: 'Full address of rental property' },
          { key: 'property_description', label: 'Property Description', placeholder: 'e.g., 2BHK flat, 3rd floor, approx 950 sq ft' },
          { key: 'monthly_rent', label: 'Monthly Rent (₹)', placeholder: 'e.g., ₹25,000' },
          { key: 'security_deposit', label: 'Security Deposit (₹)', placeholder: 'e.g., ₹75,000 (3 months)' },
          { key: 'lease_start_date', label: 'Lease Start Date', placeholder: 'e.g., 1st August 2025' },
          { key: 'lease_duration', label: 'Lease Duration', placeholder: 'e.g., 11 months' },
          { key: 'maintenance_charges', label: 'Maintenance Charges', placeholder: 'e.g., Tenant pays ₹2000/month for society maintenance' },
          { key: 'special_conditions', label: 'Special Conditions (optional)', placeholder: 'e.g., No pets, parking included, no subletting', multiline: true },
        ]
      },
      {
        id: 'Rental / Lease Agreement (Commercial)',
        label: 'Commercial Lease',
        sub: 'Commercial',
        desc: 'Office, shop or warehouse lease with CAM charges and fit-out',
        fields: [
          { key: 'lessor_name', label: 'Lessor (Owner) Name', placeholder: 'Full name / company name' },
          { key: 'lessee_name', label: 'Lessee (Tenant) Name', placeholder: 'Full name / company name' },
          { key: 'property_address', label: 'Property Address', placeholder: 'Full commercial property address' },
          { key: 'carpet_area', label: 'Carpet Area (sq ft)', placeholder: 'e.g., 1200 sq ft' },
          { key: 'monthly_rent', label: 'Monthly Rent (₹)', placeholder: 'e.g., ₹80,000' },
          { key: 'cam_charges', label: 'CAM / Maintenance Charges', placeholder: 'e.g., ₹15,000/month or actual basis' },
          { key: 'security_deposit', label: 'Security Deposit (₹)', placeholder: 'e.g., ₹4,80,000 (6 months)' },
          { key: 'lease_term', label: 'Lease Term', placeholder: 'e.g., 3 years with 3-year renewal option' },
          { key: 'lock_in_period', label: 'Lock-in Period', placeholder: 'e.g., 18 months' },
          { key: 'rent_escalation', label: 'Annual Rent Escalation', placeholder: 'e.g., 5% per annum' },
          { key: 'fitout_period', label: 'Fit-out / Rent-free Period', placeholder: 'e.g., 2 months rent-free for fit-out' },
          { key: 'permitted_use', label: 'Permitted Use', placeholder: 'e.g., IT software development office' },
        ]
      },
      {
        id: 'Leave & License Agreement',
        label: 'Leave & License',
        sub: 'Non-tenancy',
        desc: 'Maharashtra-style L&L to avoid tenant rights creation',
        fields: [
          { key: 'licensor_name', label: 'Licensor (Owner) Name', placeholder: 'Full name' },
          { key: 'licensee_name', label: 'Licensee Name', placeholder: 'Full name' },
          { key: 'property_address', label: 'Property Address', placeholder: 'Full property address' },
          { key: 'monthly_license_fee', label: 'Monthly License Fee (₹)', placeholder: 'e.g., ₹30,000' },
          { key: 'refundable_deposit', label: 'Refundable Deposit (₹)', placeholder: 'e.g., ₹90,000' },
          { key: 'duration', label: 'Duration', placeholder: 'e.g., 11 months (1 Aug 2025 to 30 Jun 2026)' },
          { key: 'permitted_use', label: 'Permitted Use', placeholder: 'e.g., residential accommodation only' },
        ]
      },
      {
        id: 'Sale Deed',
        label: 'Sale Deed',
        sub: 'Property Transfer',
        desc: 'Conveyance of immovable property with title guarantee',
        fields: [
          { key: 'seller_name', label: 'Seller Name', placeholder: 'Full name of seller(s)' },
          { key: 'buyer_name', label: 'Buyer Name', placeholder: 'Full name of buyer(s)' },
          { key: 'property_description', label: 'Property Description', placeholder: 'Survey/Plot No, area, boundaries (N/S/E/W)' },
          { key: 'sale_consideration', label: 'Sale Consideration (₹)', placeholder: 'e.g., ₹85,00,000 (Eighty-Five Lakhs)' },
          { key: 'advance_paid', label: 'Advance/Token Amount Paid', placeholder: 'e.g., ₹5,00,000 paid on 15 May 2025' },
          { key: 'balance_amount', label: 'Balance Amount', placeholder: 'e.g., ₹80,00,000 payable at registration' },
          { key: 'possession_date', label: 'Possession Date', placeholder: 'e.g., on date of registration' },
        ]
      },
      {
        id: 'Gift Deed',
        label: 'Gift Deed',
        sub: 'No Consideration',
        desc: 'Transfer of property as gift without consideration',
        fields: [
          { key: 'donor_name', label: 'Donor Name & Age', placeholder: 'e.g., Ramesh Kumar, 62 years' },
          { key: 'donee_name', label: 'Donee Name & Relationship', placeholder: 'e.g., Sunita Sharma (daughter)' },
          { key: 'property_description', label: 'Property Description', placeholder: 'Full description of gifted property' },
          { key: 'relationship', label: 'Reason / Relationship', placeholder: 'e.g., out of natural love and affection for daughter' },
        ]
      },
    ]
  },
  {
    id: 'business',
    label: 'Business & Corporate',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    types: [
      {
        id: 'Non-Disclosure Agreement (NDA)',
        label: 'NDA',
        sub: 'Confidentiality',
        desc: 'Mutual or unilateral confidentiality agreement',
        fields: [
          { key: 'party_1_name', label: 'Party 1 Name', placeholder: 'Company or individual name' },
          { key: 'party_2_name', label: 'Party 2 Name', placeholder: 'Company or individual name' },
          { key: 'purpose', label: 'Purpose of Disclosure', placeholder: 'e.g., Evaluation of potential partnership / business discussions' },
          { key: 'confidential_info_scope', label: 'What is Confidential?', placeholder: 'e.g., business plans, financials, source code, client lists' },
          { key: 'duration', label: 'Confidentiality Duration', placeholder: 'e.g., 3 years from date of signing' },
          { key: 'nda_type', label: 'NDA Type', placeholder: 'Mutual (both parties share info) or Unilateral (one-way)' },
        ]
      },
      {
        id: 'Partnership Deed',
        label: 'Partnership Deed',
        sub: 'Firm Registration',
        desc: 'Indian Partnership Act 1932 compliant deed',
        fields: [
          { key: 'firm_name', label: 'Firm Name', placeholder: 'e.g., Sharma & Associates' },
          { key: 'business_nature', label: 'Nature of Business', placeholder: 'e.g., wholesale textile trading' },
          { key: 'principal_place', label: 'Principal Place of Business', placeholder: 'Full address' },
          { key: 'partner_1', label: 'Partner 1 (Name + Capital + Profit %)', placeholder: 'e.g., Amit Sharma — ₹5 Lakhs — 50%' },
          { key: 'partner_2', label: 'Partner 2 (Name + Capital + Profit %)', placeholder: 'e.g., Rohit Gupta — ₹5 Lakhs — 50%' },
          { key: 'partner_3', label: 'Partner 3 (if any)', placeholder: 'Optional' },
          { key: 'commencement_date', label: 'Commencement Date', placeholder: 'e.g., 1 April 2025' },
          { key: 'special_terms', label: 'Special Terms', placeholder: 'e.g., Amit will manage operations, Rohit manages accounts', multiline: true },
        ]
      },
      {
        id: 'Memorandum of Understanding (MOU)',
        label: 'MOU',
        sub: 'Intent Agreement',
        desc: 'Framework agreement between two organizations',
        fields: [
          { key: 'party_1', label: 'Party 1 (Name + Organization)', placeholder: 'e.g., ABC Pvt Ltd, Mumbai' },
          { key: 'party_2', label: 'Party 2 (Name + Organization)', placeholder: 'e.g., XYZ NGO, Delhi' },
          { key: 'purpose', label: 'Purpose / Scope of MOU', placeholder: 'e.g., Joint collaboration for skill development programs in rural Maharashtra' },
          { key: 'responsibilities_p1', label: 'Responsibilities of Party 1', placeholder: 'e.g., Provide funding, infrastructure' },
          { key: 'responsibilities_p2', label: 'Responsibilities of Party 2', placeholder: 'e.g., Provide trainers, local coordination' },
          { key: 'duration', label: 'MOU Duration', placeholder: 'e.g., 2 years' },
          { key: 'financial_terms', label: 'Financial Terms (if any)', placeholder: 'e.g., No financial exchange / ₹10 Lakh contribution by Party 1' },
        ]
      },
      {
        id: 'Shareholders Agreement',
        label: 'Shareholders Agreement',
        sub: 'Companies Act 2013',
        desc: 'Investor-founder SHA with ROFR, tag/drag rights',
        fields: [
          { key: 'company_name', label: 'Company Name', placeholder: 'e.g., Innovate Labs Pvt Ltd' },
          { key: 'founders', label: 'Founder(s) & Shareholding', placeholder: 'e.g., Arjun Nair — 60%, Meena Rao — 20%' },
          { key: 'investors', label: 'Investor(s) & Shareholding', placeholder: 'e.g., XYZ Ventures — 20%' },
          { key: 'board_composition', label: 'Board Composition', placeholder: 'e.g., 3 founders + 1 investor + 1 independent director' },
          { key: 'vesting_schedule', label: 'Vesting Schedule', placeholder: 'e.g., 4-year vesting with 1-year cliff for all founders' },
          { key: 'reserved_matters', label: 'Reserved Matters', placeholder: 'e.g., New share issuance, M&A, change of business, key hires > 25 LPA' },
        ]
      },
      {
        id: 'Founders Agreement',
        label: 'Founders Agreement',
        sub: 'Startup',
        desc: 'Equity split, vesting, IP assignment for co-founders',
        fields: [
          { key: 'startup_name', label: 'Startup Name', placeholder: 'e.g., TechBridge Solutions' },
          { key: 'founders', label: 'Founders & Equity Split', placeholder: 'e.g., Priya Singh 50%, Karan Mehta 30%, Rohit Das 20%' },
          { key: 'roles', label: 'Roles & Responsibilities', placeholder: 'e.g., Priya = CEO/Product, Karan = CTO, Rohit = CMO' },
          { key: 'vesting', label: 'Vesting Schedule', placeholder: 'e.g., 4 years, 1-year cliff — standard' },
          { key: 'ip_clause', label: 'IP Created Before Incorporation', placeholder: 'e.g., All prior IP developed related to this startup is assigned to company' },
          { key: 'non_compete_duration', label: 'Non-Compete Duration', placeholder: 'e.g., During tenure + 1 year after exit' },
        ]
      },
      {
        id: 'Service Level Agreement (SLA)',
        label: 'SLA',
        sub: 'Service Standards',
        desc: 'IT/business SLA with uptime, response, and penalty',
        fields: [
          { key: 'service_provider', label: 'Service Provider', placeholder: 'Company name providing services' },
          { key: 'client', label: 'Client', placeholder: 'Company name receiving services' },
          { key: 'services_description', label: 'Services Description', placeholder: 'e.g., Cloud hosting, technical support, software maintenance' },
          { key: 'uptime_guarantee', label: 'Uptime Guarantee', placeholder: 'e.g., 99.9% monthly uptime' },
          { key: 'response_time', label: 'Response Times', placeholder: 'e.g., P1 critical: 1 hour, P2 high: 4 hours, P3 medium: 24 hours' },
          { key: 'sla_credits', label: 'SLA Credits / Penalties', placeholder: 'e.g., 10% monthly fee credit for each 1% below SLA' },
          { key: 'contract_value', label: 'Monthly Contract Value (₹)', placeholder: 'e.g., ₹2,00,000 per month' },
        ]
      },
    ]
  },
  {
    id: 'employment',
    label: 'Employment & Labour',
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    types: [
      {
        id: 'Employment Contract',
        label: 'Employment Contract',
        sub: 'Full Contract',
        desc: 'Complete employment agreement with CTC, leave, NCA',
        fields: [
          { key: 'employer_name', label: 'Employer / Company Name', placeholder: 'e.g., Infosys Technologies Ltd' },
          { key: 'employee_name', label: 'Employee Full Name', placeholder: 'e.g., Sneha Patel' },
          { key: 'designation', label: 'Designation / Role', placeholder: 'e.g., Senior Software Engineer' },
          { key: 'department', label: 'Department', placeholder: 'e.g., Engineering — Platform Team' },
          { key: 'date_of_joining', label: 'Date of Joining', placeholder: 'e.g., 1 July 2025' },
          { key: 'place_of_posting', label: 'Place of Posting', placeholder: 'e.g., Pune, Maharashtra' },
          { key: 'ctc', label: 'CTC (Annual)', placeholder: 'e.g., ₹12,00,000 per annum' },
          { key: 'ctc_breakup', label: 'CTC Breakup (optional)', placeholder: 'e.g., Basic ₹6L, HRA ₹3L, PF ₹72K, Other allowances ₹2.28L', multiline: true },
          { key: 'probation_period', label: 'Probation Period', placeholder: 'e.g., 6 months' },
          { key: 'notice_period', label: 'Notice Period (both sides)', placeholder: 'e.g., 90 days (3 months)' },
          { key: 'working_hours', label: 'Working Hours', placeholder: 'e.g., 9 hours/day, 5 days/week' },
          { key: 'non_compete', label: 'Non-Compete Clause', placeholder: 'e.g., 6 months post-exit within same industry within India' },
        ]
      },
      {
        id: 'Appointment Letter',
        label: 'Appointment Letter',
        sub: 'Offer Confirmation',
        desc: 'Formal appointment letter on company letterhead',
        fields: [
          { key: 'company_name', label: 'Company Name', placeholder: 'e.g., Zomato Ltd' },
          { key: 'employee_name', label: 'Employee Name', placeholder: 'Full name' },
          { key: 'designation', label: 'Designation', placeholder: 'e.g., Product Manager' },
          { key: 'joining_date', label: 'Date of Joining', placeholder: 'e.g., 15 July 2025' },
          { key: 'location', label: 'Work Location', placeholder: 'e.g., Gurugram, Haryana' },
          { key: 'ctc', label: 'CTC', placeholder: 'e.g., ₹25,00,000 per annum' },
          { key: 'reporting_to', label: 'Reporting To', placeholder: 'e.g., VP Product' },
          { key: 'probation', label: 'Probation Period', placeholder: 'e.g., 3 months' },
        ]
      },
      {
        id: 'Termination Letter',
        label: 'Termination Letter',
        sub: 'Employment End',
        desc: 'Compliant termination with full & final settlement',
        fields: [
          { key: 'company_name', label: 'Company Name', placeholder: 'e.g., ABC Pvt Ltd' },
          { key: 'employee_name', label: 'Employee Name', placeholder: 'Full name' },
          { key: 'employee_id', label: 'Employee ID', placeholder: 'e.g., EMP-1234' },
          { key: 'termination_date', label: 'Termination Effective Date', placeholder: 'e.g., 31 July 2025' },
          { key: 'reason', label: 'Reason for Termination', placeholder: 'e.g., Redundancy due to business restructuring / Performance / Misconduct' },
          { key: 'notice_complied', label: 'Notice Period / PILON', placeholder: 'e.g., 30-day notice being waived with PILON of ₹50,000' },
          { key: 'fnf_timeline', label: 'Full & Final Settlement Timeline', placeholder: 'e.g., All dues including gratuity to be settled within 30 days' },
        ]
      },
      {
        id: 'Freelance Service Agreement',
        label: 'Freelance Agreement',
        sub: 'Independent Contractor',
        desc: 'Consultant agreement avoiding PF/ESI liability',
        fields: [
          { key: 'client_name', label: 'Client Name / Company', placeholder: 'e.g., StartupABC Pvt Ltd' },
          { key: 'freelancer_name', label: 'Freelancer / Consultant Name', placeholder: 'e.g., Rahul Verma' },
          { key: 'services', label: 'Services to be Rendered', placeholder: 'e.g., UI/UX design, brand identity, website development' },
          { key: 'deliverables', label: 'Deliverables', placeholder: 'e.g., Logo, brand kit, 5-page website by 30 Aug 2025' },
          { key: 'fees', label: 'Professional Fees', placeholder: 'e.g., ₹80,000 total — 50% upfront, 50% on delivery' },
          { key: 'timeline', label: 'Project Timeline', placeholder: 'e.g., 6 weeks from contract signing' },
          { key: 'non_compete', label: 'Non-Compete (if any)', placeholder: 'e.g., Not to work with direct competitors for 6 months' },
        ]
      },
    ]
  },
  {
    id: 'family',
    label: 'Family & Personal',
    icon: Scale,
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    types: [
      {
        id: 'Will / Testament',
        label: 'Will / Testament',
        sub: 'Succession Act',
        desc: 'Legally valid will with executor and bequests',
        fields: [
          { key: 'testator_name', label: 'Testator Name (Will Maker)', placeholder: 'Full legal name, age, address' },
          { key: 'religion', label: 'Religion', placeholder: 'e.g., Hindu / Muslim / Christian / Parsi — determines applicable succession law' },
          { key: 'executor_name', label: 'Executor Name', placeholder: 'Person who will carry out the will' },
          { key: 'beneficiaries', label: 'Beneficiaries', placeholder: 'e.g., Wife — 50%, Son Arun — 30%, Daughter Priya — 20%', multiline: true },
          { key: 'assets', label: 'Assets to be Distributed', placeholder: 'Property at X, FDs, shares, gold — describe each asset and to whom', multiline: true },
          { key: 'guardian', label: 'Guardian for Minor Children (if any)', placeholder: 'e.g., Brother Suresh Kumar as guardian' },
          { key: 'special_wishes', label: 'Special Wishes / Conditions', placeholder: 'e.g., Gold jewelry to daughter at her wedding', multiline: true },
        ]
      },
      {
        id: 'Divorce Settlement (Mutual Consent)',
        label: 'Divorce Settlement',
        sub: 'Mutual Consent',
        desc: 'Section 13B HMA — mutual consent divorce settlement',
        fields: [
          { key: 'husband_name', label: 'Husband\'s Full Name', placeholder: 'Full legal name' },
          { key: 'wife_name', label: 'Wife\'s Full Name', placeholder: 'Full legal name' },
          { key: 'marriage_date', label: 'Date of Marriage', placeholder: 'e.g., 15 February 2019' },
          { key: 'separation_date', label: 'Date of Separation', placeholder: 'e.g., 1 January 2024' },
          { key: 'children', label: 'Children (if any)', placeholder: 'e.g., One daughter Ria, 4 years old' },
          { key: 'custody', label: 'Custody Arrangement', placeholder: 'e.g., Primary custody with mother, weekend visits to father' },
          { key: 'alimony', label: 'Alimony / Maintenance', placeholder: 'e.g., ₹20,000/month for 3 years / One-time settlement of ₹15 Lakhs' },
          { key: 'asset_division', label: 'Asset Division', placeholder: 'e.g., Flat to wife, FD to husband, joint savings divided equally', multiline: true },
        ]
      },
      {
        id: 'Maintenance Agreement',
        label: 'Maintenance Agreement',
        sub: 'BNSS Section 144',
        desc: 'Spousal or parent maintenance agreement',
        fields: [
          { key: 'payer_name', label: 'Payer Name', placeholder: 'Person who will pay maintenance' },
          { key: 'recipient_name', label: 'Recipient Name', placeholder: 'Person who will receive maintenance' },
          { key: 'relationship', label: 'Relationship', placeholder: 'e.g., Husband-Wife / Son-Parents' },
          { key: 'monthly_amount', label: 'Monthly Maintenance Amount (₹)', placeholder: 'e.g., ₹15,000 per month' },
          { key: 'payment_date', label: 'Payment Date', placeholder: 'e.g., 5th of every month' },
          { key: 'duration', label: 'Duration', placeholder: 'e.g., Until remarriage or further court order' },
          { key: 'special_expenses', label: 'Special Expenses', placeholder: 'e.g., Medical and school fees to be paid separately as actual' },
        ]
      },
      {
        id: 'Power of Attorney (General)',
        label: 'General Power of Attorney',
        sub: 'Broad Authority',
        desc: 'Wide-scope POA for property, banking, legal matters',
        fields: [
          { key: 'principal_name', label: 'Principal Name (Grantor)', placeholder: 'Person giving the POA' },
          { key: 'attorney_name', label: 'Attorney Name (Grantee)', placeholder: 'Person receiving power' },
          { key: 'relationship', label: 'Relationship', placeholder: 'e.g., Son, Brother, Friend' },
          { key: 'scope', label: 'Scope of Authority', placeholder: 'e.g., All property transactions, banking, court appearances, government dealings in India' },
          { key: 'duration', label: 'Duration', placeholder: 'e.g., 2 years / Until revoked' },
          { key: 'reason', label: 'Reason for POA', placeholder: 'e.g., Principal relocating to USA, cannot be present personally' },
        ]
      },
      {
        id: 'Power of Attorney (Special/Limited)',
        label: 'Special Power of Attorney',
        sub: 'Specific Task',
        desc: 'Limited POA for one specific task only',
        fields: [
          { key: 'principal_name', label: 'Principal Name', placeholder: 'Full name of grantor' },
          { key: 'attorney_name', label: 'Attorney Name', placeholder: 'Full name of attorney' },
          { key: 'specific_task', label: 'Specific Task Authorized', placeholder: 'e.g., Sell and register property at Plot 24, Sector 5, Gurgaon only' },
          { key: 'property_details', label: 'Property/Matter Details', placeholder: 'Full description of the matter for which POA is given' },
          { key: 'expiry', label: 'Expiry / Validity', placeholder: 'e.g., Valid until 31 December 2025 or upon task completion' },
        ]
      },
    ]
  },
  {
    id: 'notices',
    label: 'Legal Notices & FIRs',
    icon: Scale,
    color: 'from-red-500 to-rose-500',
    bg: 'bg-red-500/10 border-red-500/20 text-red-400',
    types: [
      {
        id: 'Legal Notice (General)',
        label: 'Legal Notice',
        sub: 'General Purpose',
        desc: 'Formal legal notice demanding action within timeline',
        fields: [
          { key: 'sender_name', label: 'Sender Name & Address', placeholder: 'Your full name and address' },
          { key: 'recipient_name', label: 'Recipient Name & Address', placeholder: 'Recipient\'s full name and address' },
          { key: 'subject_matter', label: 'Subject / Issue', placeholder: 'e.g., Non-payment of dues, breach of contract' },
          { key: 'facts', label: 'Facts (Chronological)', placeholder: 'What happened, when, and who did what — full factual background', multiline: true },
          { key: 'demand', label: 'Specific Demand / Relief', placeholder: 'e.g., Pay ₹2,50,000 within 15 days of receipt of this notice' },
          { key: 'reply_time', label: 'Time to Reply/Comply', placeholder: 'e.g., 15 days / 30 days' },
          { key: 'consequences', label: 'Consequences of Non-Compliance', placeholder: 'e.g., Civil suit for recovery + interest + costs / FIR under Section 420 IPC / BNS' },
        ]
      },
      {
        id: 'Legal Notice — Cheque Bounce (NI Act 138)',
        label: 'Cheque Bounce Notice',
        sub: 'NI Act Section 138',
        desc: 'Mandatory statutory notice — must be sent within 30 days',
        fields: [
          { key: 'drawer_name', label: 'Cheque Drawer Name & Address', placeholder: 'Person who issued the cheque' },
          { key: 'payee_name', label: 'Your Name (Payee) & Address', placeholder: 'Person to whom cheque was given' },
          { key: 'cheque_number', label: 'Cheque Number', placeholder: 'e.g., 456789' },
          { key: 'cheque_date', label: 'Cheque Date', placeholder: 'e.g., 1 June 2025' },
          { key: 'cheque_amount', label: 'Cheque Amount (₹)', placeholder: 'e.g., ₹5,00,000' },
          { key: 'bank_name', label: 'Bank Name & Branch', placeholder: 'Bank on which cheque was drawn' },
          { key: 'presentation_date', label: 'Date of Presentation to Bank', placeholder: 'e.g., 10 June 2025' },
          { key: 'dishonour_date', label: 'Date of Dishonour', placeholder: 'e.g., 12 June 2025' },
          { key: 'dishonour_reason', label: 'Reason for Dishonour', placeholder: 'e.g., Insufficient funds / Account closed / Stop payment' },
          { key: 'underlying_debt', label: 'Underlying Debt / Why Cheque Was Issued', placeholder: 'e.g., Against loan advanced on 1 May 2025 / Purchase of goods' },
        ]
      },
      {
        id: 'Legal Notice — Recovery of Money',
        label: 'Money Recovery Notice',
        sub: 'Debt Recovery',
        desc: 'Demand notice for recovery of dues with interest',
        fields: [
          { key: 'creditor_name', label: 'Creditor Name & Address', placeholder: 'Your name — person owed money' },
          { key: 'debtor_name', label: 'Debtor Name & Address', placeholder: 'Person who owes money' },
          { key: 'principal_amount', label: 'Principal Amount (₹)', placeholder: 'e.g., ₹3,50,000' },
          { key: 'date_of_transaction', label: 'Date of Original Transaction', placeholder: 'e.g., Loan given on 15 January 2025' },
          { key: 'due_date', label: 'Original Due Date', placeholder: 'e.g., Was to be repaid by 15 April 2025' },
          { key: 'interest_rate', label: 'Interest Rate (if agreed)', placeholder: 'e.g., 18% per annum / As per agreement' },
          { key: 'prior_demands', label: 'Previous Demands Made', placeholder: 'e.g., Sent WhatsApp on 20 Apr, email on 5 May — no response' },
        ]
      },
      {
        id: 'Legal Notice — Eviction',
        label: 'Eviction Notice',
        sub: 'Tenant Removal',
        desc: 'Notice to tenant to vacate premises',
        fields: [
          { key: 'landlord_name', label: 'Landlord Name & Address', placeholder: 'Your name as landlord' },
          { key: 'tenant_name', label: 'Tenant Name & Address', placeholder: 'Tenant\'s name and property address' },
          { key: 'property_address', label: 'Property to be Vacated', placeholder: 'Full address of the property' },
          { key: 'tenancy_start_date', label: 'Tenancy Start Date', placeholder: 'e.g., 1 August 2023' },
          { key: 'reason_for_eviction', label: 'Ground(s) for Eviction', placeholder: 'e.g., Expiry of term / Non-payment of rent of ₹25,000 since 3 months / Subletting without consent / Personal use' },
          { key: 'arrears', label: 'Arrears of Rent (if any)', placeholder: 'e.g., ₹75,000 outstanding for January-March 2025' },
          { key: 'vacate_by_date', label: 'Date by Which to Vacate', placeholder: 'e.g., 30 days from receipt of this notice' },
        ]
      },
      {
        id: 'FIR Draft',
        label: 'FIR Draft',
        sub: 'Police Complaint',
        desc: 'First information report to SHO of police station',
        fields: [
          { key: 'complainant_name', label: 'Complainant Name & Address', placeholder: 'Your full name and address' },
          { key: 'police_station', label: 'Police Station Name', placeholder: 'e.g., Connaught Place Police Station, New Delhi' },
          { key: 'accused_name', label: 'Accused Name(s)', placeholder: 'Full names if known, or description if unknown' },
          { key: 'date_of_offence', label: 'Date & Time of Offence', placeholder: 'e.g., 5 June 2025 at approximately 9:30 PM' },
          { key: 'place_of_offence', label: 'Place of Offence', placeholder: 'Full address where offence occurred' },
          { key: 'incident_narration', label: 'Detailed Incident Narration', placeholder: 'Describe exactly what happened — who, what, when, where, how in chronological order', multiline: true },
          { key: 'bns_sections', label: 'Applicable BNS/IPC Sections', placeholder: 'e.g., BNS Section 318 (cheating), BNS Section 351 (criminal intimidation) — or describe offence if unsure' },
          { key: 'witnesses', label: 'Witnesses (if any)', placeholder: 'Names and addresses of people who saw the incident' },
          { key: 'evidence', label: 'Evidence Available', placeholder: 'e.g., CCTV footage, screenshots, WhatsApp messages, bank statements' },
        ]
      },
      {
        id: 'Affidavit (General)',
        label: 'Affidavit',
        sub: 'Sworn Statement',
        desc: 'Sworn affidavit for courts, government, banks',
        fields: [
          { key: 'deponent_name', label: 'Deponent Name', placeholder: 'Full name of person swearing the affidavit' },
          { key: 'deponent_age', label: 'Deponent Age', placeholder: 'e.g., 35 years' },
          { key: 'deponent_address', label: 'Deponent Address', placeholder: 'Full residential address' },
          { key: 'purpose', label: 'Purpose of Affidavit', placeholder: 'e.g., For name change / Address proof / Lost documents / Bank records / Court submission' },
          { key: 'sworn_facts', label: 'Facts to be Sworn', placeholder: 'List all facts that need to be stated in the affidavit', multiline: true },
        ]
      },
    ]
  },
  {
    id: 'finance',
    label: 'Finance & Loans',
    icon: CreditCard,
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    types: [
      {
        id: 'Loan Agreement',
        label: 'Loan Agreement',
        sub: 'Money Lending',
        desc: 'Personal or business loan with EMI and security',
        fields: [
          { key: 'lender_name', label: 'Lender Name & Address', placeholder: 'Full name and address of lender' },
          { key: 'borrower_name', label: 'Borrower Name & Address', placeholder: 'Full name and address of borrower' },
          { key: 'loan_amount', label: 'Loan Amount (₹)', placeholder: 'e.g., ₹10,00,000 (Ten Lakhs)' },
          { key: 'purpose', label: 'Purpose of Loan', placeholder: 'e.g., Business expansion / Home renovation / Personal use' },
          { key: 'interest_rate', label: 'Interest Rate', placeholder: 'e.g., 12% per annum simple interest' },
          { key: 'repayment_schedule', label: 'Repayment Schedule', placeholder: 'e.g., 24 equal monthly instalments of ₹47,073 each / Lump sum by 31 Dec 2025' },
          { key: 'security', label: 'Security / Collateral (if any)', placeholder: 'e.g., Property at X pledged as security / Guarantor: ABC' },
          { key: 'disbursement_date', label: 'Disbursement Date', placeholder: 'e.g., 1 July 2025' },
        ]
      },
      {
        id: 'Promissory Note',
        label: 'Promissory Note',
        sub: 'NI Act Section 4',
        desc: 'Unconditional promise to pay — requires stamp duty',
        fields: [
          { key: 'maker_name', label: 'Maker Name (Borrower)', placeholder: 'Full name of person making the promise to pay' },
          { key: 'payee_name', label: 'Payee Name (Lender)', placeholder: 'Full name of person to be paid' },
          { key: 'amount', label: 'Amount (₹)', placeholder: 'e.g., ₹2,00,000 (Two Lakhs only)' },
          { key: 'repayment_date', label: 'Repayment Date', placeholder: 'e.g., On demand / By 31 December 2025' },
          { key: 'interest_rate', label: 'Interest Rate', placeholder: 'e.g., 12% per annum from date of execution' },
          { key: 'place', label: 'Place of Execution', placeholder: 'e.g., Mumbai, Maharashtra' },
        ]
      },
    ]
  },
  {
    id: 'technology',
    label: 'Technology & IP',
    icon: Cpu,
    color: 'from-cyan-500 to-sky-500',
    bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    types: [
      {
        id: 'Software Development Agreement',
        label: 'Software Dev Agreement',
        sub: 'IT Act 2000',
        desc: 'Project-based or retainer software development contract',
        fields: [
          { key: 'client_name', label: 'Client Name / Company', placeholder: 'e.g., RetailMax Pvt Ltd' },
          { key: 'developer_name', label: 'Developer / Agency Name', placeholder: 'e.g., CodeCraft Solutions LLP' },
          { key: 'project_description', label: 'Project Description', placeholder: 'e.g., E-commerce platform with mobile app — iOS and Android', multiline: true },
          { key: 'deliverables', label: 'Deliverables & Milestones', placeholder: 'e.g., M1: Design mockups (2 weeks), M2: Backend APIs (6 weeks), M3: App launch (12 weeks)' },
          { key: 'total_fees', label: 'Total Project Fees (₹)', placeholder: 'e.g., ₹8,00,000 — 30% upfront, 40% at M2, 30% at launch' },
          { key: 'ip_ownership', label: 'IP Ownership', placeholder: 'e.g., All IP transfers to client upon full payment / Developer retains base framework' },
          { key: 'warranty_period', label: 'Bug-fix Warranty Period', placeholder: 'e.g., 6 months post-delivery free bug fixes' },
          { key: 'tech_stack', label: 'Technology Stack', placeholder: 'e.g., React Native, Node.js, PostgreSQL, AWS' },
        ]
      },
      {
        id: 'Privacy Policy (DPDP Compliant)',
        label: 'Privacy Policy',
        sub: 'DPDP Act 2023',
        desc: 'DPDP-compliant privacy policy for Indian websites/apps',
        fields: [
          { key: 'company_name', label: 'Company / App Name', placeholder: 'e.g., HealthTrack India Pvt Ltd' },
          { key: 'website_url', label: 'Website / App URL', placeholder: 'e.g., https://healthtrack.in' },
          { key: 'data_collected', label: 'Personal Data Collected', placeholder: 'e.g., Name, email, phone, health data, location, payment info' },
          { key: 'purpose_of_collection', label: 'Purpose of Data Collection', placeholder: 'e.g., App functionality, personalized recommendations, marketing, legal compliance' },
          { key: 'third_party_sharing', label: 'Third Parties Data is Shared With', placeholder: 'e.g., Payment processors (Razorpay), analytics (Firebase), email (Mailchimp)' },
          { key: 'data_retention', label: 'Data Retention Period', placeholder: 'e.g., Account data for 3 years after account closure, transaction data for 7 years' },
          { key: 'grievance_officer', label: 'Grievance Officer Details', placeholder: 'Name, designation, email, address of DPO/Grievance Officer' },
        ]
      },
    ]
  },
  {
    id: 'construction',
    label: 'Construction',
    icon: Building2,
    color: 'from-stone-400 to-slate-500',
    bg: 'bg-stone-500/10 border-stone-500/20 text-stone-400',
    types: [
      {
        id: 'Construction Contract',
        label: 'Construction Contract',
        sub: 'Civil Works',
        desc: 'Residential or commercial construction agreement',
        fields: [
          { key: 'owner_name', label: 'Property Owner Name', placeholder: 'Full name and address' },
          { key: 'contractor_name', label: 'Contractor Name / Company', placeholder: 'Contractor name, license number if any' },
          { key: 'site_address', label: 'Construction Site Address', placeholder: 'Plot No, survey no, full address' },
          { key: 'work_description', label: 'Scope of Work', placeholder: 'e.g., Construction of G+2 residential building as per approved plan — approximately 2400 sq ft', multiline: true },
          { key: 'contract_amount', label: 'Total Contract Amount (₹)', placeholder: 'e.g., ₹35,00,000 (Thirty-Five Lakhs)' },
          { key: 'payment_schedule', label: 'Payment Schedule', placeholder: 'e.g., 20% advance, 30% at foundation, 30% at first floor, 20% on completion' },
          { key: 'completion_timeline', label: 'Completion Timeline', placeholder: 'e.g., 18 months from commencement date' },
          { key: 'specifications', label: 'Material Specifications', placeholder: 'e.g., AAC blocks, JSW steel, Ultratech cement — or as per BOQ attached' },
          { key: 'penalty_clause', label: 'Penalty for Delay', placeholder: 'e.g., ₹5,000 per day of delay beyond agreed completion date' },
        ]
      },
    ]
  },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi (NCT)', 'Chandigarh', 'Puducherry', 'Jammu & Kashmir'
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DraftingLab() {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState('draft');

  // Draft flow
  const [step, setStep] = useState('categories'); // categories → fields → output
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [state, setState] = useState('');
  const [language, setLanguage] = useState('English');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDoc, setEditedDoc] = useState('');
  const [copied, setCopied] = useState(false);

  // Analysis
  const [analysisText, setAnalysisText] = useState('');
  const [analysisFile, setAnalysisFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Voice
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(null);

  const startVoice = useCallback((fieldKey) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast.error('Speech recognition not supported in your browser');
    if (!recognitionRef.current) recognitionRef.current = new SR();
    const r = recognitionRef.current;
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setFieldValues(prev => ({ ...prev, [fieldKey]: transcript }));
      setIsListening(null);
    };
    r.onerror = () => { toast.error('Voice input failed'); setIsListening(null); };
    r.onend = () => setIsListening(null);
    r.start();
    setIsListening(fieldKey);
    toast.success('Listening…', { icon: '🎙' });
  }, []);

  const handleDraft = async () => {
    if (!selectedType) return;
    setLoading(true);
    setGeneratedDoc('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.post('/api/ai/draft-contract', {
        type: selectedType.id,
        fields: fieldValues,
        state,
        language,
      }, { headers });
      setGeneratedDoc(data.contract);
      setEditedDoc(data.contract);
      setStep('output');
      toast.success('Document drafted successfully!');
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setShowPaywall(true);
      } else {
        toast.error(err.response?.data?.error || 'Drafting failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisText.trim() && !analysisFile) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let responseData;
      if (analysisFile) {
        const formData = new FormData();
        formData.append('file', analysisFile);
        const res = await axios.post('/api/ai/analyze-agreement-pdf', formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        responseData = res.data;
      } else {
        const res = await axios.post('/api/ai/agreement', { text: analysisText }, { headers });
        responseData = res.data;
      }
      setAnalysisResult(responseData);
      toast.success('Analysis complete!');
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setShowPaywall(true);
      } else {
        toast.error(err.response?.data?.error || 'Analysis failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editMode ? editedDoc : generatedDoc);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const content = editMode ? editedDoc : generatedDoc;
      // Strip markdown symbols for PDF
      const clean = content
        .replace(/#{1,6}\s?/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/^---$/gm, '─'.repeat(60))
        .replace(/^\d+\.\s/gm, '');

      doc.setFont('helvetica');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(clean, 180);
      let y = 20;
      const pageH = doc.internal.pageSize.height - 20;
      lines.forEach(line => {
        if (y > pageH) { doc.addPage(); y = 20; }
        doc.text(line, 15, y);
        y += 6;
      });
      const filename = `${selectedType?.id?.replace(/[^a-z0-9]/gi, '_')}_NyayNow.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded!');
    } catch (e) {
      toast.error('PDF generation failed.');
    }
  };

  const resetDraft = () => {
    setStep('categories');
    setSelectedCategory(null);
    setSelectedType(null);
    setFieldValues({});
    setGeneratedDoc('');
    setEditedDoc('');
    setEditMode(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pt-28 pb-20 px-4 md:px-8 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-xs font-black uppercase tracking-widest">
              <Sparkles size={12} /> TurboAgreements v2 — 50+ Document Types
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight">
              Smart{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
                Drafting Lab
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
              Draft any Indian legal document in minutes. Rental agreements, NDAs, wills, legal notices, FIRs, employment contracts and more — in English or Hindi, jurisdiction-aware.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#0f172a] p-1.5 rounded-2xl border border-white/10 inline-flex shadow-xl gap-1">
            {[
              { key: 'draft', label: 'Draft Document', icon: FileText, color: 'bg-indigo-600 shadow-indigo-600/20' },
              { key: 'analyze', label: 'Risk Analysis', icon: Search, color: 'bg-emerald-600 shadow-emerald-600/20' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === t.key ? `${t.color} text-white shadow-lg` : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'draft' ? (
            <motion.div key="draft" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* ── STEP 1: Category & Type Selection ── */}
              {step === 'categories' && (
                <div className="space-y-10">
                  {CATEGORIES.map(cat => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={cat.id}>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider mb-5 ${cat.bg}`}>
                          <CatIcon size={12} /> {cat.label}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {cat.types.map(type => (
                            <motion.button
                              key={type.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { setSelectedCategory(cat); setSelectedType(type); setFieldValues({}); setStep('fields'); }}
                              className="group text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-indigo-500/40 p-5 rounded-2xl transition-all duration-300 space-y-3"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition">{type.label}</div>
                                  <div className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${cat.bg.split(' ').find(c => c.startsWith('text-'))}`}>{type.sub}</div>
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition group-hover:translate-x-1 duration-300 shrink-0 mt-0.5" />
                              </div>
                              <p className="text-slate-500 text-xs leading-relaxed">{type.desc}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── STEP 2: Fill Fields ── */}
              {step === 'fields' && selectedType && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
                  {/* Back + Title */}
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setStep('categories')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition">
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedCategory?.bg?.split(' ').find(c => c.startsWith('text-'))}`}>{selectedCategory?.label}</div>
                      <h2 className="text-xl font-bold text-white">{selectedType.label}</h2>
                    </div>
                  </div>

                  {/* Lang + State row */}
                  <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Languages size={11} /> Output Language</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition">
                        <option value="English" className="bg-slate-950">English</option>
                        <option value="Hindi" className="bg-slate-950">हिंदी (Hindi)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><MapPin size={11} /> State / Jurisdiction</label>
                      <select value={state} onChange={e => setState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition">
                        <option value="" className="bg-slate-950">India (General)</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Smart Fields */}
                  <div className="space-y-5">
                    {selectedType.fields.map(field => (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{field.label}</label>
                          <button
                            type="button"
                            onClick={() => startVoice(field.key)}
                            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition ${isListening === field.key ? 'text-red-400 animate-pulse' : 'text-slate-600 hover:text-indigo-400'}`}
                          >
                            {isListening === field.key ? <MicOff size={11} /> : <Mic size={11} />}
                            {isListening === field.key ? 'Listening…' : 'Voice'}
                          </button>
                        </div>
                        {field.multiline ? (
                          <textarea
                            value={fieldValues[field.key] || ''}
                            onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition resize-none"
                          />
                        ) : (
                          <input
                            value={fieldValues[field.key] || ''}
                            onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    onClick={handleDraft}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Drafting with AI…</>
                    ) : (
                      <><Sparkles size={18} /> Generate {selectedType.label}</>
                    )}
                  </motion.button>
                  <p className="text-center text-[10px] text-slate-600 mt-3">Powered by Gemini — specialized Indian legal AI</p>
                </motion.div>
              )}

              {/* ── STEP 3: Output ── */}
              {step === 'output' && generatedDoc && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Action bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={resetDraft} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition">
                        <ArrowLeft size={13} /> New Draft
                      </button>
                      <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                        <CheckCircle size={11} /> Draft Ready
                      </span>
                      <span className="text-slate-600 text-xs">{selectedType?.label}{state ? ` · ${state}` : ''}{language !== 'English' ? ` · ${language}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditMode(!editMode); if (!editMode) setEditedDoc(generatedDoc); }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${editMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-white/20'}`}
                      >
                        {editMode ? <><Eye size={13} /> Preview</> : <><Edit3 size={13} /> Edit</>}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition"
                      >
                        {copied ? <><Check size={13} className="text-emerald-400" /> Copied!</> : <><Copy size={13} /> Copy</>}
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
                      >
                        <Download size={13} /> Download PDF
                      </button>
                      <button
                        onClick={() => { setStep('fields'); setGeneratedDoc(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition"
                        title="Regenerate"
                      >
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Document Output */}
                  <div className="bg-[#050d1a] border border-white/10 rounded-3xl overflow-hidden min-h-[70vh]">
                    {/* Doc header strip */}
                    <div className="bg-white/[0.03] border-b border-white/5 px-6 py-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/40" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                      <span className="ml-3 text-slate-600 text-[11px] font-mono">{selectedType?.id?.replace(/[^a-z0-9]/gi, '_')}_NyayNow.pdf</span>
                    </div>

                    {editMode ? (
                      <textarea
                        value={editedDoc}
                        onChange={e => setEditedDoc(e.target.value)}
                        className="w-full h-[70vh] bg-transparent p-8 text-slate-300 text-sm font-mono leading-relaxed outline-none resize-none"
                        spellCheck={false}
                      />
                    ) : (
                      <div className="p-6 md:p-10 prose prose-invert prose-sm md:prose-base max-w-none overflow-y-auto max-h-[70vh]
                        prose-headings:text-white prose-headings:font-serif prose-headings:tracking-tight
                        prose-h1:text-2xl prose-h1:text-center prose-h1:uppercase prose-h1:tracking-widest
                        prose-h2:text-lg prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                        prose-strong:text-white prose-strong:font-bold
                        prose-hr:border-white/10
                        prose-li:text-slate-300 prose-p:text-slate-300 prose-p:leading-relaxed">
                        <ReactMarkdown>{generatedDoc}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest">
                    ⚖️ This AI draft is for informational purposes only. Please verify with a qualified advocate before execution.
                  </p>
                </motion.div>
              )}

            </motion.div>
          ) : (
            /* ── ANALYZE TAB ── */
            <motion.div key="analyze" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Input column */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Search size={18} /></div>
                      <h3 className="font-bold text-white">Contract Risk Scanner</h3>
                    </div>

                    {/* File Upload */}
                    <label className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-900/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition group relative">
                      <input type="file" accept=".pdf" onChange={e => setAnalysisFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <UploadCloud size={28} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                      {analysisFile ? (
                        <div className="text-center">
                          <p className="text-emerald-400 font-bold text-sm">{analysisFile.name}</p>
                          <button type="button" onClick={e => { e.preventDefault(); setAnalysisFile(null); }} className="text-xs text-slate-500 hover:text-red-400 mt-1 flex items-center gap-1 mx-auto"><X size={10} /> Remove</button>
                        </div>
                      ) : (
                        <>
                          <p className="text-emerald-400 font-bold text-sm">Upload Contract PDF</p>
                          <p className="text-slate-600 text-xs mt-1">AI will scan for risks, loopholes & missing clauses</p>
                        </>
                      )}
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="h-px bg-white/5 flex-1" />
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">or paste text</span>
                      <div className="h-px bg-white/5 flex-1" />
                    </div>

                    <textarea
                      value={analysisText}
                      onChange={e => setAnalysisText(e.target.value)}
                      placeholder="Paste any legal text, clause or entire contract here…"
                      rows={8}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono placeholder:text-slate-600 outline-none transition resize-none"
                    />

                    <button
                      onClick={handleAnalyze}
                      disabled={loading || (!analysisText.trim() && !analysisFile)}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…</>) : (<><Search size={16} /> Scan for Risks</>)}
                    </button>
                  </div>
                </div>

                {/* Result column */}
                <div className="lg:col-span-3">
                  {!analysisResult && !loading && (
                    <div className="h-96 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/5 rounded-3xl space-y-4 opacity-50">
                      <Search size={40} className="text-slate-600" />
                      <div>
                        <p className="text-slate-400 font-bold">Awaiting Contract</p>
                        <p className="text-slate-600 text-sm">Upload a PDF or paste contract text</p>
                      </div>
                    </div>
                  )}
                  {loading && (
                    <div className="h-96 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                      <div className="w-16 h-16 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
                      <p className="text-emerald-400 font-bold animate-pulse">Scanning contract for risks…</p>
                    </div>
                  )}
                  {analysisResult && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                      {/* Scores */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-5 rounded-2xl border ${analysisResult.riskLevel === 'High' ? 'bg-red-900/10 border-red-500/20 text-red-400' : analysisResult.riskLevel === 'Medium' ? 'bg-amber-900/10 border-amber-500/20 text-amber-400' : 'bg-emerald-900/10 border-emerald-500/20 text-emerald-400'}`}>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Overall Risk</p>
                          <div className="text-3xl font-black flex items-center gap-2">{analysisResult.riskLevel} <AlertTriangle size={20} /></div>
                        </div>
                        <div className="p-5 rounded-2xl border bg-blue-900/10 border-blue-500/20 text-blue-400">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Clarity Score</p>
                          <div className="text-3xl font-black flex items-center gap-2">{analysisResult.accuracyScore}<span className="text-sm font-normal opacity-60">/100</span> <CheckCircle size={20} /></div>
                        </div>
                      </div>

                      {/* Issues */}
                      {analysisResult.missingClauses?.length > 0 && (
                        <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-5 space-y-3">
                          <h4 className="font-black text-red-400 text-xs uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle size={13} /> Critical Issues / Missing Clauses</h4>
                          <ul className="space-y-2">{analysisResult.missingClauses.map((c, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-red-500 font-bold shrink-0">•</span>{c}</li>)}</ul>
                        </div>
                      )}
                      {analysisResult.ambiguousClauses?.length > 0 && (
                        <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                          <h4 className="font-black text-amber-400 text-xs uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle size={13} /> Ambiguous / Risky Terms</h4>
                          <ul className="space-y-2">{analysisResult.ambiguousClauses.map((c, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-amber-500 font-bold shrink-0">•</span>{c}</li>)}</ul>
                        </div>
                      )}
                      {analysisResult.analysisText && (
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 prose prose-sm prose-invert max-w-none">
                          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3">Detailed Analysis</h4>
                          <ReactMarkdown>{analysisResult.analysisText}</ReactMarkdown>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature="Document Drafting Lab" />
      </div>
    </div>
  );
}
