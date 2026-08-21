'use client';

import { useState, useEffect } from 'react';
import { Truck, Save, Package, CheckCircle, ExternalLink, Printer, Download } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminTrackingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, mutate } = useSWR(
    `${API_URL}/api/orders?page=${currentPage}&limit=10`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [form, setForm] = useState({ carrierName: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('ALL');

  const { orders = [], totalPages = 1 } = data || {};

  const shippableOrders = orders.filter((o: any) => ['PROCESSING', 'PENDING', 'SHIPPED', 'DELIVERED'].includes(o.status));
  const filtered = shippableOrders.filter((o: any) => {
    if (activeTab === 'PROCESSING' && o.status !== 'PROCESSING') return false;
    if (activeTab === 'SHIPPED' && o.status !== 'SHIPPED') return false;
    if (activeTab === 'DELIVERED' && o.status !== 'DELIVERED') return false;
    return String(o.id).includes(searchTerm) || o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  // Compute display shipping fee for any order (matches invoice logic)
  const getOrderShipping = (order: any): number => {
    const stored = Number(order.shippingFees || order.deliveryFee || 0);
    if (stored > 0) return stored;
    // Derive from items weight: ceil(kg) x Rs50
    const items = order.items || order.orderItems || [];
    let kg = 0;
    items.forEach((item: any) => {
      const qty = Number(item.quantity || 0);
      const variantStr = item.variant || item.variantName || '';
      let wVal: number | null = null;
      let uVal = '';
      if (variantStr) {
        const m = variantStr.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gm|grams|kg|kgs|kilo|kilograms)/i);
        if (m) { wVal = parseFloat(m[1]); uVal = m[2]; }
      }
      if (!wVal && item.product) {
        wVal = item.product.weight ? Number(item.product.weight) : null;
        uVal = item.product.unit || 'g';
      }
      if (wVal && uVal) {
        const u = uVal.toLowerCase().trim();
        kg += u.startsWith('k') ? wVal * qty : (wVal / 1000) * qty;
      } else {
        kg += 0.5 * qty;
      }
    });
    return Math.max(1, Math.ceil(kg)) * 50;
  };


  useEffect(() => {
    if (!selectedOrderId) return;
    fetch(`${API_URL}/api/tracking/${selectedOrderId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setForm({
            carrierName: data.carrierName || '',
            trackingNumber: data.trackingNumber || '',
            trackingUrl: data.trackingUrl || '',
            estimatedDelivery: data.estimatedDelivery ? data.estimatedDelivery.slice(0, 16) : ''
          });
        } else {
          setForm({ carrierName: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' });
        }
      }).catch(() => setForm({ carrierName: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' }));
  }, [selectedOrderId]);

  const [markingDelivered, setMarkingDelivered] = useState(false);

  const handleMarkDelivered = async () => {
    if (!selectedOrderId) return;
    setMarkingDelivered(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${selectedOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' })
      });
      if (res.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Failed to mark delivered:', error);
    } finally {
      setMarkingDelivered(false);
    }
  };

  const handleSave = async () => {
    if (!selectedOrderId) return;
    setSaving(true); setSaved(false);
    try {
      await fetch(`${API_URL}/api/tracking/${selectedOrderId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      setSaved(true);
      mutate();
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const printShipmentLabel = (order: any) => {
    const addr = order.shippingAddress || {};
    const recipientName = addr.recipientName || addr.name || order.user?.name || 'Customer';
    const phone = addr.phone || order.user?.phone || '';
    const landmark = addr.line2 || '';
    const street = addr.line1 || '';
    const city = addr.city || '';
    const state = addr.state || 'Tamil Nadu';
    const pincode = addr.pincode || '';
    const orderIdStr = order.orderIdStr || `ORD-${String(order.id).padStart(6, '0')}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const itemsList = order.items || order.orderItems || [];
    const itemCount = itemsList.length;
    const paymentMethod = order.paymentMethod?.toLowerCase().includes('cod') ? 'COD' : 'PREPAID';

    // Automatically calculate package weight
    let totalWeightKg = 0;
    for (const item of itemsList) {
      const qty = Number(item.quantity) || 1;
      let wVal = null;
      let uVal = null;

      // 1. Try to parse from variantName first (e.g. "250g", "1 kg")
      if (item.variantName) {
        const match = item.variantName.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gm|grams|kg|kgs|kilo|kilograms)/i);
        if (match) {
          wVal = parseFloat(match[1]);
          uVal = match[2];
        }
      }

      // 2. Fallback to product weight and unit fields
      if ((wVal === null || wVal === undefined || wVal === 0) && item.product) {
        wVal = Number(item.product.weight);
        uVal = item.product.unit || 'g';
      }

      // 3. Fallback to parsing product name if product weight is missing
      if ((wVal === null || wVal === undefined || wVal === 0) && item.product?.name) {
        const match = item.product.name.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gm|grams|kg|kgs|kilo|kilograms)/i);
        if (match) {
          wVal = parseFloat(match[1]);
          uVal = match[2];
        }
      }

      if (wVal && uVal) {
        const normUnit = uVal.toLowerCase().trim();
        if (normUnit.startsWith('k') || normUnit.startsWith('kilo')) {
          totalWeightKg += wVal * qty;
        } else {
          totalWeightKg += (wVal / 1000) * qty;
        }
      }
    }

    const packageWeightStr = totalWeightKg > 0 ? `${totalWeightKg.toFixed(3)} Kg` : '— Kg';

    // Pre-generate barcode SVG inline (no popup script needed)
    const barcodeWidth = 120;
    const barcodeHeight = 32;
    let hash = 0;
    for (let i = 0; i < orderIdStr.length; i++) {
      hash = (hash << 5) - hash + orderIdStr.charCodeAt(i);
      hash |= 0;
    }
    let seed = Math.abs(hash || 12345);
    function seededRand() { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); }
    const bars: { x: number; w: number; black: boolean }[] = [];
    let cx = 0;
    bars.push({ x: cx, w: 2, black: true }); cx += 2;
    bars.push({ x: cx, w: 2, black: false }); cx += 2;
    for (let i = 0; i < 45; i++) {
      const w = Math.floor(seededRand() * 3) + 1;
      bars.push({ x: cx, w, black: i % 2 === 0 }); cx += w;
    }
    bars.push({ x: cx, w: 2, black: true }); cx += 2;
    const totalW = cx;
    const barcodeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${barcodeHeight}" style="display:block;margin:0 auto;">${
      bars.filter(b => b.black).map(b => `<rect x="${b.x}" y="0" width="${b.w}" height="${barcodeHeight}" fill="#000"/>`).join('')
    }</svg>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { alert('Please allow popups to print the label.'); return; }

    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Shipment Label - ${orderIdStr}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    @media print { 
      html, body { margin: 0; padding: 0; width: 100%; display: flex; justify-content: center; } 
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      color: #111;
      background: white;
      margin: 0;
    }
    .label-wrapper {
      width: 100mm;
      border: 2px solid #222;
      transform: scale(1.8);
      transform-origin: top center;
      margin: 0 auto;
      background: white;
    }

    /* ── HEADER ── */
    .label-header {
      display: flex;
      justify-content: center;
      align-items: center;
      background: white;
      border-bottom: 2.5px solid #222;
      padding: 8px 10px;
    }
    .label-header-img {
      height: 60px;
      width: auto;
      max-width: 100%;
      object-fit: contain;
    }
    .label-tagline {
      font-size: 9px;
      color: #000;
      font-weight: 700;
      margin-top: 2px;
      text-align: center;
      border-top: 1.5px solid #000;
      padding-top: 3px;
    }

    /* ── BODY TWO-COL ── */
    .label-body {
      display: grid;
      grid-template-columns: 55mm 1fr;
      border-bottom: 2px solid #222;
    }

    /* LEFT: SHIP TO */
    .ship-to-block {
      border-right: 2px solid #222;
      padding: 8px 8px 6px;
    }
    .ship-to-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #000;
      color: white;
      font-size: 9px;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .ship-to-name {
      font-size: 14px;
      font-weight: 900;
      color: #111;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .ship-to-addr {
      font-size: 12px;
      color: #111;
      line-height: 1.5;
      font-weight: 800;
    }
    .ship-to-divider {
      border-top: 1.5px dashed #bbb;
      margin: 6px 0;
    }
    .ship-to-meta {
      font-size: 9.5px;
      color: #333;
      font-weight: 600;
      line-height: 1.8;
    }
    .ship-to-meta span { color: #555; font-weight: 500; }
    .ship-to-meta span.bold-phone { color: #000; font-weight: 900; font-size: 11px; }

    /* RIGHT: ORDER INFO */
    .order-info-block { padding: 6px 7px; display: flex; flex-direction: column; gap: 0; }
    .order-info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 0;
      border-bottom: 1.5px solid #e5e5e5;
    }
    .order-info-row:last-child { border-bottom: none; }
    .order-info-icon { font-size: 14px; flex-shrink: 0; }
    .order-info-label { font-size: 8px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .order-info-value { font-size: 11px; font-weight: 900; color: #111; line-height: 1.1; }
    .order-info-value.red { color: #000; font-size: 14px; font-weight: 900; }
    .order-info-value.prepaid { color: #000; }

    /* TWO-CELL ROW */
    .order-two-cell {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1.5px solid #e5e5e5;
    }
    .order-cell {
      padding: 5px 0;
    }
    .order-cell:first-child { border-right: 1.5px solid #e5e5e5; }

    /* PINCODE + BARCODE ROW */
    .pin-bar-row {
      display: grid;
      grid-template-columns: 55mm 1fr;
      border-bottom: 2px solid #222;
    }
    .pincode-block {
      border-right: 2px solid #222;
      padding: 6px 8px;
    }
    .pincode-label {
      font-size: 8px;
      font-weight: 900;
      background: #000;
      color: white;
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .pincode-value {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #111;
      font-family: 'Courier New', monospace;
    }
    .barcode-block {
      padding: 6px 8px;
      text-align: center;
    }
    .barcode-label {
      font-size: 8px;
      font-weight: 900;
      background: #000;
      color: white;
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .barcode-graphic {
      height: 32px;
      width: 100%;
      display: flex;
      align-items: stretch;
      justify-content: center;
      background: white;
      margin-bottom: 2px;
      overflow: hidden;
    }
    .barcode-graphic div { flex-shrink: 0; }
    .barcode-id { font-size: 8px; font-weight: 700; color: #333; font-family: 'Courier New', monospace; }

    /* FOOTER */
    .label-footer {
      display: grid;
      grid-template-columns: 60mm 1fr;
    }
    .handling-icons {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 6px 6px;
      border-right: 1.5px dashed #bbb;
    }
    .handling-item { text-align: center; }
    .handling-icon { font-size: 18px; filter: grayscale(100%); }
    .handling-text { font-size: 7px; font-weight: 900; text-transform: uppercase; color: #000; margin-top: 1px; line-height: 1.1; }
    .return-block {
      padding: 6px 8px;
    }
    .return-title { font-size: 8px; font-weight: 700; color: #555; margin-bottom: 2px; }
    .return-name { font-size: 9px; font-weight: 900; color: #111; }
    .return-addr { font-size: 8px; color: #444; line-height: 1.5; font-weight: 500; }
  </style>
</head>
<body>
<div class="label-wrapper">

  <!-- HEADER -->
  <div class="label-header">
    <img class="label-header-img" src="/IMG_1890.PNG" alt="Namma Ooru Foods" onerror="this.style.display='none'" />
  </div>
  <div class="label-tagline">நம்ம ஊரு சுவை - உங்கள் இல்லம் தேடி!</div>

  <!-- BODY: SHIP TO + ORDER INFO -->
  <div class="label-body">
    <div class="ship-to-block">
      <div class="ship-to-badge"><b>SHIP TO</b></div>
      <div class="ship-to-name">${recipientName}</div>
      <div class="ship-to-addr">
        ${street ? street + ',<br/>' : ''}
        ${landmark ? landmark + ',<br/>' : ''}
        ${city ? city + ' - ' + pincode + ',<br/>' : ''}
        ${state}, India.
      </div>
      <div class="ship-to-divider"></div>
      <div class="ship-to-meta">
        Mobile &nbsp; : <span class="bold-phone">${phone ? '+91 ' + phone : 'N/A'}</span><br/>
        ${landmark ? 'Landmark : <span>' + landmark + '</span>' : ''}
      </div>
    </div>
    <div class="order-info-block">
      <div class="order-info-row">
        <div>
          <div class="order-info-label">Order ID</div>
          <div class="order-info-value red">${orderIdStr}</div>
        </div>
        <div style="margin-left:auto; text-align:right;">
          <div class="order-info-label">Order Date</div>
          <div class="order-info-value" style="font-size:9px;">${orderDate}</div>
        </div>
      </div>
      <div class="order-info-row">
        <div>
          <div class="order-info-label">Delivery Type</div>
          <div class="order-info-value prepaid">${paymentMethod}</div>
        </div>
      </div>
      <div class="order-two-cell">
        <div class="order-cell">
          <div class="order-info-label">Package Weight</div>
          <div class="order-info-value">${packageWeightStr}</div>
        </div>
        <div class="order-cell" style="padding-left:6px;">
          <div class="order-info-label">No. of Items</div>
          <div class="order-info-value">${itemCount}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PINCODE + BARCODE ROW -->
  <div class="pin-bar-row">
    <div class="pincode-block">
      <div class="pincode-label">PINCODE</div>
      <div class="pincode-value">${pincode || '——————'}</div>
    </div>
    <div class="barcode-block">
      <div class="barcode-label">BARCODE</div>
      <div class="barcode-graphic">${barcodeSvg}</div>
      <div class="barcode-id">${orderIdStr}</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="label-footer">
    <div class="handling-icons">
      <div class="handling-item">
        <div class="handling-icon">🤲</div>
        <div class="handling-text">HANDLE<br/>WITH CARE</div>
      </div>
      <div class="handling-item">
        <div class="handling-icon">🍷</div>
        <div class="handling-text">FRAGILE</div>
      </div>
      <div class="handling-item">
        <div class="handling-icon">&#9730;</div>
        <div class="handling-text">KEEP DRY</div>
      </div>
      <div class="handling-item">
        <div class="handling-icon">&#9650;</div>
        <div class="handling-text">THIS SIDE<br/>UP</div>
      </div>
    </div>
    <div class="return-block">
      <div class="return-title">If Undelivered, Please Return To:</div>
      <div class="return-name">NAMMA OORU FOODS PVT. LTD.,</div>
      <div class="return-addr">
        No.9, Abdul Kabharkhan Road,<br/>
        Chinna Chokkikulam, Madurai,<br/>
        Pin - 625 002 , Tamilnadu.
      </div>
    </div>
  </div>
</div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
    w.document.close();
  };


  const printAdminInvoice = (order: any) => {
    const items = order.items || order.orderItems || [];
    const storedShippingFee = Number(order.shippingFees || order.deliveryFee || 0);
    const orderIdStr = order.orderIdStr || `ORD-${String(order.id).padStart(4, '0')}`;

    let totalWeightKg = 0;
    items.forEach((item: any) => {
      const qty = Number(item.quantity || 0);
      let wVal = null;
      let uVal = null;

      // 1. Try parsing weight from variant (e.g. "250g", "1 kg")
      const variantStr = item.variant || item.variantName || '';
      if (variantStr) {
        const match = variantStr.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gm|grams|kg|kgs|kilo|kilograms)/i);
        if (match) {
          wVal = parseFloat(match[1]);
          uVal = match[2];
        }
      }

      // 2. Fallback to product weight and unit fields
      if ((wVal === null || wVal === undefined || wVal === 0) && item.product) {
        wVal = item.product.weight ? Number(item.product.weight) : null;
        uVal = item.product.unit || 'g';

        // 3. Fallback to parsing weight from product name
        if ((wVal === null || wVal === undefined || wVal === 0) && item.product.name) {
          const match = item.product.name.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gm|grams|kg|kgs|kilo|kilograms)/i);
          if (match) {
            wVal = parseFloat(match[1]);
            uVal = match[2];
          }
        }
      }

      if (wVal && uVal) {
        const normUnit = uVal.toLowerCase().trim();
        if (normUnit.startsWith('k') || normUnit.startsWith('kilo')) {
          totalWeightKg += wVal * qty;
        } else {
          totalWeightKg += (wVal / 1000) * qty;
        }
      } else {
        // Fallback: assume 0.5 kg (500g) per item if no weight can be parsed
        totalWeightKg += 0.5 * qty;
      }
    });

    // Compute display shipping fee: use stored value if > 0, else derive from weight
    // Formula: ceil(totalWeightKg) × ₹50 per kg (same as backend)
    const calculatedShippingFee = Math.max(1, Math.ceil(totalWeightKg)) * 50;
    const shippingFees = storedShippingFee > 0 ? storedShippingFee : calculatedShippingFee;

    // Subtotal = items value only (no shipping, no gst, no discount adjustment)
    const subtotal = Number(order.totalAmount) - Number(order.gstAmount || 0) - storedShippingFee + Number(order.discountAmount || 0);

    // Grand total adjusts for the shipping difference (computed vs. stored)
    const displayGrandTotal = Number(order.totalAmount) + (shippingFees - storedShippingFee);

    const itemRows = items.map((item: any, idx: number) => {
      const rate = Number(item.price || item.unitPrice || 0);
      const mrp = Number(item.product?.price || rate);
      const code = item.product?.productIdStr || item.product?.sku || `ITEM${String(item.productId || idx + 1).padStart(4, '0')}`;
      const variantDisplay = item.variant || item.variantName || item.product?.unit || '—';
      return `<tr style="border-bottom:1px solid #f1f5f9; color:#334155; font-weight:500;">
        <td style="padding:8px 4px;">${idx + 1}</td>
        <td style="padding:8px 4px; font-family:monospace;">${code}</td>
        <td style="padding:8px 4px; font-weight:700; color:#0f172a;">${item.product?.name || item.name || '—'}</td>
        <td style="padding:8px 4px; font-size:10px; color:#64748b; font-weight:600;">${variantDisplay}</td>
        <td style="padding:8px 4px; text-align:right; font-family:monospace;">${Number(item.quantity).toFixed(3)}</td>
        <td style="padding:8px 4px; text-align:right; font-family:monospace;">${mrp.toFixed(2)}</td>
        <td style="padding:8px 4px; text-align:right; font-family:monospace;">${rate.toFixed(2)}</td>
        <td style="padding:8px 4px; text-align:right; font-family:monospace; font-weight:700; color:#0f172a;">${(rate * item.quantity).toFixed(2)}</td>
      </tr>`;
    }).join('');

    const gstSection = Number(order.gstAmount || 0) > 0 ? `
      <div style="margin-bottom:24px;">
        <p style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">GST Details:</p>
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead><tr style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
            <th style="padding:6px 4px;font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;">GST%</th>
            <th style="padding:6px 4px;text-align:right;font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;">Taxable</th>
            <th style="padding:6px 4px;text-align:right;font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;">SGST</th>
            <th style="padding:6px 4px;text-align:right;font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;">CGST</th>
            <th style="padding:6px 4px;text-align:right;font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;">Total</th>
          </tr></thead>
          <tbody>
            <tr style="border-bottom:1px solid #f1f5f9;color:#334155;font-weight:600;">
              <td style="padding:6px 4px;font-family:monospace;">5.00%</td>
              <td style="padding:6px 4px;text-align:right;font-family:monospace;">${subtotal.toFixed(2)}</td>
              <td style="padding:6px 4px;text-align:right;font-family:monospace;">${(Number(order.gstAmount || 0) / 2).toFixed(2)}</td>
              <td style="padding:6px 4px;text-align:right;font-family:monospace;">${(Number(order.gstAmount || 0) / 2).toFixed(2)}</td>
              <td style="padding:6px 4px;text-align:right;font-family:monospace;font-weight:700;">${(subtotal + Number(order.gstAmount || 0)).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>` : '';

    const deliveryInfo = order.status === 'DELIVERED'
      ? `Delivered on ${new Date(order.deliveryDate || order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : `${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;

    const addr = order.shippingAddress || {};
    const recipientName = addr.recipientName || addr.name || order.user?.name || 'Customer';
    const phone = addr.phone || order.user?.phone || 'N/A';
    const addrLine = [addr.line1, addr.line2, addr.city ? `${addr.city} - ${addr.pincode}` : ''].filter(Boolean).join(', ');

    const w = window.open('', '_blank', 'width=900,height=800');
    if (!w) { alert('Please allow popups to print the invoice.'); return; }

    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice - ${orderIdStr}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    @media print {
      html, body { margin: 0; padding: 0; background: white; height: auto; }
      .invoice-wrap { min-height: 255mm; padding: 0.4cm 0.8cm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 12px; color: #1e293b; background: white; padding: 18px 24px; }
    table { width: 100%; border-collapse: collapse; }
    img { max-height: 24px; width: auto; }
  </style>
</head>
<body>
<div class="invoice-wrap">
  <div>
    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding-bottom:16px;margin-bottom:24px;">
      <img src="/logo.webp" alt="Namma Ooru Foods" onerror="this.style.display='none'" />
      <span style="font-size:14px;font-weight:900;color:#1e293b;">Namma Ooru Foods</span>
    </div>
    <p style="font-size:10px;color:#64748b;font-weight:700;text-align:center;margin-bottom:24px;">
      9, First Floor, Opp. Jayam Hospital Chokkikulam Madurai Tamil Nadu 625002<br/>Phone : 9000896898
    </p>

    <!-- Two-Col Meta -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #f1f5f9;">
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Order Number :</span>
          <p style="font-weight:900;font-size:14px;color:#1e293b;">${orderIdStr}</p></div>
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Bill Date :</span>
          <p style="font-weight:700;color:#334155;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div>
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Customer Details :</span>
          <p style="font-weight:900;color:#1e293b;">${recipientName}</p>
          <p style="font-weight:700;color:#475569;">${phone}</p></div>
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Operator :</span>
          <p style="font-weight:700;color:#334155;">Namma Ooru Foods</p></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Delivery Area :</span>
          <p style="font-weight:700;color:#334155;">${addr.state || 'Tamil Nadu'}</p></div>
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Delivery Address :</span>
          <p style="font-weight:700;color:#334155;line-height:1.6;">${addrLine}</p></div>
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Expected Delivery Time :</span>
          <p style="font-weight:700;color:#334155;">${deliveryInfo}</p></div>
        <div><span style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Payment Type :</span>
          <p style="font-weight:700;color:#334155;">${order.paymentMethod === 'Razorpay Online' ? 'Online Payment (Razorpay)' : order.paymentMethod || 'Online Payment'}</p></div>
      </div>
    </div>

    <!-- Items Table -->
    <div style="margin-bottom:24px;">
      <table>
        <thead><tr style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:left;width:36px;">No</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:left;width:80px;">Item Code</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:left;">Item</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:left;width:54px;">Weight</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:right;width:54px;">Qty</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:right;width:54px;">MRP</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:right;width:54px;">Rate</th>
          <th style="padding:10px 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;text-align:right;width:66px;">Amt</th>
        </tr></thead>
        <tbody>
          ${itemRows}
          <tr style="border-bottom:1px solid #f1f5f9;font-weight:600;color:#475569;font-size:11px;">
            <td colspan="4" style="padding:8px 4px;">Total Item(s): ${items.length}</td>
            <td colspan="3" style="padding:8px 4px;text-align:right;">Items Subtotal</td>
            <td style="padding:8px 4px;text-align:right;font-family:monospace;">₹${subtotal.toFixed(2)}</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;font-weight:600;color:#475569;font-size:11px;">
            <td colspan="4" style="padding:8px 4px;">Total Weight: ${totalWeightKg.toFixed(3)} kg</td>
            <td colspan="3" style="padding:8px 4px;text-align:right;">Shipping Charges</td>
            <td style="padding:8px 4px;text-align:right;font-family:monospace;">₹${shippingFees.toFixed(2)}</td>
          </tr>
          ${Number(order.gstAmount || 0) > 0 ? `
          <tr style="border-bottom:1px solid #f1f5f9;font-weight:600;color:#475569;font-size:11px;">
            <td colspan="4" style="padding:8px 4px;"></td>
            <td colspan="3" style="padding:8px 4px;text-align:right;">GST Amount</td>
            <td style="padding:8px 4px;text-align:right;font-family:monospace;">₹${Number(order.gstAmount).toFixed(2)}</td>
          </tr>` : ''}
          ${Number(order.discountAmount || 0) > 0 ? `
          <tr style="border-bottom:1px solid #f1f5f9;font-weight:600;color:#475569;font-size:11px;">
            <td colspan="4" style="padding:8px 4px;"></td>
            <td colspan="3" style="padding:8px 4px;text-align:right;">Discount</td>
            <td style="padding:8px 4px;text-align:right;font-family:monospace;">(-) ₹${Number(order.discountAmount).toFixed(2)}</td>
          </tr>` : ''}
          <tr style="border-bottom:1px solid #e2e8f0;font-weight:900;color:#0f172a;font-size:12px;">
            <td colspan="4" style="padding:12px 4px;">
              <span style="font-size:9px;font-weight:600;color:#94a3b8;font-style:italic;">* All Tax Included</span>
            </td>
            <td colspan="3" style="padding:12px 4px;text-align:right;">Grand Total (Incl. Taxes)</td>
            <td style="padding:12px 4px;text-align:right;font-family:monospace;">₹${displayGrandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${gstSection}

    <!-- Payment Summary -->
    <div style="border:1px dashed #cbd5e1;border-radius:0.75rem;padding:14px 20px;margin-bottom:12px;">
      <p style="font-size:9px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Payment Summary :</p>
      <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;color:#334155;font-size:11px;">
        <span>${order.paymentMethod === 'Razorpay Online' ? 'Online Payment (Razorpay)' : order.paymentMethod || 'Online Payment'}</span>
        <span style="font-family:monospace;">(-) ₹${displayGrandTotal.toFixed(2)}</span>
      </div>
      ${Number(order.discountAmount || 0) > 0 ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #f1f5f9;text-align:center;color:#047857;font-weight:900;font-size:11px;">You saved ₹${Number(order.discountAmount).toFixed(2)} !</div>` : ''}
    </div>
  </div>

  <!-- Footer always at bottom inside invoice-wrap -->
  <div style="text-align:center;padding-top:12px;border-top:1px solid #f1f5f9;font-size:10px;color:#94a3b8;font-weight:700;line-height:1.5;margin-top:8px;">
    Thank You! Shop Again<br/>9000896898
  </div>
</div>
<script>
  window.onload = function() { window.print(); };
</script>
</body>
</html>`);
    w.document.close();
  };

  const selectedOrder = orders.find((o: any) => o.id === selectedOrderId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Shipment <span className="text-emerald-600">Management</span></h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Assign carrier tracking details to orders and update shipment status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order List */}
        <div className={`${selectedOrderId ? 'hidden lg:block' : 'block'} lg:col-span-5 space-y-3`}>
          <div className="bg-white rounded-2xl border border-slate-100 px-5 py-3 flex items-center gap-3 shadow-sm">
            <Package className="h-4 w-4 text-slate-300" />
            <input type="text" placeholder="Search order ID or customer..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 text-sm font-bold outline-none text-[var(--admin-sidebar)] placeholder:text-slate-300 bg-transparent" />
          </div>
 
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PROCESSING', label: 'Processing' },
              { id: 'SHIPPED', label: 'Shipped' },
              { id: 'DELIVERED', label: 'Delivered' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedOrderId(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border
                  ${activeTab === tab.id 
                    ? 'bg-[var(--admin-sidebar)] text-white border-[var(--admin-sidebar)] shadow-md shadow-slate-900/10' 
                    : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:border-slate-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
 
          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                    <div className="h-5 w-16 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-12 bg-slate-100 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.map((order: any) => (
            <button key={order.id} id={`admin-track-order-${order.id}`} onClick={() => setSelectedOrderId(order.id)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${selectedOrderId === order.id ? 'border-[var(--admin-accent)] bg-amber-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{order.orderIdStr || `#${order.id}`}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg 
                  ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                    order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-amber-100 text-amber-700'}`}>
                  {order.status}
                </span>
              </div>
              <p className="font-black text-[var(--admin-sidebar)] text-sm mt-1">{order.user?.name || 'Customer'}</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-700 font-bold">₹{Number(order.totalAmount).toLocaleString()}</p>
                  <span className="text-[9px] text-slate-300">|</span>
                  <p className="text-[10px] text-blue-500 font-black">+₹{getOrderShipping(order)} ship</p>
                </div>
                <p className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </button>
          ))}
          {!isLoading && filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-300 font-bold text-sm">No orders available for tracking</div>
          )}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between px-2 text-xs font-semibold text-slate-400">
            <span>Page {currentPage} of {totalPages || 1}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="h-9 px-4 rounded-xl border border-slate-200 bg-white disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-[var(--admin-sidebar)] hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="h-9 px-4 rounded-xl border border-slate-200 bg-white disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-[var(--admin-sidebar)] hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        </div>
 
        {/* Tracking Form */}
        <div className={`${selectedOrderId ? 'block' : 'hidden lg:block'} lg:col-span-7`}>
          {selectedOrder ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white shrink-0"
                >
                  ← Back
                </button>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Truck className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-[var(--admin-sidebar)] text-base sm:text-lg truncate">{selectedOrder.orderIdStr || `#${selectedOrder.id}`} — Shipment Details</h3>
                  <p className="text-xs text-slate-400 font-medium truncate">{selectedOrder.user?.name} · ₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mt-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 inline-block">
                    Received: {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button id="print-label-btn-top" onClick={() => printShipmentLabel(selectedOrder)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[8px] font-black uppercase tracking-widest transition-all">
                    <Printer className="h-3 w-3" /> Print Label
                  </button>
                  <button id="download-invoice-btn-top" onClick={() => printAdminInvoice(selectedOrder)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[8px] font-black uppercase tracking-widest transition-all">
                    <Download className="h-3 w-3" /> Invoice
                  </button>
                </div>
              </div>

              {/* Delivery Details Card */}
              {selectedOrder.shippingAddress ? (
                <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-semibold text-slate-600 space-y-3 animate-in fade-in duration-300">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-black uppercase tracking-wider text-slate-400 text-[10px]">Customer Contact</span>
                    <span className="font-bold text-slate-800">{selectedOrder.user?.email && !selectedOrder.user.email.includes('@nammaoorufarms.local') ? selectedOrder.user.email : '—'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Recipient Name:</span>
                        <p className="text-sm font-black text-slate-800">{selectedOrder.shippingAddress.recipientName || selectedOrder.shippingAddress.name || 'Customer'}</p>
                      </div>
                      {(selectedOrder.shippingAddress.phone || selectedOrder.user?.phone) && (
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Contact Phone:</span>
                          <p className="text-slate-800 font-bold">{selectedOrder.shippingAddress.phone || selectedOrder.user?.phone}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Street Address:</span>
                        <p className="text-slate-800 font-bold leading-relaxed">{selectedOrder.shippingAddress.line1}</p>
                      </div>
                      {selectedOrder.shippingAddress.line2 && (
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Landmark / Area:</span>
                          <p className="text-slate-800 font-bold bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60 w-fit">{selectedOrder.shippingAddress.line2}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">City:</span>
                          <p className="text-slate-800 font-bold">{selectedOrder.shippingAddress.city}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Pincode:</span>
                          <p className="text-slate-800 font-bold">{selectedOrder.shippingAddress.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs font-bold text-amber-700 animate-in fade-in duration-300">
                  ⚠️ Shipping Address not found for this order.
                </div>
              )}
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                {[
                  { label: 'Carrier Name', key: 'carrierName', placeholder: 'Delhivery, Shiprocket, DTDC...' },
                  { label: 'Tracking Number', key: 'trackingNumber', placeholder: 'DL1234567890IN' },
                  { label: 'Tracking URL', key: 'trackingUrl', placeholder: 'https://www.delhivery.com/track...' },
                  { label: 'Estimated Delivery', key: 'estimatedDelivery', type: 'datetime-local' },
                ].map(field => (
                  <div key={field.key} className={field.key === 'trackingUrl' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">{field.label}</label>
                    <input type={field.type || 'text'} value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
                  </div>
                ))}
              </div>
 
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button id="save-tracking-btn" onClick={handleSave} disabled={saving}
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[var(--admin-sidebar)] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 w-full sm:w-auto">
                  {saved ? <><CheckCircle className="h-4 w-4 text-emerald-400" /> Saved!</> : saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save & Mark Shipped</>}
                </button>
                {selectedOrder.status !== 'DELIVERED' && (
                  <button id="mark-delivered-btn" onClick={handleMarkDelivered} disabled={markingDelivered}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 w-full sm:w-auto">
                    {markingDelivered ? 'Updating...' : <><CheckCircle className="h-4 w-4" /> Mark Delivered</>}
                  </button>
                )}

                {form.trackingUrl && (
                  <a href={form.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all w-full sm:w-auto">
                    Preview Link <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center h-full min-h-[400px] flex items-center justify-center">
              <div>
                <Truck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="font-black text-slate-300">Select an order from the list to assign tracking details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
