import React from 'react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <h1 className="text-3xl md:text-4xl font-black text-emerald-950 uppercase tracking-tight mb-4">Shipping & Delivery Policy</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Last Updated: June 2026</p>

        <div className="prose prose-emerald prose-slate max-w-none text-slate-600 space-y-6">
          <p>
            At <strong>Namma Ooru Foods Pvt Ltd</strong>, we are committed to delivering fresh, authentic, organic, traditional, and locally sourced food products safely to our customers. This Shipping & Delivery Policy explains how orders are processed, packed, shipped, delivered, and handled in case of delay, failed delivery, damaged package, or serviceability issues.
          </p>
          <p>By placing an order on our website, you agree to the terms mentioned in this Shipping & Delivery Policy.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">1. Order Processing</h2>
          <p>Once an order is placed successfully, our team will review the order details, product availability, payment status, delivery address, and serviceability.</p>
          <p>Order processing usually includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Order confirmation</li>
            <li>Product availability check</li>
            <li>Packing and quality check</li>
            <li>Invoice generation</li>
            <li>Shipment handover to delivery partner or internal delivery team</li>
            <li>Order tracking update, where available</li>
          </ul>
          <p>Orders may be delayed or cancelled if the product is unavailable, payment is not confirmed, address details are incomplete, or the delivery location is not serviceable.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">2. Delivery Locations</h2>
          <p>We currently deliver to selected serviceable locations based on product category, courier availability, local delivery coverage, and operational feasibility.</p>
          <p>Some products, especially fresh, dairy, sweets, perishable, fragile, handmade, or temperature-sensitive items, may be available only in specific cities, pin codes, or delivery zones.</p>
          <p>If your location is not serviceable, we may cancel the order and process an eligible refund for prepaid orders as per our Refund Policy.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">3. Estimated Delivery Timeline</h2>
          <p>Estimated delivery timelines may vary depending on the product type, seller location, customer location, order volume, courier capacity, public holidays, weather conditions, and operational factors.</p>
          <p>General estimated timelines:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Local delivery:</strong> 1–3 business days</li>
            <li><strong>Within Tamil Nadu:</strong> 2–5 business days</li>
            <li><strong>Other Indian locations:</strong> 4–8 business days, where serviceable</li>
            <li><strong>Fresh, dairy, sweets, or perishable products:</strong> Delivery timelines may be shorter and location-specific</li>
          </ul>
          <p>The delivery timeline shown at checkout, order confirmation, or tracking page is only an estimate and not a guaranteed delivery date.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">4. Shipping Charges</h2>
          <p>Shipping charges, delivery fees, handling charges, packaging charges, COD charges, or convenience fees may apply depending on:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Order value</li>
            <li>Delivery location</li>
            <li>Product weight or volume</li>
            <li>Product category</li>
            <li>Seller/vendor location</li>
            <li>Delivery method</li>
            <li>Promotional offers</li>
          </ul>
          <p>Any applicable shipping or delivery charges will be shown during checkout before order confirmation.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">5. Packaging Standards</h2>
          <p>We take reasonable care to pack products safely and hygienically. Packaging may vary depending on the product category.</p>
          <p>Food, grocery, organic, traditional, handmade, bottled, liquid, fragile, or perishable products may require special packing to reduce the risk of leakage, breakage, contamination, or transit damage.</p>
          <p>Customers are advised not to accept visibly damaged, opened, leaking, or tampered packages where possible. If such a package is received, please report the issue immediately with photos or video proof.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">6. Delivery Attempts</h2>
          <p>Our delivery partner or internal delivery team may contact you before or during delivery.</p>
          <p>Customers are responsible for providing:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Correct full name</li>
            <li>Complete delivery address</li>
            <li>Accurate pin code</li>
            <li>Active mobile number</li>
            <li>Clear delivery instructions, if required</li>
            <li>Availability to receive the order</li>
          </ul>
          <p>If delivery fails due to incorrect address, unavailable recipient, unreachable phone number, locked premises, access restrictions, or customer refusal, the order may be returned, cancelled, or marked as failed delivery.</p>
          <p>Additional delivery charges may apply for reattempts, where applicable.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">7. Customer Responsibility at Delivery</h2>
          <p>At the time of delivery, customers are requested to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Check the package condition before accepting it</li>
            <li>Verify the number of packages received</li>
            <li>Report visible damage immediately</li>
            <li>Store food products as per label instructions</li>
            <li>Refrigerate or consume perishable products as advised</li>
            <li>Avoid keeping fresh, dairy, sweets, or ready-to-use items outside for long periods</li>
          </ul>
          <p>For food safety reasons, products once delivered must be handled and stored properly by the customer.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">8. Delayed Delivery</h2>
          <p>Delivery may be delayed due to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Product availability issues</li>
            <li>High order volume</li>
            <li>Weather conditions</li>
            <li>Public holidays</li>
            <li>Transport disruption</li>
            <li>Courier delay</li>
            <li>Local restrictions</li>
            <li>Incorrect or incomplete address</li>
            <li>Vendor fulfilment delay</li>
            <li>Force majeure events</li>
          </ul>
          <p>We will make reasonable efforts to update customers about significant delays. However, Namma Ooru Foods shall not be liable for delays caused by courier partners, customer unavailability, incorrect address, natural events, government restrictions, or circumstances beyond our control.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">9. Perishable and Fresh Product Delivery</h2>
          <p>Fresh, dairy, sweets, ready-to-use food, and other perishable products require timely delivery and immediate acceptance.</p>
          <p>Customers must ensure that someone is available to receive such products at the delivery address. If delivery fails due to customer unavailability or incorrect address, refund or replacement may not be applicable.</p>
          <p>Once delivered, perishable products must be stored and consumed as per the instructions provided on the product label or packaging.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">10. Marketplace Vendor Shipments</h2>
          <p>Some products listed on Namma Ooru Foods may be fulfilled directly by approved vendors, farmers, cooperatives, small businesses, home-based producers, or partner brands.</p>
          <p>In such cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The vendor may be responsible for packing and dispatching the product</li>
            <li>Delivery timelines may vary based on vendor location and product availability</li>
            <li>Product quality, packaging, and dispatch readiness may be verified by our team where applicable</li>
            <li>Namma Ooru Foods may coordinate between the customer, vendor, and delivery partner for order fulfilment</li>
          </ul>
          <p>Namma Ooru Foods reserves the right to cancel or modify vendor-fulfilled orders if the product is unavailable, delayed, damaged, incorrectly listed, or not suitable for delivery.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">11. Order Tracking</h2>
          <p>Where tracking is available, customers may receive order updates through website account, SMS, email, WhatsApp, phone call, or delivery partner tracking link.</p>
          <p>Tracking updates may not always be real-time and may depend on the courier or delivery partner’s system.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">12. Damaged, Missing, or Incorrect Delivery</h2>
          <p>If you receive a damaged package, wrong item, missing item, leaking product, expired product, or tampered package, please report the issue within the timeline mentioned in our Refund Policy.</p>
          <p>You may be required to provide:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Order ID</li>
            <li>Product name</li>
            <li>Photos or videos of the package and product</li>
            <li>Invoice or label image</li>
            <li>Batch number or expiry date, where applicable</li>
            <li>Unboxing video, where available</li>
          </ul>
          <p>Claims may be rejected if reported after the eligible timeline or if sufficient proof is not provided.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">13. Cancellation Before Dispatch</h2>
          <p>Customers may request cancellation before the order is packed or dispatched.</p>
          <p>Once the order is packed, dispatched, or out for delivery, cancellation may not be possible, especially for food, fresh, dairy, sweets, perishable, handmade, customized, or vendor-fulfilled products.</p>
          <p>Approved prepaid cancellations will be refunded as per our Refund Policy.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">14. Non-Delivery or Lost Shipment</h2>
          <p>If an order is confirmed as lost, undelivered, or not traceable due to logistics failure, we may offer a replacement, store credit, or refund after verification.</p>
          <p>Resolution will depend on product availability, delivery partner confirmation, and payment status.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">15. Delivery Charges Refund</h2>
          <p>Shipping charges, handling fees, convenience fees, COD charges, or payment gateway charges may not always be refundable.</p>
          <p>Delivery charges may be refunded only if the entire order is cancelled by us, the complete order is defective, or the issue is verified as caused by Namma Ooru Foods, vendor, or delivery partner.</p>

          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mt-8 mb-4">16. Contact for Shipping Support</h2>
          <p>For shipping, delivery, tracking, damaged package, missing item, or order-related support, please contact:</p>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-2">Namma Ooru Foods Pvt Ltd</h3>
            <p><strong>Address:</strong> 9, First Floor, Opp. Jayam Hospital,<br />Chokkikulam, Madurai,<br />Tamil Nadu - 625002</p>
            <p><strong>Phone:</strong> 9000 896 898</p>
            <p><strong>Email:</strong> info@nammaoorufoods.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
